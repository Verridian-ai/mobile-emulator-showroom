/**
 * Security Middleware Configuration
 * Mobile Emulator Platform - Backend Security Layer
 *
 * Implements defense-in-depth security strategy:
 * - Helmet for HTTP security headers (CSP, HSTS, X-Frame-Options)
 * - Rate limiting to prevent abuse (100 req/15min per IP)
 * - Input validation and sanitization helpers
 *
 * Constitutional Compliance:
 * - Article V (Security): XSS prevention, secure headers, rate limiting
 * - Article I (Architecture): Modular middleware design
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
const crypto = require('crypto');

/**
 * CSP Violation Log (in-memory for development, use database in production)
 * Tracks CSP violations for monitoring and debugging
 */
const cspViolations = [];
const MAX_VIOLATIONS_STORED = 100;

/**
 * Generate cryptographic nonce for CSP
 * @returns {string} - Base64 encoded nonce
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * CSP Nonce Middleware
 * Generates a unique nonce per request for inline scripts/styles
 * Usage in templates: <script nonce="${res.locals.cspNonce}">
 */
const cspNonce = (req, res, next) => {
  res.locals.cspNonce = generateNonce();
  next();
};

/**
 * Helmet Configuration - Security Headers
 *
 * CSP Strategy (Strict Mode):
 * - No unsafe-inline, no unsafe-eval (prevents XSS attacks)
 * - Only allow same-origin scripts/styles
 * - Nonce-based inline scripts (for legitimate use cases)
 * - Restrict frame ancestors to prevent clickjacking
 * - Connect to same-origin + WebSocket (localhost for development)
 * - Violation reporting enabled for monitoring
 *
 * Task 1.6: Enhanced CSP with nonce support and reporting
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Scripts: same-origin only (no inline, no eval, no unsafe)
      scriptSrc: [
        "'self'",
        // Nonce support for legitimate inline scripts if needed
        // (req, res) => `'nonce-${res.locals.cspNonce}'`
      ],
      // Styles: same-origin only (no inline unless nonce)
      styleSrc: [
        "'self'",
        // Nonce support for legitimate inline styles if needed
        // (req, res) => `'nonce-${res.locals.cspNonce}'`
      ],
      // Images: self + data URIs + HTTPS (for external images in iframes)
      imgSrc: ["'self'", "data:", "https:"],
      // Connect: self + WebSocket (localhost for dev, configure for prod)
      connectSrc: [
        "'self'",
        "ws://localhost:7071", // WebSocket broker (dev)
        "wss://localhost:7071" // WebSocket broker (dev, HTTPS)
        // TODO: Add production WebSocket URL from environment variable
      ],
      // Fonts: same-origin only
      fontSrc: ["'self'"],
      // No plugins (Flash, Java, etc.)
      objectSrc: ["'none'"],
      // Media: same-origin only
      mediaSrc: ["'self'"],
      // Iframes: same-origin only (for device emulator)
      frameSrc: ["'self'"],
      // Prevent embedding this app in iframes
      frameAncestors: ["'none'"],
      // Base URI restrictions
      baseUri: ["'self'"],
      // Form actions: same-origin only
      formAction: ["'self'"],
      // Force HTTPS for all requests (production)
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      // Report CSP violations to this endpoint
      reportUri: ['/api/csp-report']
    },
    // Report-only mode for testing (set to false for enforcement)
    reportOnly: false
  },
  // Strict Transport Security - Force HTTPS in production
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  // Prevent MIME type sniffing
  noSniff: true,
  // Disable X-Powered-By header (don't advertise Express)
  hidePoweredBy: true,
  // Prevent clickjacking
  frameguard: {
    action: 'deny'
  },
  // XSS protection (legacy browsers)
  xssFilter: true
});

/**
 * Rate Limiting Configuration
 *
 * Prevents abuse and DoS attacks:
 * - 100 requests per 15 minutes per IP address
 * - Applies to all endpoints globally
 * - Returns 429 Too Many Requests when exceeded
 *
 * Production Note: Consider using Redis store for distributed rate limiting
 * across multiple server instances
 */
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/healthz' || req.path === '/health'
});

/**
 * Stricter rate limiter for authentication/sensitive endpoints
 * 10 requests per 15 minutes
 */
const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Input Validation Helpers
 *
 * Provides sanitization and validation utilities to prevent injection attacks
 */
const inputValidation = {
  /**
   * Sanitize string input to prevent XSS
   * @param {string} input - User input to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeString: (input) => {
    if (typeof input !== 'string') return '';
    return validator.escape(validator.trim(input));
  },

  /**
   * Validate and sanitize URL input
   * @param {string} url - URL to validate
   * @param {object} options - Validation options
   * @returns {string|null} - Sanitized URL or null if invalid
   */
  validateUrl: (url, options = {}) => {
    if (typeof url !== 'string') return null;

    const defaultOptions = {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      ...options
    };

    if (validator.isURL(url, defaultOptions)) {
      return validator.trim(url);
    }

    return null;
  },

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid email
   */
  isValidEmail: (email) => {
    if (typeof email !== 'string') return false;
    return validator.isEmail(email);
  },

  /**
   * Validate alphanumeric string (useful for IDs, slugs)
   * @param {string} input - Input to validate
   * @returns {boolean} - True if alphanumeric
   */
  isAlphanumeric: (input) => {
    if (typeof input !== 'string') return false;
    return validator.isAlphanumeric(input);
  },

  /**
   * Sanitize object by escaping all string values
   * @param {object} obj - Object with potentially unsafe strings
   * @returns {object} - Object with sanitized strings
   */
  sanitizeObject: (obj) => {
    if (typeof obj !== 'object' || obj === null) return {};

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = validator.escape(validator.trim(value));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = inputValidation.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
};

/**
 * Request validation middleware
 * Automatically sanitizes req.body, req.query, req.params
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = inputValidation.sanitizeObject(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    req.query = inputValidation.sanitizeObject(req.query);
  }

  if (req.params && typeof req.params === 'object') {
    req.params = inputValidation.sanitizeObject(req.params);
  }

  next();
};

/**
 * HTTPS redirect middleware for production
 * Redirects all HTTP requests to HTTPS
 */
const httpsRedirect = (req, res, next) => {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if request is already HTTPS
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }

  // Redirect to HTTPS
  res.redirect(301, `https://${req.headers.host}${req.url}`);
};

/**
 * CSP Violation Handler
 * Processes and logs CSP violation reports
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const handleCspViolation = (req, res) => {
  const violation = req.body;

  // Log violation server-side
  console.warn('🚨 CSP Violation detected:', {
    blockedUri: violation['blocked-uri'],
    violatedDirective: violation['violated-directive'],
    originalPolicy: violation['original-policy'],
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent']
  });

  // Store violation (keep only last MAX_VIOLATIONS_STORED)
  cspViolations.push({
    ...violation,
    timestamp: new Date().toISOString(),
    ip: req.ip
  });

  if (cspViolations.length > MAX_VIOLATIONS_STORED) {
    cspViolations.shift(); // Remove oldest
  }

  // Always respond with 204 No Content (per CSP spec)
  res.status(204).end();
};

/**
 * Get CSP violation statistics
 * @returns {object} - CSP violation summary
 */
const getCspViolationStats = () => {
  const groupedByDirective = {};

  cspViolations.forEach(v => {
    const directive = v['violated-directive'] || 'unknown';
    if (!groupedByDirective[directive]) {
      groupedByDirective[directive] = 0;
    }
    groupedByDirective[directive]++;
  });

  return {
    totalViolations: cspViolations.length,
    byDirective: groupedByDirective,
    recentViolations: cspViolations.slice(-10) // Last 10 violations
  };
};

module.exports = {
  helmetConfig,
  rateLimiter,
  strictRateLimiter,
  inputValidation,
  sanitizeRequest,
  httpsRedirect,
  cspNonce,
  handleCspViolation,
  getCspViolationStats
};