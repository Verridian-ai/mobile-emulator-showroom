/**
 * URL Validator Module
 *
 * Implements comprehensive URL validation and sanitization to prevent:
 * - XSS attacks via javascript:, data:, file: schemes
 * - Open redirect vulnerabilities
 * - SQL injection in URL parameters
 * - Protocol confusion attacks
 * - Malicious script injection
 *
 * Constitutional Compliance: Article V (Security) - Input Validation
 */

const { URL } = require('url');

// Configuration Constants
const CONFIG = {
  MAX_URL_LENGTH: 2048,
  MAX_PARAM_LENGTH: 512,
  MAX_PARAMS_COUNT: 50,
  ALLOWED_PROTOCOLS: ['https:', 'http:'], // http only for localhost/development
  BLOCKED_PATTERNS: [
    /javascript:/i,
    /data:/i,
    /file:/i,
    /vbscript:/i,
    /about:/i,
    /<script/i,
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /on\w+\s*=/i, // Event handlers like onclick=, onload=, etc.
    /eval\(/i,
    /expression\(/i,
    /import\(/i,
    /document\./i,
    /window\./i,
    /\.\.[\\/]/, // Path traversal
    /%00/i, // Null byte injection
    /%0[ad]/i, // CRLF injection
  ],
  LOCALHOST_PATTERNS: ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'],
};

/**
 * Validation error class with security-safe messages
 */
class URLValidationError extends Error {
  constructor(message, code = 'INVALID_URL') {
    super(message);
    this.name = 'URLValidationError';
    this.code = code;
    this.safeMessage = 'Invalid URL provided'; // Never expose validation rules to client
  }
}

/**
 * Main URL Validator Class
 */
class URLValidator {
  /**
   * Validates a URL against all security rules
   * @param {string} urlString - The URL to validate
   * @param {object} options - Validation options
   * @returns {object} Validation result { valid: boolean, sanitized: string, errors: array }
   */
  static validate(urlString, options = {}) {
    const errors = [];
    const warnings = [];

    try {
      // 1. Basic validation
      if (!urlString || typeof urlString !== 'string') {
        throw new URLValidationError('URL must be a non-empty string', 'INVALID_TYPE');
      }

      // 2. Length validation
      if (urlString.length > CONFIG.MAX_URL_LENGTH) {
        throw new URLValidationError(
          `URL exceeds maximum length of ${CONFIG.MAX_URL_LENGTH} characters`,
          'URL_TOO_LONG'
        );
      }

      // 3. Trim and normalize
      let sanitized = urlString.trim();

      // 4. Check for malicious patterns BEFORE parsing
      for (const pattern of CONFIG.BLOCKED_PATTERNS) {
        if (pattern.test(sanitized)) {
          throw new URLValidationError(
            `URL contains blocked pattern: ${pattern}`,
            'MALICIOUS_PATTERN'
          );
        }
      }

      // 5. Ensure protocol is present
      if (!/^https?:\/\//i.test(sanitized)) {
        // Default to https for safety
        sanitized = `https://${sanitized}`;
        warnings.push('Protocol missing, defaulted to https://');
      }

      // 6. Parse URL
      let parsedUrl;
      try {
        parsedUrl = new URL(sanitized);
      } catch (parseError) {
        throw new URLValidationError('URL is malformed or invalid', 'PARSE_ERROR');
      }

      // 7. Protocol validation
      if (!CONFIG.ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
        throw new URLValidationError(
          `Protocol ${parsedUrl.protocol} is not allowed`,
          'INVALID_PROTOCOL'
        );
      }

      // 8. HTTP protocol only allowed for localhost in development
      if (parsedUrl.protocol === 'http:') {
        const isLocalhost = this.isLocalhostUrl(parsedUrl);
        const isDevelopment = process.env.NODE_ENV !== 'production';

        if (!isLocalhost || !isDevelopment) {
          throw new URLValidationError(
            'HTTP protocol only allowed for localhost in development',
            'HTTP_NOT_ALLOWED'
          );
        }
        warnings.push('HTTP protocol detected for localhost');
      }

      // 9. Validate hostname
      if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
        throw new URLValidationError('URL must have a valid hostname', 'INVALID_HOSTNAME');
      }

      // 10. Validate query parameters
      const paramValidation = this.validateQueryParams(parsedUrl);
      if (!paramValidation.valid) {
        throw new URLValidationError(paramValidation.error, 'INVALID_PARAMS');
      }

      // 11. Validate URL hash/fragment
      const hashValidation = this.validateHash(parsedUrl);
      if (!hashValidation.valid) {
        throw new URLValidationError(hashValidation.error, 'INVALID_HASH');
      }

      // 12. Check for suspicious ports
      if (parsedUrl.port) {
        const port = parseInt(parsedUrl.port, 10);
        if (port < 1 || port > 65535) {
          throw new URLValidationError('Invalid port number', 'INVALID_PORT');
        }
        // Warn on uncommon ports (except development ports)
        const commonPorts = [80, 443, 3000, 4000, 5000, 8000, 8080, 4175, 4176, 7071];
        if (!commonPorts.includes(port)) {
          warnings.push(`Uncommon port detected: ${port}`);
        }
      }

      // 13. Final sanitization
      const finalUrl = parsedUrl.toString();

      return {
        valid: true,
        sanitized: finalUrl,
        original: urlString,
        parsed: {
          protocol: parsedUrl.protocol,
          hostname: parsedUrl.hostname,
          port: parsedUrl.port,
          pathname: parsedUrl.pathname,
          search: parsedUrl.search,
          hash: parsedUrl.hash,
        },
        warnings,
        errors: [],
      };
    } catch (error) {
      if (error instanceof URLValidationError) {
        return {
          valid: false,
          sanitized: null,
          original: urlString,
          errors: [
            {
              code: error.code,
              message: error.message,
              safeMessage: error.safeMessage,
            },
          ],
          warnings,
        };
      }

      // Unexpected error - log server-side but return generic message
      console.error('Unexpected URL validation error:', error);
      return {
        valid: false,
        sanitized: null,
        original: urlString,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: 'URL validation failed',
            safeMessage: 'Invalid URL provided',
          },
        ],
        warnings,
      };
    }
  }

  /**
   * Check if URL is localhost
   */
  static isLocalhostUrl(parsedUrl) {
    return CONFIG.LOCALHOST_PATTERNS.some(pattern =>
      parsedUrl.hostname.toLowerCase().includes(pattern)
    );
  }

  /**
   * Validate query parameters
   */
  static validateQueryParams(parsedUrl) {
    const searchParams = parsedUrl.searchParams;

    // Check parameter count
    const paramCount = Array.from(searchParams.keys()).length;
    if (paramCount > CONFIG.MAX_PARAMS_COUNT) {
      return {
        valid: false,
        error: `Too many query parameters (max: ${CONFIG.MAX_PARAMS_COUNT})`,
      };
    }

    // Check each parameter
    for (const [key, value] of searchParams.entries()) {
      // Check key length
      if (key.length > CONFIG.MAX_PARAM_LENGTH) {
        return {
          valid: false,
          error: 'Parameter key too long',
        };
      }

      // Check value length
      if (value.length > CONFIG.MAX_PARAM_LENGTH) {
        return {
          valid: false,
          error: 'Parameter value too long',
        };
      }

      // Check for SQL injection patterns
      if (this.containsSQLInjection(key) || this.containsSQLInjection(value)) {
        return {
          valid: false,
          error: 'Potentially malicious parameter detected',
        };
      }

      // Check for XSS patterns in params
      if (this.containsXSS(key) || this.containsXSS(value)) {
        return {
          valid: false,
          error: 'Potentially malicious parameter detected',
        };
      }
    }

    return { valid: true };
  }

  /**
   * Validate URL hash/fragment
   */
  static validateHash(parsedUrl) {
    const hash = parsedUrl.hash;

    if (!hash || hash.length === 0) {
      return { valid: true };
    }

    // Check for XSS in hash
    if (this.containsXSS(hash)) {
      return {
        valid: false,
        error: 'Potentially malicious hash fragment detected',
      };
    }

    return { valid: true };
  }

  /**
   * Check for SQL injection patterns
   */
  static containsSQLInjection(str) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
      /(\bUNION\b.*\bSELECT\b)/i,
      /(--|#|\/\*|\*\/)/,
      /('|(\\')|(\\")|(\\\\)|(;))/,
      /(\bOR\b.*=.*)/i,
      /(\bAND\b.*=.*)/i,
      /xp_/i,
      /sp_/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Check for XSS patterns
   */
  static containsXSS(str) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>/gi,
      /<embed[^>]*>/gi,
      /<object[^>]*>/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /javascript:/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\(/gi,
      /eval\(/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Quick validation for rate limiting - less strict, faster
   */
  static quickValidate(urlString) {
    if (!urlString || typeof urlString !== 'string') {
      return false;
    }

    if (urlString.length > CONFIG.MAX_URL_LENGTH) {
      return false;
    }

    // Check basic malicious patterns
    for (const pattern of CONFIG.BLOCKED_PATTERNS.slice(0, 5)) {
      if (pattern.test(urlString)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get safe error message for client
   */
  static getSafeErrorMessage(errors) {
    if (!errors || errors.length === 0) {
      return 'Invalid URL provided';
    }

    // Map specific errors to user-friendly messages
    const errorMap = {
      INVALID_TYPE: 'Please provide a valid URL',
      URL_TOO_LONG: 'URL is too long',
      MALICIOUS_PATTERN: 'URL contains invalid characters',
      PARSE_ERROR: 'URL format is invalid',
      INVALID_PROTOCOL: 'Only HTTPS URLs are allowed',
      HTTP_NOT_ALLOWED: 'Only HTTPS URLs are allowed',
      INVALID_HOSTNAME: 'URL must have a valid domain name',
      INVALID_PARAMS: 'URL parameters are invalid',
      INVALID_HASH: 'URL fragment is invalid',
      INVALID_PORT: 'URL port is invalid',
    };

    const firstError = errors[0];
    return errorMap[firstError.code] || 'Invalid URL provided';
  }
}

// Export for use in middleware and routes
module.exports = {
  URLValidator,
  URLValidationError,
  CONFIG,
};
