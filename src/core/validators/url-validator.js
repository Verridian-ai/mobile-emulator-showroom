/**
 * URL Validator with Security Controls
 *
 * Implements Article V (Security) requirements:
 * - Input validation with DOMPurify sanitization
 * - Protocol allowlist (http, https only)
 * - XSS prevention
 * - Injection attack prevention
 *
 * Implements Article III (Code Quality) requirements:
 * - Pure function (no side effects)
 * - Complete JSDoc documentation
 * - 100% test coverage
 *
 * @module validators/url-validator
 */

import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create a DOM window for DOMPurify to work in Node.js
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Custom error class for URL validation failures
 * @extends Error
 */
export class InvalidUrlError extends Error {
  /**
   * Creates an InvalidUrlError
   * @param {string} message - Error message
   * @param {string} [code] - Error code for programmatic handling
   */
  constructor(message, code = 'INVALID_URL') {
    super(message);
    this.name = 'InvalidUrlError';
    this.code = code;
  }
}

/**
 * Protocol allowlist (Article V: Allowlist over denylist)
 * Only these protocols are permitted for security
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Validates and sanitizes a URL for safe loading
 *
 * Security features:
 * - Rejects dangerous protocols (javascript:, data:, file:, etc.)
 * - Sanitizes HTML/script injection attempts with DOMPurify
 * - Validates URL structure
 * - Fails securely (throws errors instead of returning false)
 *
 * @param {string} url - The URL to validate and sanitize
 * @returns {{valid: boolean, sanitized: string, protocol: string}} Validation result
 * @throws {InvalidUrlError} If URL is invalid, malicious, or uses disallowed protocol
 *
 * @example
 * // Valid URL
 * const result = validateUrl('https://example.com');
 * // Returns: { valid: true, sanitized: 'https://example.com/', protocol: 'https:' }
 *
 * @example
 * // Invalid protocol
 * validateUrl('javascript:alert(1)');
 * // Throws: InvalidUrlError: Protocol 'javascript:' not allowed
 *
 * @example
 * // XSS attempt (sanitized)
 * const result = validateUrl('https://example.com?q=<script>alert(1)</script>');
 * // Returns: { valid: true, sanitized: 'https://example.com/?q=', protocol: 'https:' }
 */
export function validateUrl(url) {
  // Article V: Input validation - Type check
  if (typeof url !== 'string') {
    throw new InvalidUrlError(
      'URL must be a string',
      'INVALID_TYPE'
    );
  }

  // Article V: Input validation - Empty check
  const trimmedUrl = url.trim();
  if (trimmedUrl === '') {
    throw new InvalidUrlError(
      'URL cannot be empty',
      'EMPTY_URL'
    );
  }

  // Article V: Sanitize input with DOMPurify FIRST
  // This removes script tags, event handlers, and dangerous HTML
  const sanitized = purify.sanitize(trimmedUrl, {
    ALLOWED_TAGS: [],  // No HTML tags allowed
    ALLOWED_ATTR: [],  // No HTML attributes allowed
    KEEP_CONTENT: true // Keep text content (the URL itself)
  });

  // Handle URLs without protocol (auto-add https)
  let urlToValidate = sanitized;
  if (!sanitized.match(/^[a-z][a-z0-9+.-]*:/i)) {
    // No protocol specified, prepend https://
    urlToValidate = `https://${sanitized}`;
  }

  // Parse the URL
  let parsedUrl;
  try {
    parsedUrl = new URL(urlToValidate);
  } catch (error) {
    throw new InvalidUrlError(
      `Invalid URL format: ${error.message}`,
      'MALFORMED_URL'
    );
  }

  // Article V: Protocol allowlist (security critical)
  // Only http and https are permitted
  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    throw new InvalidUrlError(
      `Protocol '${parsedUrl.protocol}' not allowed. Only ${ALLOWED_PROTOCOLS.join(', ')} are permitted.`,
      'PROTOCOL_NOT_ALLOWED'
    );
  }

  // Additional validation: Check for spaces in hostname
  if (parsedUrl.hostname.includes(' ')) {
    throw new InvalidUrlError(
      'Invalid hostname: spaces not allowed',
      'INVALID_HOSTNAME'
    );
  }

  // Sanitize the final URL again to ensure no injection in query params
  const finalUrl = parsedUrl.toString();
  const finalSanitized = purify.sanitize(finalUrl, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });

  // Article III: Return clean, structured output
  return {
    valid: true,
    sanitized: finalSanitized,
    protocol: parsedUrl.protocol
  };
}

/**
 * Validates multiple URLs in batch
 *
 * @param {string[]} urls - Array of URLs to validate
 * @returns {Array<{url: string, result: object|null, error: Error|null}>} Validation results
 *
 * @example
 * const results = validateUrls([
 *   'https://example.com',
 *   'javascript:alert(1)',
 *   'https://test.org'
 * ]);
 * // Returns array with individual results
 */
export function validateUrls(urls) {
  if (!Array.isArray(urls)) {
    throw new InvalidUrlError(
      'Input must be an array of URLs',
      'INVALID_INPUT'
    );
  }

  return urls.map(url => {
    try {
      const result = validateUrl(url);
      return { url, result, error: null };
    } catch (error) {
      return { url, result: null, error };
    }
  });
}