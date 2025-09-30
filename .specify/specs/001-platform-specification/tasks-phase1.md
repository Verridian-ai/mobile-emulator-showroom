# Phase 1 Implementation Tasks - Mobile Emulator Platform

**Generated:** 2025-09-30
**Specification:** 001-platform-specification
**Phase:** 1 - Foundation & Critical Fixes
**Duration:** 2 weeks (10 working days)
**Methodology:** Test-Driven Development (TDD) + Spec-Kit

---

## Task Breakdown Philosophy

Following spec-kit `/tasks` methodology:
- Each task is independently testable
- Tasks follow dependency order
- Acceptance criteria defined upfront
- Aligned with constitution principles
- TDD approach (test first, implement, refactor)

---

## Sprint 1: Week 1 - Assets, Security, Infrastructure

### 🔴 CRITICAL PATH - Day 1-2

#### Task 1.1: Asset Audit and Optimization Strategy
**Priority:** P0 (Blocker)
**Estimated Time:** 2 hours
**Assigned To:** Implementation Agent

**Description:**
Audit all assets, identify optimization targets, create optimization plan.

**Acceptance Criteria:**
- [ ] Complete asset inventory with sizes
- [ ] Identify assets > 1MB
- [ ] Create optimization targets document
- [ ] Select tools for image optimization
- [ ] Decision on video background (remove vs. lazy-load)

**Test Plan:**
```bash
# Verification script
ls -lh public/ | grep -E "\.(png|jpg|mp4|svg)" | awk '{print $5, $9}'
```

**Dependencies:** None

**Constitution Alignment:** Article II (Performance & Optimization)

---

#### Task 1.2: Optimize Large PNG Images
**Priority:** P0 (Blocker)
**Estimated Time:** 3 hours
**Depends On:** Task 1.1

**Description:**
Optimize all PNG images using Sharp.js or Squoosh, convert to WebP/AVIF with fallbacks.

**Targets:**
- `new_electronic_logo.png`: 7.9MB → 50KB
- `Verridian_logo_1.png`: 18.9MB → 100KB
- `gold_1.png`: 17.2MB → 200KB or remove
- `Verridian_V.png`: 1.9MB → 50KB
- `verridian-logo-cosmic.png`: 1.9MB → 100KB
- `verridian-showroom-screenshot.png`: 3.6MB → 300KB

**Acceptance Criteria:**
- [ ] All images < 500KB each
- [ ] WebP format with PNG fallback
- [ ] Responsive srcset implemented
- [ ] Visual quality maintained (subjective review)
- [ ] Total image assets < 1.5MB

**Test Plan:**
```javascript
// tests/unit/asset-optimization.test.js
describe('Asset Optimization', () => {
  it('should have all images under 500KB', async () => {
    const images = await glob('public/**/*.{png,jpg,webp}');
    for (const img of images) {
      const size = fs.statSync(img).size;
      expect(size).toBeLessThan(500 * 1024);
    }
  });
});
```

**Implementation Steps:**
1. Install Sharp.js: `pnpm add -D sharp`
2. Create optimization script: `scripts/optimize-images.js`
3. Run optimization on all targets
4. Update HTML to use optimized images
5. Verify visual quality
6. Run tests

**Dependencies:** Task 1.1

**Constitution Alignment:** Article II (Performance), Article IX (Asset Management)

---

#### Task 1.3: Handle Background Video
**Priority:** P0 (Blocker)
**Estimated Time:** 2 hours
**Depends On:** Task 1.1

**Description:**
Remove 37MB background video, replace with CSS gradient or lightweight SVG animation.

**Options Evaluated:**
1. Remove entirely → Use CSS gradient
2. Replace with 5-second loop GIF (< 2MB)
3. Lazy-load video after page interactive

**Decision:** Option 1 (CSS gradient) for Phase 1

**Acceptance Criteria:**
- [ ] Video file removed from public/
- [ ] CSS gradient background implemented
- [ ] Maintains cosmic/space theme aesthetic
- [ ] No visual "flash" or jarring change
- [ ] Page load < 2 seconds

**Test Plan:**
```javascript
// tests/e2e/page-load.spec.js
test('page loads in under 2 seconds', async ({ page }) => {
  const start = Date.now();
  await page.goto('http://localhost:4175');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - start;
  expect(loadTime).toBeLessThan(2000);
});
```

**Implementation Steps:**
1. Remove `background full video.mp4`
2. Update `verridian-media-optimized.css`
3. Create CSS gradient matching cosmic theme
4. Test visual consistency
5. Verify load time improvement

**Dependencies:** Task 1.1

**Constitution Alignment:** Article II (Performance)

---

### 🔒 SECURITY - Day 2-3

#### Task 1.4: Install Security Dependencies
**Priority:** P0 (Blocker)
**Estimated Time:** 1 hour
**Depends On:** None

**Description:**
Install and configure security libraries: helmet, dompurify, express-rate-limit.

**Acceptance Criteria:**
- [ ] Dependencies installed: `helmet`, `dompurify`, `express-rate-limit`, `dotenv`
- [ ] Package.json updated with exact versions
- [ ] Lockfile committed
- [ ] Security audit passes: `pnpm audit`

**Test Plan:**
```bash
# Verify installation
pnpm list helmet dompurify express-rate-limit dotenv
pnpm audit --audit-level=high
```

**Implementation Steps:**
```bash
pnpm add helmet dompurify express-rate-limit dotenv
pnpm add -D @types/dompurify
```

**Dependencies:** None

**Constitution Alignment:** Article V (Security)

---

#### Task 1.5: Implement URL Validation
**Priority:** P0 (Blocker)
**Estimated Time:** 3 hours
**Depends On:** Task 1.4

**Description:**
Create secure URL validation using DOMPurify, prevent XSS and protocol smuggling.

**Acceptance Criteria:**
- [ ] URL validation function with DOMPurify
- [ ] Rejects javascript:, data:, file: protocols
- [ ] Accepts only http: and https:
- [ ] Handles malformed URLs gracefully
- [ ] User-friendly error messages
- [ ] Unit tests with 100% coverage

**Test Plan:**
```javascript
// tests/unit/url-validator.test.js
import { validateUrl, InvalidUrlError } from '@/core/validators';

describe('URL Validation', () => {
  it('accepts valid https URLs', () => {
    expect(validateUrl('https://example.com')).toBe('https://example.com/');
  });

  it('rejects javascript: protocol', () => {
    expect(() => validateUrl('javascript:alert(1)')).toThrow(InvalidUrlError);
  });

  it('rejects data: URLs', () => {
    expect(() => validateUrl('data:text/html,<script>alert(1)</script>'))
      .toThrow(InvalidUrlError);
  });

  it('sanitizes XSS attempts', () => {
    const url = validateUrl('https://example.com<script>alert(1)</script>');
    expect(url).not.toContain('<script>');
  });

  it('handles malformed URLs', () => {
    expect(() => validateUrl('not a url')).toThrow(InvalidUrlError);
  });
});
```

**Implementation Steps:**
1. Create `src/core/validators.js`
2. Write failing tests
3. Implement validateUrl function
4. Integrate into URL input handler
5. Add error UI feedback
6. All tests pass

**Dependencies:** Task 1.4

**Constitution Alignment:** Article V (Security), Article VI (Testing)

---

#### Task 1.6: Implement CSP Headers
**Priority:** P0 (Blocker)
**Estimated Time:** 2 hours
**Depends On:** Task 1.4

**Description:**
Configure Content-Security-Policy headers using Helmet middleware.

**Acceptance Criteria:**
- [ ] CSP headers configured in server.js
- [ ] Strict policy (no unsafe-inline)
- [ ] Nonce-based script loading
- [ ] Frame-src allows all (for device testing)
- [ ] Connect-src limited to self + WebSocket
- [ ] CSP violation reporting endpoint (future)

**Test Plan:**
```javascript
// tests/integration/security-headers.test.js
describe('Security Headers', () => {
  it('should set CSP headers', async () => {
    const response = await fetch('http://localhost:4175');
    const csp = response.headers.get('content-security-policy');
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-src *");
  });

  it('should block inline scripts', async () => {
    const response = await fetch('http://localhost:4175');
    const csp = response.headers.get('content-security-policy');
    expect(csp).not.toContain("'unsafe-inline'");
  });
});
```

**Implementation Steps:**
1. Create `server/middleware/security.js`
2. Configure Helmet with strict CSP
3. Generate nonce for scripts
4. Update server.js to use middleware
5. Test with browser DevTools
6. Verify no CSP violations

**Dependencies:** Task 1.4

**Constitution Alignment:** Article V (Security)

---

#### Task 1.7: Move Inline Scripts to External Files
**Priority:** P1 (High)
**Estimated Time:** 4 hours
**Depends On:** Task 1.6

**Description:**
Extract 180+ lines of inline JavaScript from index.html to external modules.

**Acceptance Criteria:**
- [ ] All inline scripts removed from index.html
- [ ] Code organized into src/main.js and modules
- [ ] Scripts loaded with nonce attribute
- [ ] No functionality broken
- [ ] CSP passes without violations

**Test Plan:**
```javascript
// tests/e2e/inline-scripts.spec.js
test('page has no inline scripts', async ({ page }) => {
  await page.goto('http://localhost:4175');
  const inlineScripts = await page.locator('script:not([src])').count();
  expect(inlineScripts).toBe(0); // Except nonce-based
});
```

**Implementation Steps:**
1. Create `src/main.js` for app initialization
2. Extract device switching logic → `src/core/device-manager.js`
3. Extract URL handling → `src/core/url-handler.js`
4. Extract config → `src/config/constants.js`
5. Update index.html with script tags
6. Add nonce attribute to script tags
7. Test all functionality

**Dependencies:** Task 1.6

**Constitution Alignment:** Article V (Security), Article III (Code Quality)

---

#### Task 1.8: Remove Hardcoded Secrets
**Priority:** P1 (High)
**Estimated Time:** 2 hours
**Depends On:** Task 1.4

**Description:**
Replace hardcoded WebSocket token with environment variables.

**Acceptance Criteria:**
- [ ] No hardcoded tokens in source code
- [ ] Environment variable system configured
- [ ] .env.example file created
- [ ] .env added to .gitignore
- [ ] Documentation for configuration
- [ ] Graceful fallback for missing env vars

**Test Plan:**
```javascript
// tests/unit/config.test.js
describe('Configuration', () => {
  it('should load WebSocket token from env', () => {
    process.env.WEBSOCKET_TOKEN = 'test123';
    const config = loadConfig();
    expect(config.websocketToken).toBe('test123');
  });

  it('should warn if token missing', () => {
    delete process.env.WEBSOCKET_TOKEN;
    const spy = jest.spyOn(console, 'warn');
    loadConfig();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('WEBSOCKET_TOKEN'));
  });
});
```

**Implementation Steps:**
1. Create `.env.example` with all config vars
2. Create `src/config/env.js` loader
3. Replace hardcoded values with env vars
4. Update server.js to use dotenv
5. Document in README
6. Add .env to .gitignore

**Dependencies:** Task 1.4

**Constitution Alignment:** Article V (Security)

---

### 🧹 CODE CLEANUP - Day 4

#### Task 1.9: Audit JavaScript Files
**Priority:** P1 (High)
**Estimated Time:** 3 hours
**Depends On:** None

**Description:**
Create dependency graph, identify unused files, document each file's purpose.

**Acceptance Criteria:**
- [ ] Dependency graph created (visual diagram)
- [ ] Each JS file documented with purpose
- [ ] Unused files identified (list)
- [ ] Files categorized: core, ui, integration, unused
- [ ] Recommendation for archival

**Test Plan:**
```bash
# Generate dependency report
npx madge --image graph.svg public/
npx depcheck
```

**Implementation Steps:**
1. Install madge: `pnpm add -D madge`
2. Generate dependency graph
3. Manually trace imports from index.html
4. Document findings in audit report
5. Create categorization matrix

**Dependencies:** None

**Constitution Alignment:** Article III (Code Quality), Article I (Modularity)

---

#### Task 1.10: Archive Unused Files
**Priority:** P2 (Medium)
**Estimated Time:** 2 hours
**Depends On:** Task 1.9

**Description:**
Move unused JavaScript files to archive/ directory, preserve git history.

**Acceptance Criteria:**
- [ ] archive/old-public/ directory created
- [ ] 50+ unused files moved
- [ ] Git history preserved
- [ ] Documentation updated
- [ ] No functionality broken
- [ ] Remaining files < 15

**Test Plan:**
```bash
# Verify file count
ls -1 public/*.js | wc -l  # Should be < 15
# Verify app still works
pnpm start && curl http://localhost:4175
```

**Implementation Steps:**
1. Create `archive/old-public/` directory
2. Move unused files with git mv
3. Update APP_MAP.md
4. Test application functionality
5. Commit with descriptive message

**Dependencies:** Task 1.9

**Constitution Alignment:** Article III (Code Quality)

---

### ⚙️ BUILD SYSTEM - Day 5

#### Task 1.11: Setup Vite Build System
**Priority:** P1 (High)
**Estimated Time:** 4 hours
**Depends On:** Task 1.7, Task 1.10

**Description:**
Configure Vite for development and production builds with HMR.

**Acceptance Criteria:**
- [ ] vite.config.js created
- [ ] Dev server runs on port 4175
- [ ] HMR works for JS and CSS
- [ ] Production build < 500KB
- [ ] Source maps generated
- [ ] Build completes in < 10 seconds

**Test Plan:**
```bash
# Dev server
pnpm dev  # Should start instantly
# Production build
pnpm build  # Should complete < 10s
ls -lh dist/assets/*.js  # Check bundle size
```

**Implementation Steps:**
1. Install Vite: `pnpm add -D vite`
2. Create `vite.config.js`
3. Update package.json scripts
4. Configure path aliases
5. Test dev server
6. Test production build
7. Optimize bundle splitting

**Dependencies:** Task 1.7, Task 1.10

**Constitution Alignment:** Article II (Performance), Article VII (Development Workflow)

---

#### Task 1.12: Migrate to ES Modules
**Priority:** P1 (High)
**Estimated Time:** 5 hours
**Depends On:** Task 1.11

**Description:**
Convert remaining files to ES modules (import/export) for tree-shaking.

**Acceptance Criteria:**
- [ ] All JS files use import/export
- [ ] No global variables except window.DeviceEmulator API
- [ ] Tree-shaking works (unused code removed)
- [ ] Bundle size reduced by 30%+
- [ ] All tests pass

**Test Plan:**
```javascript
// Verify no globals
test('should not pollute global scope', () => {
  const globals = Object.keys(window);
  const allowed = ['DeviceEmulator', 'location', 'document', /* native APIs */];
  const unexpected = globals.filter(g => !allowed.includes(g));
  expect(unexpected).toEqual([]);
});
```

**Implementation Steps:**
1. Convert device-manager.js to ES module
2. Convert url-handler.js to ES module
3. Convert validators.js to ES module
4. Update imports in main.js
5. Test tree-shaking with bundle analysis
6. Verify bundle size reduction

**Dependencies:** Task 1.11

**Constitution Alignment:** Article III (Code Quality), Article I (Modularity)

---

### 🐳 INFRASTRUCTURE - Day 5

#### Task 1.13: Create Dockerfile
**Priority:** P1 (High)
**Estimated Time:** 3 hours
**Depends On:** Task 1.11

**Description:**
Create multi-stage Dockerfile for optimized cloud deployment.

**Acceptance Criteria:**
- [ ] Multi-stage build (builder + runner)
- [ ] Image size < 200MB
- [ ] Non-root user for security
- [ ] Health check endpoint
- [ ] Environment variable support
- [ ] Build time < 5 minutes

**Test Plan:**
```bash
# Build image
docker build -t mobile-emulator:test .
# Check size
docker images mobile-emulator:test  # < 200MB
# Run container
docker run -p 4175:4175 mobile-emulator:test
# Health check
curl http://localhost:4175/healthz
```

**Implementation Steps:**
1. Create `Dockerfile`
2. Create `.dockerignore`
3. Test local build
4. Optimize layers
5. Add health check
6. Document in README

**Dependencies:** Task 1.11

**Constitution Alignment:** Article VII (Development Workflow)

---

#### Task 1.14: Environment Configuration System
**Priority:** P1 (High)
**Estimated Time:** 2 hours
**Depends On:** Task 1.8, Task 1.13

**Description:**
Create comprehensive environment configuration with validation.

**Acceptance Criteria:**
- [ ] .env.example with all variables
- [ ] Environment validation on startup
- [ ] Sensible defaults
- [ ] Documentation for each variable
- [ ] Type checking for env vars

**Test Plan:**
```javascript
// tests/unit/env-validation.test.js
describe('Environment Validation', () => {
  it('should validate required variables', () => {
    delete process.env.PORT;
    expect(() => loadEnv()).toThrow('PORT is required');
  });

  it('should use defaults when optional vars missing', () => {
    delete process.env.WEBSOCKET_ENABLED;
    const config = loadEnv();
    expect(config.websocketEnabled).toBe(false);
  });
});
```

**Implementation Steps:**
1. Create `src/config/env.js`
2. Define all environment variables
3. Add validation logic
4. Create .env.example
5. Update documentation
6. Test with missing/invalid vars

**Dependencies:** Task 1.8, Task 1.13

**Constitution Alignment:** Article VII (Development Workflow)

---

### 🧪 TESTING - Day 6-7

#### Task 1.15: Setup Testing Framework
**Priority:** P1 (High)
**Estimated Time:** 3 hours
**Depends On:** Task 1.11

**Description:**
Configure Vitest for unit tests and Playwright for E2E tests.

**Acceptance Criteria:**
- [ ] Vitest configured and running
- [ ] Playwright installed
- [ ] Test scripts in package.json
- [ ] Coverage reporting configured
- [ ] CI-friendly test output
- [ ] Example tests passing

**Test Plan:**
```bash
# Unit tests
pnpm test:unit
# E2E tests
pnpm test:e2e
# Coverage
pnpm test:coverage  # Should generate reports
```

**Implementation Steps:**
1. Install Vitest: `pnpm add -D vitest @vitest/ui`
2. Install Playwright: `pnpm add -D @playwright/test`
3. Create `vitest.config.js`
4. Create `playwright.config.js`
5. Add test scripts to package.json
6. Create example tests
7. Run and verify

**Dependencies:** Task 1.11

**Constitution Alignment:** Article VI (Testing & Validation)

---

#### Task 1.16: Write Core Unit Tests
**Priority:** P1 (High)
**Estimated Time:** 6 hours
**Depends On:** Task 1.15, Task 1.12

**Description:**
Write unit tests for validators, device manager, URL handler (target: 80% coverage).

**Acceptance Criteria:**
- [ ] validators.js: 100% coverage
- [ ] device-manager.js: 90% coverage
- [ ] url-handler.js: 90% coverage
- [ ] All edge cases tested
- [ ] Tests run in < 5 seconds
- [ ] CI-ready (no flakiness)

**Test Plan:**
Tests are self-validating. Coverage report must show 80%+.

**Implementation Steps:**
1. Write tests for validators (Task 1.5 tests)
2. Write tests for device-manager
3. Write tests for url-handler
4. Write tests for env config
5. Run coverage report
6. Fill gaps to reach 80%

**Dependencies:** Task 1.15, Task 1.12

**Constitution Alignment:** Article VI (Testing)

---

#### Task 1.17: Write E2E Critical Path Tests
**Priority:** P1 (High)
**Estimated Time:** 5 hours
**Depends On:** Task 1.15, Task 1.12

**Description:**
Write Playwright tests for critical user workflows (device switch, URL load).

**Acceptance Criteria:**
- [ ] Test: Page loads successfully
- [ ] Test: Device switching works
- [ ] Test: URL loading works
- [ ] Test: Invalid URL shows error
- [ ] Test: Device frame updates correctly
- [ ] All tests pass consistently (no flakes)

**Test Plan:**
```javascript
// tests/e2e/critical-paths.spec.js
test('complete workflow', async ({ page }) => {
  // 1. Load page
  await page.goto('http://localhost:4175');
  await expect(page.locator('#deviceFrame')).toBeVisible();

  // 2. Switch device
  await page.click('[data-device="galaxy-s24"]');
  await expect(page.locator('#deviceFrame')).toHaveClass(/galaxy-s24/);

  // 3. Load URL
  await page.fill('#urlInput', 'example.com');
  await page.click('#urlSubmit');
  const iframe = page.frameLocator('#deviceIframe');
  await expect(iframe.locator('body')).toBeVisible();

  // 4. Test invalid URL
  await page.fill('#urlInput', 'javascript:alert(1)');
  await page.click('#urlSubmit');
  await expect(page.locator('.error-message')).toBeVisible();
});
```

**Dependencies:** Task 1.15, Task 1.12

**Constitution Alignment:** Article VI (Testing)

---

### 🎨 POLISH - Day 7

#### Task 1.18: Configure ESLint and Prettier
**Priority:** P2 (Medium)
**Estimated Time:** 2 hours
**Depends On:** Task 1.12

**Description:**
Setup code quality tools with reasonable rules for team consistency.

**Acceptance Criteria:**
- [ ] ESLint configured
- [ ] Prettier configured
- [ ] Pre-commit hooks installed
- [ ] All existing code passes linting
- [ ] Format-on-save in VS Code
- [ ] Documentation for rules

**Test Plan:**
```bash
# Lint
pnpm lint  # Should pass
# Format
pnpm format  # Should format all files
# Pre-commit
git commit -m "test"  # Should trigger hooks
```

**Implementation Steps:**
1. Install ESLint: `pnpm add -D eslint`
2. Install Prettier: `pnpm add -D prettier`
3. Install husky: `pnpm add -D husky lint-staged`
4. Create `.eslintrc.json`
5. Create `.prettierrc.json`
6. Setup pre-commit hooks
7. Fix all existing violations

**Dependencies:** Task 1.12

**Constitution Alignment:** Article III (Code Quality)

---

#### Task 1.19: Update Documentation
**Priority:** P2 (Medium)
**Estimated Time:** 3 hours
**Depends On:** All previous tasks

**Description:**
Update README, create ARCHITECTURE.md, document all changes.

**Acceptance Criteria:**
- [ ] README.md updated with new setup
- [ ] ARCHITECTURE.md created
- [ ] Environment variables documented
- [ ] Development workflow documented
- [ ] Docker deployment documented
- [ ] Troubleshooting guide

**Test Plan:**
New developer should be able to:
1. Clone repo
2. Follow README
3. Start dev server
4. Make changes
5. Run tests
6. Build for production

**Implementation Steps:**
1. Update README.md
2. Create docs/ARCHITECTURE.md
3. Create docs/DEPLOYMENT.md
4. Update APP_MAP.md
5. Document breaking changes
6. Add troubleshooting section

**Dependencies:** All previous tasks

**Constitution Alignment:** Article III (Code Quality)

---

#### Task 1.20: Performance Validation
**Priority:** P1 (High)
**Estimated Time:** 2 hours
**Depends On:** Task 1.11, Task 1.2, Task 1.3

**Description:**
Run Lighthouse audits, verify performance targets met.

**Acceptance Criteria:**
- [ ] Lighthouse Performance score > 90
- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 2s
- [ ] Bundle size < 500KB
- [ ] No console errors
- [ ] All images optimized

**Test Plan:**
```bash
# Lighthouse CI
npx lighthouse http://localhost:4175 --view
# Bundle analysis
npx vite-bundle-visualizer
```

**Implementation Steps:**
1. Run Lighthouse audit
2. Identify bottlenecks
3. Fix issues
4. Re-run audit
5. Document results
6. Create performance baseline

**Dependencies:** Task 1.11, Task 1.2, Task 1.3

**Constitution Alignment:** Article II (Performance)

---

## Summary

### Total Tasks: 20
- **Critical (P0):** 10 tasks
- **High (P1):** 9 tasks
- **Medium (P2):** 1 task

### Time Estimate: 10 days (2 weeks)
- **Day 1-2:** Asset optimization
- **Day 2-3:** Security implementation
- **Day 4:** Code cleanup
- **Day 5:** Build system & infrastructure
- **Day 6-7:** Testing
- **Day 7:** Polish & validation

### Expected Outcomes:
- ✅ Load time: 30s → < 2s (93% improvement)
- ✅ Bundle size: Unknown → < 500KB
- ✅ Security: Multiple vulnerabilities → Zero critical
- ✅ Test coverage: 0% → 80%+
- ✅ Files: 67 → < 15 organized modules
- ✅ Cloud-ready: Docker container with env config

### Constitution Compliance:
- ✅ Article I: Modularity (ES modules, clean architecture)
- ✅ Article II: Performance (< 2s load, optimized assets)
- ✅ Article III: Code Quality (ESLint, Prettier, docs)
- ✅ Article V: Security (CSP, validation, no secrets)
- ✅ Article VI: Testing (80% coverage, E2E tests)
- ✅ Article VII: Development (Vite, Docker, env config)

---

## Ready for `/implement`

**Status:** ✅ Tasks defined, ready for implementation

**Next Command:** `/implement` - Execute tasks following TDD methodology

**Validation:** Each task completion will be validated against:
1. Acceptance criteria met
2. Tests passing
3. Constitution principles upheld
4. Specification requirements satisfied