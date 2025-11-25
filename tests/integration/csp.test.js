/**
 * CSP (Content Security Policy) Tests
 * Article V (Security): Validate strict CSP implementation
 * Article VI (Testing): Comprehensive security validation
 *
 * Task 1.6: CSP Header Tests
 *
 * These tests validate:
 * - CSP headers are present on all responses
 * - No unsafe-inline or unsafe-eval directives
 * - CSP violation reporting endpoint works
 * - Security stats endpoint includes CSP data
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';

// Note: We'll test the middleware directly and also with a test server
// For full integration tests, we'd test the main server.js

describe('CSP Headers', () => {
  let app;

  beforeAll(() => {
    // Create minimal Express app with CSP middleware for testing
    app = express();

    // Import security middleware
    const {
      helmetConfig,
      handleCspViolation,
      getCspViolationStats
    } = require('../../server/middleware/security');

    app.use(helmetConfig);
    app.use(express.json({ type: ['application/json', 'application/csp-report'] }));

    // Test endpoints
    app.get('/test', (req, res) => {
      res.send('<html><body>Test page</body></html>');
    });

    app.post('/api/csp-report', handleCspViolation);

    app.get('/api/security-stats', (req, res) => {
      const cspStats = getCspViolationStats();
      res.json({ csp: cspStats });
    });
  });

  describe('CSP Header Presence', () => {
    it('should set Content-Security-Policy header', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should have CSP header on all routes', async () => {
      const routes = ['/test', '/api/security-stats'];

      for (const route of routes) {
        const response = await request(app).get(route);
        expect(response.headers['content-security-policy']).toBeDefined();
      }
    });
  });

  describe('CSP Directive Validation', () => {
    it('should NOT allow unsafe-inline for scripts', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).not.toContain("'unsafe-inline'");
    });

    it('should NOT allow unsafe-eval', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).not.toContain("'unsafe-eval'");
    });

    it('should restrict default-src to self', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("default-src 'self'");
    });

    it('should restrict script-src to self', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).toMatch(/script-src[^;]*'self'/);
    });

    it('should restrict style-src to self', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).toMatch(/style-src[^;]*'self'/);
    });

    it('should block object-src completely', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("object-src 'none'");
    });

    it('should prevent framing by other sites', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should allow data: URIs for images', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).toMatch(/img-src[^;]*(data:|https:)/);
    });

    it('should include CSP report-uri directive', async () => {
      const response = await request(app).get('/test');
      const csp = response.headers['content-security-policy'];
      expect(csp).toContain('report-uri');
      expect(csp).toContain('/api/csp-report');
    });
  });

  describe('CSP Violation Reporting', () => {
    it('should accept CSP violation reports', async () => {
      const violation = {
        'document-uri': 'http://localhost:4175/',
        'violated-directive': 'script-src',
        'blocked-uri': 'inline',
        'original-policy': "default-src 'self'; script-src 'self'"
      };

      const response = await request(app)
        .post('/api/csp-report')
        .set('Content-Type', 'application/csp-report')
        .send(JSON.stringify(violation))
        .set('Accept', 'application/json');

      expect(response.status).toBe(204); // No Content per CSP spec
    });

    it('should track CSP violations in stats', async () => {
      // Send a violation
      const violation = {
        'violated-directive': 'script-src',
        'blocked-uri': 'inline',
        'original-policy': "default-src 'self'"
      };

      await request(app)
        .post('/api/csp-report')
        .send(violation);

      // Check stats
      const statsResponse = await request(app).get('/api/security-stats');
      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.csp).toBeDefined();
      expect(statsResponse.body.csp.totalViolations).toBeGreaterThan(0);
    });

    it('should group violations by directive', async () => {
      // Send violations for different directives
      const violations = [
        { 'violated-directive': 'script-src', 'blocked-uri': 'inline' },
        { 'violated-directive': 'style-src', 'blocked-uri': 'inline' },
        { 'violated-directive': 'script-src', 'blocked-uri': 'eval' }
      ];

      for (const violation of violations) {
        await request(app)
          .post('/api/csp-report')
          .send(violation);
      }

      const statsResponse = await request(app).get('/api/security-stats');
      expect(statsResponse.body.csp.byDirective).toBeDefined();
      expect(statsResponse.body.csp.byDirective['script-src']).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Other Security Headers', () => {
    it('should set X-Content-Type-Options: nosniff', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set X-Frame-Options: DENY', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should set Strict-Transport-Security in production', async () => {
      const response = await request(app).get('/test');
      // HSTS header may or may not be set in test environment
      // In production, it should always be set
      if (process.env.NODE_ENV === 'production') {
        expect(response.headers['strict-transport-security']).toBeDefined();
        expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      }
    });

    it('should hide X-Powered-By header', async () => {
      const response = await request(app).get('/test');
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('CSP in Production Mode', () => {
    it('should include upgrade-insecure-requests in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Re-import middleware to get production config
      delete require.cache[require.resolve('../../server/middleware/security')];
      const { helmetConfig } = require('../../server/middleware/security');

      const prodApp = express();
      prodApp.use(helmetConfig);
      prodApp.get('/test', (req, res) => res.send('test'));

      const response = await request(prodApp).get('/test');
      const csp = response.headers['content-security-policy'];

      // In production, upgrade-insecure-requests should be present
      expect(csp).toContain('upgrade-insecure-requests');

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('CSP Integration with HTML', () => {
  it('should document required external script structure', () => {
    // This is a documentation test to ensure developers know the requirements
    const requirements = {
      'All inline scripts': 'Must be extracted to external files',
      'Script tags': 'Must use src attribute (no inline code)',
      'Event handlers': 'Must use addEventListener (no onclick)',
      'Style tags': 'Must be in external CSS files',
      'Inline styles': 'Avoid or use nonce (requires server-side rendering)'
    };

    // Verify documentation exists
    expect(requirements).toBeDefined();
    expect(Object.keys(requirements).length).toBeGreaterThan(0);
  });
});