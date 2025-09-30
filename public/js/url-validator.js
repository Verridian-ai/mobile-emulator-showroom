/**
 * Frontend URL Validator
 *
 * Client-side URL validation for defense-in-depth security.
 * Provides real-time feedback to users and reduces server load.
 *
 * IMPORTANT: This is client-side validation only. Server-side validation
 * is REQUIRED and is the primary security control.
 *
 * Constitutional Compliance: Article V (Security) - Defense in Depth
 */

(function (window) {
  'use strict';

  // Configuration (mirrors server-side config)
  const CONFIG = {
    MAX_URL_LENGTH: 2048,
    MAX_PARAM_LENGTH: 512,
    MAX_PARAMS_COUNT: 50,
    ALLOWED_PROTOCOLS: ['https:', 'http:'], // http only for localhost
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
      /on\w+\s*=/i,
      /eval\(/i,
      /expression\(/i,
      /import\(/i,
      /document\./i,
      /window\./i,
      /\.\.[\\/]/,
      /%00/i,
      /%0[ad]/i,
    ],
    LOCALHOST_PATTERNS: ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'],
  };

  /**
   * Main URLValidator class
   */
  class URLValidator {
    /**
     * Validate URL with comprehensive checks
     * @param {string} urlString - URL to validate
     * @param {object} options - Validation options
     * @returns {object} Validation result
     */
    static validate(urlString, options = {}) {
      const errors = [];
      const warnings = [];

      try {
        // 1. Basic validation
        if (!urlString || typeof urlString !== 'string') {
          return this._errorResult(urlString, 'Please provide a valid URL', 'INVALID_TYPE');
        }

        // 2. Length validation
        if (urlString.length > CONFIG.MAX_URL_LENGTH) {
          return this._errorResult(urlString, 'URL is too long', 'URL_TOO_LONG');
        }

        // 3. Trim and normalize
        let sanitized = urlString.trim();

        // 4. Check for malicious patterns FIRST
        for (const pattern of CONFIG.BLOCKED_PATTERNS) {
          if (pattern.test(sanitized)) {
            return this._errorResult(
              urlString,
              'URL contains invalid characters',
              'MALICIOUS_PATTERN'
            );
          }
        }

        // 5. Ensure protocol
        if (!/^https?:\/\//i.test(sanitized)) {
          sanitized = `https://${sanitized}`;
          warnings.push('Protocol missing, defaulted to https://');
        }

        // 6. Parse URL
        let parsedUrl;
        try {
          parsedUrl = new URL(sanitized);
        } catch (parseError) {
          return this._errorResult(urlString, 'URL format is invalid', 'PARSE_ERROR');
        }

        // 7. Protocol validation
        if (!CONFIG.ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
          return this._errorResult(urlString, 'Only HTTPS URLs are allowed', 'INVALID_PROTOCOL');
        }

        // 8. HTTP only for localhost
        if (parsedUrl.protocol === 'http:') {
          const isLocalhost = this.isLocalhostUrl(parsedUrl);
          if (!isLocalhost) {
            return this._errorResult(urlString, 'Only HTTPS URLs are allowed', 'HTTP_NOT_ALLOWED');
          }
          warnings.push('HTTP protocol for localhost');
        }

        // 9. Hostname validation
        if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
          return this._errorResult(
            urlString,
            'URL must have a valid domain name',
            'INVALID_HOSTNAME'
          );
        }

        // 10. Validate query parameters
        const paramValidation = this.validateQueryParams(parsedUrl);
        if (!paramValidation.valid) {
          return this._errorResult(urlString, 'URL parameters are invalid', 'INVALID_PARAMS');
        }

        // 11. Validate hash
        const hashValidation = this.validateHash(parsedUrl);
        if (!hashValidation.valid) {
          return this._errorResult(urlString, 'URL fragment is invalid', 'INVALID_HASH');
        }

        // 12. Port validation
        if (parsedUrl.port) {
          const port = parseInt(parsedUrl.port, 10);
          if (port < 1 || port > 65535) {
            return this._errorResult(urlString, 'URL port is invalid', 'INVALID_PORT');
          }
        }

        // Success
        return {
          valid: true,
          sanitized: parsedUrl.toString(),
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
        console.error('URL validation error:', error);
        return this._errorResult(urlString, 'Invalid URL provided', 'VALIDATION_ERROR');
      }
    }

    /**
     * Quick validation for real-time feedback
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
     * Helper: Create error result
     */
    static _errorResult(original, message, code) {
      return {
        valid: false,
        sanitized: null,
        original,
        errors: [{ code, message }],
        warnings: [],
      };
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
        return { valid: false, error: 'Too many query parameters' };
      }

      // Check each parameter
      for (const [key, value] of searchParams.entries()) {
        if (key.length > CONFIG.MAX_PARAM_LENGTH) {
          return { valid: false, error: 'Parameter key too long' };
        }

        if (value.length > CONFIG.MAX_PARAM_LENGTH) {
          return { valid: false, error: 'Parameter value too long' };
        }

        if (this.containsSQLInjection(key) || this.containsSQLInjection(value)) {
          return { valid: false, error: 'Invalid parameter detected' };
        }

        if (this.containsXSS(key) || this.containsXSS(value)) {
          return { valid: false, error: 'Invalid parameter detected' };
        }
      }

      return { valid: true };
    }

    /**
     * Validate hash fragment
     */
    static validateHash(parsedUrl) {
      const hash = parsedUrl.hash;

      if (!hash || hash.length === 0) {
        return { valid: true };
      }

      if (this.containsXSS(hash)) {
        return { valid: false, error: 'Invalid hash fragment' };
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
  }

  /**
   * UI Helper for showing validation feedback
   */
  class URLValidationUI {
    /**
     * Add real-time validation to an input element
     * @param {HTMLInputElement} inputElement - Input to validate
     * @param {object} options - Options
     */
    static attachToInput(inputElement, options = {}) {
      const {
        onValidate = null,
        showInlineErrors = true,
        validateOnInput = true,
        validateOnBlur = true,
      } = options;

      let validationTimeout = null;
      let lastValidationResult = null;

      // Create error display element
      let errorElement = null;
      if (showInlineErrors) {
        errorElement = document.createElement('div');
        errorElement.className = 'url-validation-error';
        errorElement.style.cssText = `
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: none;
          animation: fadeIn 0.2s ease-in;
        `;
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
      }

      // Validation function
      const performValidation = () => {
        const url = inputElement.value.trim();

        if (!url) {
          // Clear error when empty
          if (errorElement) {
            errorElement.style.display = 'none';
          }
          inputElement.classList.remove('url-invalid', 'url-valid');
          lastValidationResult = null;
          if (onValidate) {
            onValidate(null);
          }
          return;
        }

        // Validate
        const result = URLValidator.validate(url);
        lastValidationResult = result;

        // Update UI
        if (result.valid) {
          inputElement.classList.remove('url-invalid');
          inputElement.classList.add('url-valid');
          if (errorElement) {
            errorElement.style.display = 'none';
          }
        } else {
          inputElement.classList.remove('url-valid');
          inputElement.classList.add('url-invalid');
          if (errorElement && result.errors.length > 0) {
            errorElement.textContent = result.errors[0].message;
            errorElement.style.display = 'block';
          }
        }

        // Callback
        if (onValidate) {
          onValidate(result);
        }
      };

      // Attach event listeners
      if (validateOnInput) {
        inputElement.addEventListener('input', () => {
          // Debounce validation
          clearTimeout(validationTimeout);
          validationTimeout = setTimeout(performValidation, 300);
        });
      }

      if (validateOnBlur) {
        inputElement.addEventListener('blur', performValidation);
      }

      // Return cleanup function
      return () => {
        clearTimeout(validationTimeout);
        if (errorElement && errorElement.parentNode) {
          errorElement.parentNode.removeChild(errorElement);
        }
      };
    }

    /**
     * Show validation error toast
     */
    static showErrorToast(message, duration = 3000) {
      const toast = document.createElement('div');
      toast.className = 'url-validation-toast';
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.95);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-size: 0.875rem;
        max-width: 400px;
      `;

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, duration);
    }
  }

  // Expose to global scope
  window.URLValidator = URLValidator;
  window.URLValidationUI = URLValidationUI;

  // Add CSS animations
  if (!document.getElementById('url-validator-styles')) {
    const style = document.createElement('style');
    style.id = 'url-validator-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .url-invalid {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
      }
      .url-valid {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
      }
    `;
    document.head.appendChild(style);
  }
})(window);
