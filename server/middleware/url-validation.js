/**
 * URL Validation Middleware
 *
 * Express middleware for validating URLs before processing.
 * Implements defense-in-depth with rate limiting, logging, and security monitoring.
 *
 * Constitutional Compliance: Article V (Security) - Input Validation
 */

const rateLimit = require('express-rate-limit');

const { URLValidator } = require('../validators/url-validator');

// Track failed validation attempts for security monitoring
const failedAttempts = new Map();

// Configuration
const CONFIG = {
  MAX_FAILED_ATTEMPTS: 10,
  FAILED_ATTEMPTS_WINDOW: 15 * 60 * 1000, // 15 minutes
  CLEANUP_INTERVAL: 60 * 1000, // 1 minute
};

/**
 * Clean up old failed attempt records periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of failedAttempts.entries()) {
    if (now - data.firstAttempt > CONFIG.FAILED_ATTEMPTS_WINDOW) {
      failedAttempts.delete(ip);
    }
  }
}, CONFIG.CLEANUP_INTERVAL);

/**
 * Rate limiter specifically for URL validation endpoints
 * Stricter limits for invalid URL attempts to prevent abuse
 */
const urlValidationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many URL validation requests',
    retryAfter: '1 minute',
  },
  // Skip successful requests from rate limit
  skip: req => {
    return req.urlValidationSuccess === true;
  },
  handler: (req, res) => {
    logSecurityEvent(req, 'RATE_LIMIT_EXCEEDED', {
      ip: getClientIp(req),
      url: req.body?.url || req.query?.url,
    });

    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  },
});

/**
 * Get client IP address from request
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

/**
 * Log security events for monitoring
 */
function logSecurityEvent(req, eventType, details = {}) {
  const timestamp = new Date().toISOString();
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  const logEntry = {
    timestamp,
    eventType,
    ip,
    userAgent,
    method: req.method,
    path: req.path,
    ...details,
  };

  // Log to console (in production, send to security monitoring service)
  console.warn(`[SECURITY] ${eventType}:`, JSON.stringify(logEntry));

  // Track failed attempts
  if (eventType === 'URL_VALIDATION_FAILED') {
    trackFailedAttempt(ip, details.validationError);
  }

  return logEntry;
}

/**
 * Track failed validation attempts per IP
 */
function trackFailedAttempt(ip, error) {
  const now = Date.now();

  if (!failedAttempts.has(ip)) {
    failedAttempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      errors: [error],
    });
  } else {
    const data = failedAttempts.get(ip);
    data.count += 1;
    data.lastAttempt = now;
    data.errors.push(error);

    // Keep only last 10 errors
    if (data.errors.length > 10) {
      data.errors = data.errors.slice(-10);
    }
  }
}

/**
 * Check if IP has exceeded failed attempt threshold
 */
function hasExceededFailedAttempts(ip) {
  if (!failedAttempts.has(ip)) {
    return false;
  }

  const data = failedAttempts.get(ip);
  const now = Date.now();

  // Check if within time window
  if (now - data.firstAttempt > CONFIG.FAILED_ATTEMPTS_WINDOW) {
    // Reset if outside window
    failedAttempts.delete(ip);
    return false;
  }

  return data.count >= CONFIG.MAX_FAILED_ATTEMPTS;
}

/**
 * Main URL validation middleware
 * Validates URL from request body or query parameter
 */
function validateUrl(options = {}) {
  const {
    urlField = 'url', // Field name in request body/query
    required = true, // Whether URL is required
    source = 'body', // 'body', 'query', or 'both'
  } = options;

  return (req, res, next) => {
    const ip = getClientIp(req);

    // Check if IP has exceeded failed attempt threshold
    if (hasExceededFailedAttempts(ip)) {
      logSecurityEvent(req, 'BLOCKED_EXCESSIVE_FAILURES', {
        ip,
        failedAttempts: failedAttempts.get(ip).count,
      });

      return res.status(403).json({
        error: 'Access temporarily restricted',
        message: 'Too many invalid URL submissions. Please try again later.',
      });
    }

    // Extract URL from request
    let urlToValidate = null;
    if (source === 'body' || source === 'both') {
      urlToValidate = req.body?.[urlField];
    }
    if (!urlToValidate && (source === 'query' || source === 'both')) {
      urlToValidate = req.query?.[urlField];
    }

    // Check if URL is required
    if (!urlToValidate) {
      if (required) {
        return res.status(400).json({
          error: 'Missing URL',
          message: 'URL parameter is required',
        });
      } else {
        // URL not required and not provided - continue
        return next();
      }
    }

    // Perform quick validation first (fast path)
    if (!URLValidator.quickValidate(urlToValidate)) {
      logSecurityEvent(req, 'URL_VALIDATION_FAILED', {
        url: urlToValidate.substring(0, 100), // Log first 100 chars only
        validationError: 'QUICK_VALIDATION_FAILED',
      });

      return res.status(400).json({
        error: 'Invalid URL',
        message: 'The provided URL is invalid',
      });
    }

    // Perform comprehensive validation
    const validationResult = URLValidator.validate(urlToValidate);

    if (!validationResult.valid) {
      // Log security event
      logSecurityEvent(req, 'URL_VALIDATION_FAILED', {
        url: urlToValidate.substring(0, 100),
        validationError: validationResult.errors[0]?.code || 'UNKNOWN',
        errorCount: validationResult.errors.length,
      });

      // Return safe error message (don't expose validation rules)
      const safeMessage = URLValidator.getSafeErrorMessage(validationResult.errors);

      return res.status(400).json({
        error: 'Invalid URL',
        message: safeMessage,
      });
    }

    // Validation successful
    req.urlValidationSuccess = true;

    // Attach validated URL to request
    req.validatedUrl = validationResult.sanitized;
    req.urlValidation = {
      original: validationResult.original,
      sanitized: validationResult.sanitized,
      parsed: validationResult.parsed,
      warnings: validationResult.warnings,
    };

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      logSecurityEvent(req, 'URL_VALIDATION_WARNING', {
        url: urlToValidate.substring(0, 100),
        warnings: validationResult.warnings,
      });
    }

    next();
  };
}

/**
 * Middleware to add security headers for iframe content
 */
function iframeSecurityHeaders(req, res, next) {
  // X-Frame-Options to prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // CSP for iframe content
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self'; frame-src https: http://localhost:*"
  );

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
}

/**
 * Get failed attempts statistics (for monitoring dashboard)
 */
function getFailedAttemptsStats() {
  const stats = {
    totalIPs: failedAttempts.size,
    blockedIPs: 0,
    recentAttempts: [],
  };

  for (const [ip, data] of failedAttempts.entries()) {
    if (data.count >= CONFIG.MAX_FAILED_ATTEMPTS) {
      stats.blockedIPs += 1;
    }

    stats.recentAttempts.push({
      ip,
      count: data.count,
      firstAttempt: new Date(data.firstAttempt).toISOString(),
      lastAttempt: new Date(data.lastAttempt).toISOString(),
      recentErrors: data.errors.slice(-3),
    });
  }

  // Sort by most recent
  stats.recentAttempts.sort((a, b) => new Date(b.lastAttempt) - new Date(a.lastAttempt));

  // Keep only top 50
  stats.recentAttempts = stats.recentAttempts.slice(0, 50);

  return stats;
}

// Export middleware and utilities
module.exports = {
  validateUrl,
  urlValidationRateLimiter,
  iframeSecurityHeaders,
  getFailedAttemptsStats,
  logSecurityEvent,
};
