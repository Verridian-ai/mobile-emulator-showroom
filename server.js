// Load environment variables first
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  helmetConfig,
  rateLimiter,
  sanitizeRequest,
  httpsRedirect,
  handleCspViolation,
  getCspViolationStats
} = require('./server/middleware/security');

const {
  validateUrl,
  urlValidationRateLimiter,
  iframeSecurityHeaders,
  getFailedAttemptsStats
} = require('./server/middleware/url-validation');

const { URLValidator } = require('./server/validators/url-validator');

const app = express();
const port = Number(process.env.PORT || process.env.SHOWROOM_PORT || 4175);

// Enhanced error handling and logging
console.log('🚀 Starting Verridian Showroom Server...');
console.log('📁 Public directory:', path.join(__dirname, 'public'));
console.log('🌐 Server port:', port);
console.log('🔒 Security: Helmet + Rate Limiting enabled');
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Check if public directory exists
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  console.log('✅ Public directory found');
  const files = fs.readdirSync(publicDir);
  console.log(`📄 Found ${files.length} files in public directory`);
} else {
  console.error('❌ Public directory not found!');
}

// ============================================================================
// SECURITY MIDDLEWARE - Applied First (Defense in Depth)
// ============================================================================

// 1. HTTPS redirect in production
app.use(httpsRedirect);

// 2. Security headers (Helmet: CSP, HSTS, X-Frame-Options, etc.)
app.use(helmetConfig);

// 3. Rate limiting to prevent abuse
app.use(rateLimiter);

// 4. Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Input sanitization middleware
app.use(sanitizeRequest);

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    publicDir: fs.existsSync(publicDir),
    files: fs.existsSync(publicDir) ? fs.readdirSync(publicDir).length : 0
  });
});

// ============================================================================
// URL VALIDATION ENDPOINTS
// ============================================================================

/**
 * POST /api/validate-url
 * Validates a URL before loading in iframe
 *
 * Request body: { url: string }
 * Response: { valid: boolean, sanitized: string, errors: array }
 */
app.post('/api/validate-url',
  urlValidationRateLimiter,
  validateUrl({ urlField: 'url', required: true, source: 'body' }),
  (req, res) => {
    // URL is valid if we reach here (middleware validates)
    res.json({
      valid: true,
      url: req.validatedUrl,
      original: req.urlValidation.original,
      warnings: req.urlValidation.warnings
    });
  }
);

/**
 * POST /api/load-url
 * Load URL in iframe (with validation)
 *
 * Request body: { url: string }
 * Response: { success: boolean, url: string }
 */
app.post('/api/load-url',
  urlValidationRateLimiter,
  validateUrl({ urlField: 'url', required: true, source: 'body' }),
  iframeSecurityHeaders,
  (req, res) => {
    // Return validated URL for iframe loading
    res.json({
      success: true,
      url: req.validatedUrl,
      timestamp: new Date().toISOString()
    });
  }
);

/**
 * POST /api/csp-report
 * CSP violation reporting endpoint
 * Receives reports from browser when CSP is violated
 *
 * Note: Body must be parsed as JSON with type 'application/csp-report'
 */
app.post('/api/csp-report',
  express.json({ type: ['application/json', 'application/csp-report'] }),
  handleCspViolation
);

/**
 * GET /api/security-stats
 * Get security statistics (for monitoring)
 * Protected endpoint - add authentication in production
 */
app.get('/api/security-stats', (req, res) => {
  // In production, add authentication middleware here
  const urlStats = getFailedAttemptsStats();
  const cspStats = getCspViolationStats();

  res.json({
    urlValidation: urlStats,
    csp: cspStats,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// STATIC FILE SERVING
// ============================================================================

// Enhanced static file serving with security and caching
app.use(express.static(publicDir, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Cache control for different file types
    if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
      res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
    } else if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.svg')) {
      res.set('Cache-Control', 'public, max-age=86400'); // 24 hours
    } else if (filePath.endsWith('.woff') || filePath.endsWith('.woff2')) {
      res.set('Cache-Control', 'public, max-age=604800'); // 7 days
    }

    console.log(`📤 Serving: ${filePath}`);
  }
}));

// Handle 404s for missing files
app.use((req, res, next) => {
  console.log(`❌ File not found: ${req.url}`);
  res.status(404).json({ error: 'File not found', path: req.url });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Error handler - Never expose stack traces in production
app.use((err, req, res, next) => {
  console.error('🚨 Server error:', err);

  // Log full error details server-side
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack trace:', err.stack);
  }

  // Send generic error to client (don't leak sensitive info)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Showroom listening on http://0.0.0.0:${port}`);
  console.log(`🌍 Access at: http://localhost:${port}`);
  console.log('🎬 Ready for device emulation testing!');
});

