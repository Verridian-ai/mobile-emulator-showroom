/**
 * Unit tests for URL validator (Article V: Security, Article VI: Testing)
 * Following TDD: Tests written BEFORE implementation
 */

import { describe, it, expect } from 'vitest';

import {
  validateUrl,
  validateUrls,
  InvalidUrlError,
} from '../../src/core/validators/url-validator.js';

describe('URL Validator - Valid URLs', () => {
  it('should accept valid HTTP URLs', () => {
    const result = validateUrl('http://example.com');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('http://example.com/');
    expect(result.protocol).toBe('http:');
  });

  it('should accept valid HTTPS URLs', () => {
    const result = validateUrl('https://example.com');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('https://example.com/');
    expect(result.protocol).toBe('https:');
  });

  it('should accept URLs with paths', () => {
    const result = validateUrl('https://example.com/path/to/page');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toContain('/path/to/page');
  });

  it('should accept URLs with query parameters', () => {
    const result = validateUrl('https://example.com?foo=bar&baz=qux');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toContain('foo=bar');
  });

  it('should accept URLs with ports', () => {
    const result = validateUrl('http://localhost:3000');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toContain(':3000');
  });

  it('should accept URLs without protocol (auto-add https)', () => {
    const result = validateUrl('example.com');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toMatch(/^https?:\/\//);
  });
});

describe('URL Validator - Malicious Protocol Attacks', () => {
  it('should reject javascript: protocol', () => {
    expect(() => validateUrl('javascript:alert(1)')).toThrow(InvalidUrlError);
    expect(() => validateUrl('javascript:alert(1)')).toThrow(/not allowed/i);
  });

  it('should reject data: protocol', () => {
    expect(() => validateUrl('data:text/html,<script>alert(1)</script>')).toThrow(InvalidUrlError);
    expect(() => validateUrl('data:text/html,<script>alert(1)</script>')).toThrow(/not allowed/i);
  });

  it('should reject file: protocol', () => {
    expect(() => validateUrl('file:///etc/passwd')).toThrow(InvalidUrlError);
    expect(() => validateUrl('file:///etc/passwd')).toThrow(/not allowed/i);
  });

  it('should reject vbscript: protocol', () => {
    expect(() => validateUrl('vbscript:msgbox(1)')).toThrow(InvalidUrlError);
    expect(() => validateUrl('vbscript:msgbox(1)')).toThrow(/not allowed/i);
  });

  it('should reject ftp: protocol', () => {
    expect(() => validateUrl('ftp://example.com')).toThrow(InvalidUrlError);
    expect(() => validateUrl('ftp://example.com')).toThrow(/not allowed/i);
  });

  it('should reject blob: protocol', () => {
    expect(() => validateUrl('blob:https://example.com/uuid')).toThrow(InvalidUrlError);
  });
});

describe('URL Validator - XSS Attack Vectors', () => {
  it('should sanitize script tags in URL', () => {
    const result = validateUrl('https://example.com?q=<script>alert(1)</script>');
    expect(result.valid).toBe(true);
    expect(result.sanitized).not.toContain('<script>');
    expect(result.sanitized).not.toContain('</script>');
  });

  it('should sanitize HTML entities in URL', () => {
    const result = validateUrl('https://example.com?q=<img src=x onerror=alert(1)>');
    expect(result.valid).toBe(true);
    expect(result.sanitized).not.toContain('<img');
    expect(result.sanitized).not.toContain('onerror');
  });

  it('should sanitize embedded script tags in query params', () => {
    const result = validateUrl('https://example.com?code=<script>alert(1)</script>');
    expect(result.valid).toBe(true);
    expect(result.sanitized).not.toContain('<script>');
    // Note: 'javascript:' as a query value is legitimate (e.g., documentation)
    // The critical security check is preventing it as the URL protocol
  });

  it('should handle URL-encoded XSS attempts', () => {
    const result = validateUrl('https://example.com?q=%3Cscript%3Ealert(1)%3C/script%3E');
    expect(result.valid).toBe(true);
    // Should not contain decoded script tags
    expect(result.sanitized).not.toContain('<script>');
  });

  it('should sanitize single quote XSS attempts', () => {
    const result = validateUrl("https://example.com'><script>alert(1)</script>");
    expect(result.valid).toBe(true);
    expect(result.sanitized).not.toContain('<script>');
  });

  it('should sanitize double quote XSS attempts', () => {
    const result = validateUrl('https://example.com"><script>alert(1)</script>');
    expect(result.valid).toBe(true);
    expect(result.sanitized).not.toContain('<script>');
  });
});

describe('URL Validator - Malformed URLs', () => {
  it('should reject empty string', () => {
    expect(() => validateUrl('')).toThrow(InvalidUrlError);
    expect(() => validateUrl('')).toThrow(/url cannot be empty/i);
  });

  it('should reject null', () => {
    expect(() => validateUrl(null)).toThrow(InvalidUrlError);
    expect(() => validateUrl(null)).toThrow(/url must be a string/i);
  });

  it('should reject undefined', () => {
    expect(() => validateUrl(undefined)).toThrow(InvalidUrlError);
    expect(() => validateUrl(undefined)).toThrow(/url must be a string/i);
  });

  it('should reject non-string input', () => {
    expect(() => validateUrl(123)).toThrow(InvalidUrlError);
    expect(() => validateUrl({})).toThrow(InvalidUrlError);
    expect(() => validateUrl([])).toThrow(InvalidUrlError);
  });

  it('should reject URLs with only whitespace', () => {
    expect(() => validateUrl('   ')).toThrow(InvalidUrlError);
    expect(() => validateUrl('   ')).toThrow(/url cannot be empty/i);
  });

  it('should reject invalid URL format', () => {
    expect(() => validateUrl('not a url')).toThrow(InvalidUrlError);
    expect(() => validateUrl('htp://broken')).toThrow(InvalidUrlError);
  });

  it('should reject URLs with spaces', () => {
    expect(() => validateUrl('http://example .com')).toThrow(InvalidUrlError);
  });
});

describe('URL Validator - Edge Cases', () => {
  it('should handle URLs with fragments', () => {
    const result = validateUrl('https://example.com#section');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toContain('#section');
  });

  it('should handle URLs with authentication', () => {
    const result = validateUrl('https://user:pass@example.com');
    expect(result.valid).toBe(true);
  });

  it('should handle internationalized domain names', () => {
    const result = validateUrl('https://münchen.de');
    expect(result.valid).toBe(true);
  });

  it('should handle very long URLs', () => {
    const longPath = 'a'.repeat(1000);
    const result = validateUrl(`https://example.com/${longPath}`);
    expect(result.valid).toBe(true);
  });

  it('should handle URLs with multiple query parameters', () => {
    const result = validateUrl('https://example.com?a=1&b=2&c=3&d=4&e=5');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toContain('a=1');
    expect(result.sanitized).toContain('e=5');
  });
});

describe('URL Validator - Return Value Structure', () => {
  it('should return correct structure for valid URL', () => {
    const result = validateUrl('https://example.com');
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('sanitized');
    expect(result).toHaveProperty('protocol');
    expect(typeof result.valid).toBe('boolean');
    expect(typeof result.sanitized).toBe('string');
    expect(typeof result.protocol).toBe('string');
  });

  it('should return consistent results for same URL', () => {
    const result1 = validateUrl('https://example.com');
    const result2 = validateUrl('https://example.com');
    expect(result1).toEqual(result2);
  });
});

describe('URL Validator - Security Requirements (Article V)', () => {
  it('should implement allowlist (not denylist) approach', () => {
    // Only http: and https: should be allowed
    expect(() => validateUrl('custom-protocol://example.com')).toThrow(InvalidUrlError);
  });

  it('should sanitize all user input', () => {
    const dirty = 'https://example.com?evil=<script>alert(1)</script>';
    const result = validateUrl(dirty);
    expect(result.sanitized).not.toEqual(dirty);
  });

  it('should fail securely on validation errors', () => {
    // Should throw, not return {valid: false}
    expect(() => validateUrl('javascript:alert(1)')).toThrow();
  });
});

describe('Batch URL Validation - validateUrls()', () => {
  it('should validate multiple URLs successfully', () => {
    const urls = ['https://example.com', 'http://test.org', 'https://localhost:3000'];
    const results = validateUrls(urls);
    expect(results).toHaveLength(3);
    expect(results[0].result.valid).toBe(true);
    expect(results[0].error).toBeNull();
    expect(results[1].result.valid).toBe(true);
    expect(results[2].result.valid).toBe(true);
  });

  it('should handle mix of valid and invalid URLs', () => {
    const urls = ['https://example.com', 'javascript:alert(1)', 'https://test.org'];
    const results = validateUrls(urls);
    expect(results).toHaveLength(3);
    expect(results[0].result.valid).toBe(true);
    expect(results[0].error).toBeNull();
    expect(results[1].result).toBeNull();
    expect(results[1].error).toBeInstanceOf(InvalidUrlError);
    expect(results[2].result.valid).toBe(true);
  });

  it('should throw error for non-array input', () => {
    expect(() => validateUrls('not-an-array')).toThrow(InvalidUrlError);
    expect(() => validateUrls('not-an-array')).toThrow(/must be an array/i);
  });

  it('should handle empty array', () => {
    const results = validateUrls([]);
    expect(results).toHaveLength(0);
  });
});
