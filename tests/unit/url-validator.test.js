/**
 * URL Validator Security Test Suite
 *
 * Critical security tests for URL validation.
 * Tests XSS, injection attacks, malicious schemes, and edge cases.
 *
 * Constitutional Compliance: Article VI (Testing) - Security validation
 */

import { describe, it, expect } from 'vitest';
import { URLValidator, CONFIG } from '../../server/validators/url-validator.mjs';

describe('URL Validator - Security Tests', () => {
  describe('Malicious URL Blocking', () => {
    it('should block javascript: protocol', () => {
      const result = URLValidator.validate('javascript:alert(1)');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('MALICIOUS_PATTERN');
    });

    it('should block data: protocol', () => {
      const result = URLValidator.validate('data:text/html,<script>alert(1)</script>');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('MALICIOUS_PATTERN');
    });

    it('should block file: protocol', () => {
      const result = URLValidator.validate('file:///etc/passwd');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('MALICIOUS_PATTERN');
    });

    it('should block vbscript: protocol', () => {
      const result = URLValidator.validate('vbscript:msgbox("XSS")');
      expect(result.valid).toBe(false);
    });
  });

  describe('XSS Attack Prevention', () => {
    it('should block script tags in URL', () => {
      const result = URLValidator.validate('https://example.com/<script>alert(1)</script>');
      expect(result.valid).toBe(false);
    });

    it('should block event handlers in URL', () => {
      const result = URLValidator.validate('https://example.com?onclick=alert(1)');
      expect(result.valid).toBe(false);
    });

    it('should block eval in URL', () => {
      const result = URLValidator.validate('https://example.com?q=eval(alert(1))');
      expect(result.valid).toBe(false);
    });
  });

  describe('SQL Injection Prevention', () => {
    it('should block SQL injection in query parameters', () => {
      const result = URLValidator.validate('https://example.com?id=1 OR 1=1');
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_PARAMS');
    });

    it('should block UNION SELECT attacks', () => {
      const result = URLValidator.validate('https://example.com?id=1 UNION SELECT * FROM users');
      expect(result.valid).toBe(false);
    });
  });

  describe('Path Traversal Prevention', () => {
    it('should block path traversal attempts', () => {
      const result = URLValidator.validate('https://example.com/../../../etc/passwd');
      expect(result.valid).toBe(false);
    });
  });

  describe('Valid URL Acceptance', () => {
    it('should allow valid HTTPS URLs', () => {
      const validUrls = [
        'https://example.com',
        'https://www.example.com/path',
        'https://example.com:8080',
        'https://example.com?query=value',
        'https://example.com#section',
      ];

      validUrls.forEach(url => {
        const result = URLValidator.validate(url);
        expect(result.valid).toBe(true);
      });
    });

    it('should auto-add https:// protocol', () => {
      const result = URLValidator.validate('example.com');
      expect(result.valid).toBe(true);
      expect(result.sanitized).toMatch(/^https:\/\//);
    });
  });

  describe('URL Length Validation', () => {
    it('should reject URLs exceeding max length', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(3000);
      const result = URLValidator.validate(longUrl);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('URL_TOO_LONG');
    });
  });

  describe('Edge Cases', () => {
    it('should reject null/undefined input', () => {
      expect(URLValidator.validate(null).valid).toBe(false);
      expect(URLValidator.validate(undefined).valid).toBe(false);
    });

    it('should reject empty string', () => {
      expect(URLValidator.validate('').valid).toBe(false);
    });

    it('should reject non-string input', () => {
      expect(URLValidator.validate(123).valid).toBe(false);
      expect(URLValidator.validate({}).valid).toBe(false);
    });
  });

  describe('Quick Validation', () => {
    it('should quickly reject malicious URLs', () => {
      expect(URLValidator.quickValidate('javascript:alert(1)')).toBe(false);
      expect(URLValidator.quickValidate('data:text/html')).toBe(false);
      expect(URLValidator.quickValidate('')).toBe(false);
    });

    it('should quickly accept valid URLs', () => {
      expect(URLValidator.quickValidate('https://example.com')).toBe(true);
    });
  });
});