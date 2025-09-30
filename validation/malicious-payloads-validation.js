/**
 * Comprehensive malicious payload testing
 * Tests from Task 1.5 requirements
 */

import { validateUrl, InvalidUrlError } from '../src/core/validators/url-validator.js';

console.log('=== MALICIOUS PAYLOAD VALIDATION REPORT ===\n');

const maliciousPayloads = [
  {
    name: 'JavaScript protocol XSS',
    payload: 'javascript:alert(1)',
    shouldBlock: true,
  },
  {
    name: 'Data URI with script',
    payload: 'data:text/html,<script>alert(1)</script>',
    shouldBlock: true,
  },
  {
    name: 'Script in query parameter',
    payload: 'https://example.com?q=<script>alert(1)</script>',
    shouldBlock: false, // Should sanitize, not block
    checkSanitized: result => !result.sanitized.includes('<script>'),
  },
  {
    name: 'Single quote XSS attempt',
    payload: "https://example.com'><script>alert(1)</script>",
    shouldBlock: false,
    checkSanitized: result => !result.sanitized.includes('<script>'),
  },
  {
    name: 'File protocol (local file access)',
    payload: 'file:///etc/passwd',
    shouldBlock: true,
  },
  {
    name: 'VBScript protocol',
    payload: 'vbscript:msgbox(1)',
    shouldBlock: true,
  },
  {
    name: 'FTP protocol',
    payload: 'ftp://example.com',
    shouldBlock: true,
  },
  {
    name: 'Blob URL',
    payload: 'blob:https://example.com/uuid',
    shouldBlock: true,
  },
  {
    name: 'IMG tag with onerror',
    payload: 'https://example.com?q=<img src=x onerror=alert(1)>',
    shouldBlock: false,
    checkSanitized: result => !result.sanitized.includes('onerror'),
  },
  {
    name: 'Double-encoded script',
    payload: 'https://example.com?q=%253Cscript%253Ealert(1)%253C/script%253E',
    shouldBlock: false,
    checkSanitized: result => !result.sanitized.includes('<script>'),
  },
  {
    name: 'Null byte injection',
    payload: 'https://example.com\x00javascript:alert(1)',
    shouldBlock: true, // URL parser rejects malformed URLs (good!)
  },
  {
    name: 'URL with embedded HTML',
    payload: 'https://example.com"><iframe src="javascript:alert(1)"></iframe>',
    shouldBlock: false,
    checkSanitized: result => !result.sanitized.includes('<iframe'),
  },
  {
    name: 'Protocol-relative URL with script',
    payload: '//example.com/<script>alert(1)</script>',
    shouldBlock: false,
    checkSanitized: result => !result.sanitized.includes('<script>'),
  },
  {
    name: 'Mixed case JavaScript protocol',
    payload: 'JaVaScRiPt:alert(1)',
    shouldBlock: true,
  },
  {
    name: 'Tab-encoded JavaScript',
    payload: 'java\tscript:alert(1)',
    shouldBlock: true, // URL parser rejects malformed protocols (good!)
  },
];

let passed = 0;
let failed = 0;

maliciousPayloads.forEach(({ name, payload, shouldBlock, checkSanitized }) => {
  try {
    const result = validateUrl(payload);

    if (shouldBlock) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Payload: ${payload}`);
      console.log('   Expected: Should be BLOCKED');
      console.log(`   Got: Allowed with result: ${JSON.stringify(result)}`);
      console.log('');
      failed++;
    } else {
      // Should not block, but should sanitize
      if (checkSanitized && !checkSanitized(result)) {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Payload: ${payload}`);
        console.log('   Expected: Should be sanitized');
        console.log(`   Got: ${result.sanitized}`);
        console.log('');
        failed++;
      } else {
        console.log(`✅ PASSED: ${name}`);
        console.log(`   Payload: ${payload}`);
        console.log(`   Result: Sanitized to ${result.sanitized.substring(0, 80)}...`);
        console.log('');
        passed++;
      }
    }
  } catch (error) {
    if (shouldBlock) {
      console.log(`✅ PASSED: ${name}`);
      console.log(`   Payload: ${payload}`);
      console.log(`   Result: Blocked with ${error.name}: ${error.message}`);
      console.log('');
      passed++;
    } else {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Payload: ${payload}`);
      console.log('   Expected: Should be allowed (with sanitization)');
      console.log(`   Got: ${error.name}: ${error.message}`);
      console.log('');
      failed++;
    }
  }
});

console.log('=== SUMMARY ===');
console.log(`Total tests: ${maliciousPayloads.length}`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Success rate: ${((passed / maliciousPayloads.length) * 100).toFixed(1)}%`);

if (failed > 0) {
  process.exit(1);
}
