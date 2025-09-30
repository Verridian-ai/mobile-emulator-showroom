# Specification: Mobile Emulator Platform

## Feature Overview
A browser-based device emulator platform that allows developers to preview and test web applications across multiple device types (mobile phones, tablets, desktops) with real-time URL loading, device frame simulation, and development tool integrations.

## User Stories

### US-1: Device Selection
**As a** web developer
**I want to** quickly switch between different device emulations
**So that** I can test my application's responsiveness across devices

**Acceptance Criteria:**
- Device buttons organized by manufacturer (iPhone, Galaxy, Pixel, iPad, Desktop)
- Active device visually indicated
- Device switch completes in < 300ms
- Current URL persists across device changes
- Smooth animation transitions between devices

### US-2: URL Loading
**As a** developer
**I want to** load any URL into the device emulator
**So that** I can test external sites or my local development server

**Acceptance Criteria:**
- URL input accepts both http/https and auto-prefixes
- Enter key or button click loads URL
- Visual loading indicator during iframe load
- Error handling for failed loads (404, network errors)
- URL validation and sanitization for security

### US-3: Device Frame Accuracy
**As a** designer
**I want to** see accurate device bezels and screen dimensions
**So that** I can validate my designs match actual device appearances

**Acceptance Criteria:**
- Device frames match actual device aspect ratios
- Bezels, notches, rounded corners accurately represented
- Screen sizes based on actual device specs
- Scaling maintains aspect ratio
- Support for device-specific features (Dynamic Island, etc.)

### US-4: Responsive Interface
**As a** user on any device
**I want** the emulator platform itself to be responsive
**So that** I can use it on my laptop, tablet, or phone

**Acceptance Criteria:**
- Control panel adapts to viewport width
- Device frames scale appropriately on smaller screens
- Touch-friendly button sizes on mobile
- Readable text at all breakpoints
- No horizontal scrolling required

### US-5: Performance
**As a** developer
**I want** fast load times and smooth animations
**So that** my workflow isn't disrupted

**Acceptance Criteria:**
- Initial page load < 2 seconds
- Device switching < 300ms
- Animations run at 60fps
- No janky scrolling or input lag
- Efficient memory usage (< 200MB)

## Technical Requirements

### Frontend Architecture
- **Framework**: Vanilla JavaScript (consider modern framework for scaling)
- **Styling**: CSS custom properties for theming, glassmorphism design system
- **State Management**: Centralized state object for device/URL/settings
- **Component Structure**: Modular, reusable UI components

### Device Emulation
- **Supported Devices**:
  - iPhone: 6, 7, 8, X, 11, 12, 13, 14, 14 Pro, 15, 15 Pro, 16 Pro
  - Galaxy: S7, S10, S21, S22, S24, S25 Ultra
  - Pixel: 3, 5, 7, 8, 9 Pro
  - iPad: Air 2022, Pro 13" M4
  - Desktop: Chrome browser simulation
- **Frame Elements**: Bezels, notches, buttons, cameras, Dynamic Island
- **Viewport Dimensions**: Accurate width x height for each device
- **Scaling**: Responsive scaling based on container size

### Server Infrastructure
- **Type**: Node.js Express static server
- **Port**: Configurable (default 4175)
- **Endpoints**:
  - `/` - Serve index.html
  - `/healthz` - Health check JSON
  - Static file serving from `/public`
- **Headers**: CORS, Cache-Control, Security headers

### Integration Capabilities (Optional)
- **WebSocket Broker**: Real-time communication with external tools
- **Screenshot Capture**: Programmatic screenshot API
- **CLI Bridge**: Command-line integration for automation
- **Collaboration**: Multi-user session support
- **Element Inspection**: DOM analysis and selection tools

### Security Requirements
- **CSP**: Strict Content Security Policy
- **Iframe Sandbox**: `allow-scripts allow-same-origin allow-forms`
- **Input Sanitization**: URL validation, XSS prevention
- **HTTPS**: Enforce HTTPS in production
- **Authentication**: Token-based auth for WebSocket connections

## Non-Functional Requirements

### Performance Targets
- **Time to Interactive**: < 2 seconds
- **First Contentful Paint**: < 1 second
- **Device Switch Time**: < 300ms
- **Frame Rate**: 60fps sustained
- **Bundle Size**: < 500KB (JS + CSS combined)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Accessibility
- **WCAG Level**: AA compliance
- **Keyboard Navigation**: Full keyboard control
- **Screen Readers**: ARIA labels on all interactive elements
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Indicators**: Visible focus states

### Scalability
- Support 50+ concurrent device emulations (future)
- Pluggable device definition system
- Extensible integration framework

## Current Implementation Analysis

### What Works
✅ Basic device emulation with iframe rendering
✅ URL input and loading functionality
✅ Device frame CSS with accurate dimensions
✅ Express server serving static files
✅ Beautiful glassmorphism UI design
✅ Responsive control panel layout

### What Needs Improvement
⚠️ **Asset Optimization**: 37MB video, 18MB+ images causing slow loads
⚠️ **Code Organization**: 67+ JS files with significant duplication
⚠️ **Build Process**: No bundling, minification, or tree-shaking
⚠️ **Security**: Inline scripts, weak CSP, input validation gaps
⚠️ **Testing**: Zero test coverage
⚠️ **Documentation**: Missing API docs, component guides
⚠️ **Type Safety**: No TypeScript or JSDoc annotations
⚠️ **Error Handling**: Limited error states and recovery

### What's Broken/Unused
❌ Multiple integration bridge implementations (only need one)
❌ WebSocket broker connection fails (no server running)
❌ Particle effects causing performance issues
❌ Unused agent files (50+ files not loaded by index.html)
❌ Desktop Chrome browser header not fully implemented
❌ Collaboration features incomplete

## Dependencies

### Current
- **express** ^4.19.2: Web server

### Recommended Additions
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **vitest**: Unit testing framework
- **playwright**: E2E testing
- **eslint**: Code linting
- **prettier**: Code formatting

## Out of Scope (for initial specification)
- Real device testing (actual devices, BrowserStack integration)
- Video recording of sessions
- Advanced debugging tools (console, network inspector)
- Custom device definitions by users
- Multi-user real-time collaboration
- Screenshot diffing/visual regression testing

## Future Considerations
- Framework migration (React, Vue, Svelte)
- Backend API for saving configurations
- User accounts and saved device sets
- Integration with design tools (Figma, Sketch)
- Performance profiling tools
- Automated accessibility testing
- Mobile app wrapper (Electron, Tauri)

## Questions for Clarification
1. Is the WebSocket broker integration required, or can it be removed?
2. Are the collaboration features actively used?
3. What is the target audience (solo devs, teams, enterprises)?
4. Should we support custom device definitions?
5. Is offline functionality required?
6. What analytics/telemetry is needed?

## Success Criteria
This feature will be considered successful when:
1. ✅ Initial page load completes in < 2 seconds
2. ✅ All 23 device emulations render accurately
3. ✅ Device switching is smooth (< 300ms, 60fps)
4. ✅ URLs load securely with proper validation
5. ✅ Lighthouse performance score > 90
6. ✅ Zero critical security vulnerabilities
7. ✅ 80%+ test coverage on core functionality
8. ✅ WCAG AA accessibility compliance
9. ✅ Works flawlessly in Chrome, Firefox, Safari, Edge
10. ✅ Bundle size < 500KB