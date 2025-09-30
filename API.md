# API Documentation

## Overview

The Mobile Emulator Platform provides a simple HTTP API for serving the device emulation interface and a programmatic JavaScript API for integration.

## Table of Contents

- [HTTP API](#http-api)
- [JavaScript API](#javascript-api)
- [Security Config API](#security-config-api)
- [URL Validator API](#url-validator-api)
- [Performance Monitor API](#performance-monitor-api)
- [WebSocket Protocol](#websocket-protocol-future)

---

## HTTP API

### Base URL

```
Development: http://localhost:4175
Production:  https://your-domain.com
```

### Endpoints

#### GET /

**Description**: Serves the main application HTML

**Response**: `200 OK`
```html
<!DOCTYPE html>
<html>
  <!-- Mobile Emulator Platform -->
</html>
```

**Headers**:
```
Content-Type: text/html; charset=utf-8
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

---

#### GET /health

**Description**: Health check endpoint for monitoring

**Response**: `200 OK`
```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2025-10-01T12:34:56.789Z",
  "version": "1.0.0"
}
```

**Response**: `503 Service Unavailable` (if unhealthy)
```json
{
  "status": "error",
  "message": "Service unavailable"
}
```

---

#### GET /assets/:filename

**Description**: Serves static assets (JS, CSS, images, fonts)

**Example**: `GET /assets/js/minimal-[hash].js`

**Response**: `200 OK`
```javascript
// Minified JavaScript content
```

**Headers**:
```
Content-Type: application/javascript; charset=utf-8
Cache-Control: public, max-age=31536000, immutable
Content-Encoding: gzip  (if .gz file)
Content-Encoding: br    (if .br file)
```

**Cache Strategy**:
- Static assets have content-based hashes in filenames
- Long-lived cache (1 year) with `immutable`
- Pre-compressed versions (.gz, .br) served automatically

---

## JavaScript API

### Device Emulator API

#### `DeviceEmulator.switchDevice(deviceId)`

**Description**: Switches to a different device emulation

**Parameters**:
- `deviceId` (string): Device identifier (e.g., 'iphone-14-pro', 'galaxy-s24')

**Returns**: `Promise<void>`

**Throws**: `Error` if device ID is invalid

**Example**:
```javascript
import DeviceEmulator from './src/js/minimal.js';

// Switch to iPhone 14 Pro
await DeviceEmulator.switchDevice('iphone-14-pro');

// Switch to Galaxy S24
await DeviceEmulator.switchDevice('galaxy-s24');
```

**Supported Device IDs**:
- `iphone-14-pro` - iPhone 14 Pro (393×852, 3x)
- `galaxy-s24` - Samsung Galaxy S24 (360×780, 3x)
- `pixel-8-pro` - Google Pixel 8 Pro (412×892, 2.625x)
- `ipad-pro` - iPad Pro 12.9" (1024×1366, 2x)
- `desktop` - Desktop (1920×1080, 1x)

---

#### `DeviceEmulator.loadURL(url)`

**Description**: Loads a URL into the current device emulator

**Parameters**:
- `url` (string): URL to load (must be valid http/https)

**Returns**: `Promise<void>`

**Throws**: `InvalidURLError` if URL is invalid or disallowed

**Example**:
```javascript
// Load HTTPS URL
await DeviceEmulator.loadURL('https://example.com');

// Load HTTP URL
await DeviceEmulator.loadURL('http://localhost:3000');

// Invalid - throws error
await DeviceEmulator.loadURL('javascript:alert(1)');
// Throws: InvalidURLError('Disallowed protocol: javascript:')
```

---

#### `DeviceEmulator.getCurrentDevice()`

**Description**: Returns the currently active device

**Returns**: `object`
```javascript
{
  id: 'iphone-14-pro',
  name: 'iPhone 14 Pro',
  width: 393,
  height: 852,
  pixelRatio: 3,
  category: 'iphone'
}
```

**Example**:
```javascript
const device = DeviceEmulator.getCurrentDevice();
console.log(`Current device: ${device.name} (${device.width}×${device.height})`);
```

---

#### `DeviceEmulator.getAvailableDevices()`

**Description**: Returns list of all available devices

**Returns**: `Array<object>`

**Example**:
```javascript
const devices = DeviceEmulator.getAvailableDevices();

devices.forEach(device => {
  console.log(`${device.name}: ${device.width}×${device.height}`);
});

// Output:
// iPhone 14 Pro: 393×852
// Galaxy S24: 360×780
// Pixel 8 Pro: 412×892
// iPad Pro: 1024×1366
// Desktop: 1920×1080
```

---

### Security Config API

#### `SecurityConfig.validateURL(url, options)`

**Description**: Validates and sanitizes a user-provided URL

**Parameters**:
- `url` (string): URL to validate
- `options` (object, optional):
  - `allowLocalhost` (boolean): Allow localhost URLs (default: `false` in production, `true` in development)
  - `allowedProtocols` (array): Allowed protocols (default: `['http:', 'https:', 'ws:', 'wss:']`)

**Returns**: `string` - Sanitized URL

**Throws**: `InvalidURLError` if URL is invalid

**Example**:
```javascript
import SecurityConfig from './src/js/security-config.js';

// Valid HTTPS URL
const url1 = SecurityConfig.validateURL('https://example.com');
// Returns: 'https://example.com/'

// Valid HTTP URL
const url2 = SecurityConfig.validateURL('http://example.com');
// Returns: 'http://example.com/'

// Valid WebSocket URL
const url3 = SecurityConfig.validateURL('wss://example.com/socket');
// Returns: 'wss://example.com/socket'

// Invalid protocol
SecurityConfig.validateURL('javascript:alert(1)');
// Throws: InvalidURLError('Disallowed protocol: javascript:')

// Malformed URL
SecurityConfig.validateURL('not a url');
// Throws: InvalidURLError('Invalid URL format')

// Localhost (development only)
const url4 = SecurityConfig.validateURL('http://localhost:3000', {
  allowLocalhost: true
});
// Returns: 'http://localhost:3000/'
```

---

#### `SecurityConfig.sanitizeHTML(html)`

**Description**: Sanitizes HTML to prevent XSS attacks

**Parameters**:
- `html` (string): HTML string to sanitize

**Returns**: `string` - Sanitized HTML (safe for insertion)

**Example**:
```javascript
import SecurityConfig from './src/js/security-config.js';

// Remove script tags
const html1 = SecurityConfig.sanitizeHTML('<p>Hello</p><script>alert(1)</script>');
// Returns: '<p>Hello</p>'

// Remove event handlers
const html2 = SecurityConfig.sanitizeHTML('<img src="x" onerror="alert(1)">');
// Returns: '<img src="x">'

// Allow safe HTML
const html3 = SecurityConfig.sanitizeHTML('<p><strong>Bold</strong> text</p>');
// Returns: '<p><strong>Bold</strong> text</p>'
```

---

#### `SecurityConfig.escapeInput(input)`

**Description**: Escapes special HTML characters in user input

**Parameters**:
- `input` (string): User input to escape

**Returns**: `string` - Escaped string (safe for display)

**Example**:
```javascript
import SecurityConfig from './src/js/security-config.js';

const userInput = '<script>alert("XSS")</script>';
const escaped = SecurityConfig.escapeInput(userInput);

console.log(escaped);
// Output: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'

// Safe to insert into HTML
document.getElementById('output').textContent = escaped;
```

---

### URL Validator API

#### `validateURL(url, options)`

**Description**: Core URL validation function (used by SecurityConfig)

**Location**: `src/core/validators/url-validator.js`

**Parameters**:
- `url` (string): URL to validate
- `options` (object, optional):
  - `allowLocalhost` (boolean): Allow localhost/127.0.0.1
  - `debugMode` (boolean): Enable debug logging

**Returns**: `string` - Sanitized URL

**Throws**: `InvalidURLError` with descriptive message

**Example**:
```javascript
import { validateURL, InvalidURLError } from './src/core/validators/url-validator.js';

try {
  const safeUrl = validateURL('https://example.com');
  console.log('Valid URL:', safeUrl);
} catch (error) {
  if (error instanceof InvalidURLError) {
    console.error('Invalid URL:', error.message);
    // Show user-friendly error to user
  }
}
```

**Error Codes**:
```javascript
// Disallowed protocol
InvalidURLError: 'Disallowed protocol: javascript:'

// Malformed URL
InvalidURLError: 'Invalid URL format'

// Empty URL
InvalidURLError: 'URL cannot be empty'

// Non-localhost in debug mode
InvalidURLError: 'Only localhost URLs allowed in debug mode'
```

---

### Performance Monitor API

#### `PerformanceMonitor.start()`

**Description**: Starts performance monitoring

**Returns**: `void`

**Example**:
```javascript
import PerformanceMonitor from './src/js/performance-monitor.js';

PerformanceMonitor.start();
```

---

#### `PerformanceMonitor.getMetrics()`

**Description**: Returns current performance metrics

**Returns**: `object`
```javascript
{
  loadTime: 1234,              // ms since page load
  fcp: 450,                    // First Contentful Paint (ms)
  tti: 1800,                   // Time to Interactive (ms)
  fps: 60,                     // Current frames per second
  memory: {
    usedJSHeapSize: 12345678,  // Bytes
    totalJSHeapSize: 23456789,
    jsHeapSizeLimit: 2197815296
  }
}
```

**Example**:
```javascript
const metrics = PerformanceMonitor.getMetrics();

console.log(`Load Time: ${metrics.loadTime}ms`);
console.log(`FCP: ${metrics.fcp}ms`);
console.log(`TTI: ${metrics.tti}ms`);
console.log(`FPS: ${metrics.fps}`);
console.log(`Memory: ${(metrics.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
```

---

#### `PerformanceMonitor.measureDeviceSwitch(callback)`

**Description**: Measures device switch performance

**Parameters**:
- `callback` (function): Function to measure

**Returns**: `Promise<number>` - Duration in milliseconds

**Example**:
```javascript
const duration = await PerformanceMonitor.measureDeviceSwitch(async () => {
  await DeviceEmulator.switchDevice('galaxy-s24');
});

console.log(`Device switch took ${duration}ms`);
// Output: Device switch took 287ms

if (duration > 300) {
  console.warn('Device switch exceeded 300ms target (Article II violation)');
}
```

---

## WebSocket Protocol (Future)

**Status**: Planned for Phase 2

**Purpose**: Real-time communication for collaboration features

### Connection

```javascript
const ws = new WebSocket('wss://your-domain.com/socket');

ws.addEventListener('open', () => {
  console.log('WebSocket connected');
});
```

### Authentication

```javascript
// Send authentication token
ws.send(JSON.stringify({
  type: 'auth',
  token: 'YOUR_JWT_TOKEN'
}));

// Receive auth response
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'auth_success') {
    console.log('Authenticated');
  }
});
```

### Message Types

#### Device Switch Broadcast

```javascript
// Send
ws.send(JSON.stringify({
  type: 'device_switch',
  deviceId: 'iphone-14-pro',
  userId: 'user123'
}));

// Receive
{
  type: 'device_switch',
  deviceId: 'iphone-14-pro',
  userId: 'user456',
  timestamp: 1696176000000
}
```

#### Screenshot Share

```javascript
// Send
ws.send(JSON.stringify({
  type: 'screenshot',
  imageData: 'base64...',
  deviceId: 'galaxy-s24',
  userId: 'user123'
}));

// Receive
{
  type: 'screenshot',
  imageData: 'base64...',
  deviceId: 'galaxy-s24',
  userId: 'user456',
  timestamp: 1696176000000
}
```

---

## Error Handling

### Error Types

#### `InvalidURLError`

**When**: URL validation fails
**Properties**:
- `message` (string): Human-readable error message
- `url` (string): The invalid URL
- `code` (string): Error code (e.g., 'DISALLOWED_PROTOCOL')

**Example**:
```javascript
import { InvalidURLError } from './src/core/validators/url-validator.js';

try {
  validateURL('javascript:alert(1)');
} catch (error) {
  if (error instanceof InvalidURLError) {
    console.error(`URL Error: ${error.message}`);
    console.error(`Invalid URL: ${error.url}`);
    console.error(`Error Code: ${error.code}`);
  }
}
```

---

## Rate Limiting

**Endpoint**: All HTTP endpoints
**Limit**: 100 requests per 15 minutes per IP
**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696176000
```

**Response** (when limit exceeded):
```json
{
  "error": "Too many requests",
  "retryAfter": 900
}
```

**Status Code**: `429 Too Many Requests`

---

## Authentication (Future)

**Status**: Planned for Phase 2

**Method**: JWT (JSON Web Tokens)

**Flow**:
1. User logs in → Receives JWT
2. Client includes JWT in requests
3. Server validates JWT
4. Access granted/denied

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## CORS Policy

**Allowed Origins**:
- Development: `http://localhost:*`
- Production: Configured via environment variable

**Allowed Methods**: `GET`, `POST`, `OPTIONS`

**Allowed Headers**: `Content-Type`, `Authorization`

**Credentials**: Allowed

---

## Versioning

**Current Version**: 1.0.0

**Versioning Strategy**: Semantic Versioning (semver)
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

**API Stability**: The JavaScript API is stable as of 1.0.0. HTTP API may evolve with backward compatibility.

---

## Examples

### Complete Integration Example

```javascript
import DeviceEmulator from './src/js/minimal.js';
import SecurityConfig from './src/js/security-config.js';
import PerformanceMonitor from './src/js/performance-monitor.js';

// Initialize performance monitoring
PerformanceMonitor.start();

// Validate user input
const urlInput = document.getElementById('url-input').value;
let validatedUrl;

try {
  validatedUrl = SecurityConfig.validateURL(urlInput);
} catch (error) {
  alert(`Invalid URL: ${error.message}`);
  return;
}

// Measure device switch performance
const switchDuration = await PerformanceMonitor.measureDeviceSwitch(async () => {
  await DeviceEmulator.switchDevice('iphone-14-pro');
});

console.log(`Device switched in ${switchDuration}ms`);

// Load URL
await DeviceEmulator.loadURL(validatedUrl);

// Get metrics
const metrics = PerformanceMonitor.getMetrics();
console.log('Performance Metrics:', metrics);

// Check constitution compliance (Article II: < 300ms)
if (switchDuration > 300) {
  console.warn('⚠️ Device switch exceeded 300ms target');
} else {
  console.log('✅ Device switch within 300ms target');
}
```

---

## Support

**Issues**: https://github.com/Verridian-ai/mobile-emulator-showroom/issues
**Discussions**: https://github.com/Verridian-ai/mobile-emulator-showroom/discussions

---

**API Version**: 1.0
**Last Updated**: 2025-10-01
**Status**: Living document