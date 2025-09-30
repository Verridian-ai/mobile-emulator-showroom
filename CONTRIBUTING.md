# Contributing Guide

Welcome to the Mobile Emulator Platform! This guide will help you get started with development.

## Table of Contents

- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Constitution Compliance](#constitution-compliance)

## Development Setup

### Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **npm**: 9+ or pnpm 8+
- **Git**: Latest version
- **Docker**: Optional, for containerized development

### Initial Setup

1. **Fork and clone the repository:**

```bash
git clone https://github.com/YOUR_USERNAME/mobile-emulator-showroom.git
cd mobile-emulator-showroom
```

2. **Install dependencies:**

```bash
npm install
```

3. **Create environment file:**

```bash
cp .env.example .env
```

Edit `.env` and set required values (see `.env.example` for documentation).

4. **Start development server:**

```bash
npm run dev
```

The application will be available at `http://localhost:4175`.

5. **Verify setup:**

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Development Workflow

### Branch Strategy

We use a simplified Git Flow:

- `main` (or `master`) - Production-ready code, protected
- `feature/*` - New features (e.g., `feature/device-rotation`)
- `fix/*` - Bug fixes (e.g., `fix/url-validation-edge-case`)
- `refactor/*` - Code improvements (e.g., `refactor/security-module`)
- `docs/*` - Documentation updates (e.g., `docs/architecture-diagrams`)

**Multi-Agent Development** (if using Spec-Kit):
- `agent/frontend-ui` - Frontend UI specialist work
- `agent/backend-infrastructure` - Backend specialist work
- `agent/core-business-logic` - Core logic specialist work
- `agent/build-tooling` - Build & tooling specialist work
- `agent/testing-qa` - Testing specialist work
- `agent/github-integration` - GitHub specialist work

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc. (no code change)
- `refactor`: Code restructuring (no feature change)
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance (deps, build config)

**Examples:**

```bash
git commit -m "feat(core): add device rotation support"
git commit -m "fix(security): prevent XSS in URL validator"
git commit -m "docs(readme): update installation instructions"
git commit -m "perf(build): reduce bundle size by 30%"
git commit -m "test(e2e): add device switching scenarios"
```

**For Spec-Kit/Constitution compliance**, append article references:

```bash
git commit -m "feat(security): implement strict CSP headers

Implements Content Security Policy with nonce-based script loading.
All inline scripts moved to external files.

Article V (Security), Article III (Code Quality) compliance
Task: 1.6, 1.7"
```

### Daily Workflow

1. **Sync with main:**

```bash
git checkout main
git pull origin main
```

2. **Create feature branch:**

```bash
git checkout -b feature/your-feature-name
```

3. **Make changes** (follow TDD: test first!)

4. **Run tests frequently:**

```bash
npm test                # Unit tests (watch mode)
npm run test:e2e        # E2E tests (when UI changes)
```

5. **Commit incrementally:**

```bash
git add src/core/new-feature.js tests/unit/new-feature.test.js
git commit -m "feat(core): add new feature"
```

6. **Push to your fork:**

```bash
git push origin feature/your-feature-name
```

7. **Open Pull Request** (see PR process below)

## Code Style

### JavaScript Style Guide

We follow **Airbnb JavaScript Style Guide** with some modifications:

**Key Rules:**
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline
- Arrow functions preferred
- Destructuring when possible

**Example:**

```javascript
// ✅ Good
import { validateURL } from '@/core/validators/url-validator.js';

export function loadDeviceFrame(deviceId) {
  const { width, height } = getDeviceDimensions(deviceId);
  return {
    deviceId,
    viewport: { width, height },
  };
}

// ❌ Bad
const validateURL = require('./url-validator');  // Use ES imports

export function loadDeviceFrame(deviceId) {
    var dimensions = getDeviceDimensions(deviceId);  // Use const/let, not var
    return {
        deviceId: deviceId,  // Use shorthand
        viewport: {width: dimensions.width, height: dimensions.height}  // Destructure
    }  // Missing semicolon
}
```

### Linting and Formatting

**ESLint** (future): Automated linting
```bash
npm run lint         # Check for issues
npm run lint:fix     # Auto-fix issues
```

**Prettier** (future): Code formatting
```bash
npm run format       # Format all files
```

**Pre-commit hooks** (future): Husky + lint-staged will automatically:
- Run ESLint on staged files
- Format code with Prettier
- Run relevant tests

### JSDoc Documentation

All public functions must have JSDoc comments:

```javascript
/**
 * Validates and sanitizes a user-provided URL.
 *
 * @param {string} url - The URL to validate
 * @param {object} [options] - Validation options
 * @param {boolean} [options.allowLocalhost=false] - Allow localhost URLs
 * @returns {string} The sanitized URL
 * @throws {InvalidURLError} If URL is malformed or uses disallowed protocol
 *
 * @example
 * const safeUrl = validateURL('https://example.com');
 * // Returns: 'https://example.com/'
 *
 * @example
 * validateURL('javascript:alert(1)');
 * // Throws: InvalidURLError('Disallowed protocol: javascript:')
 */
export function validateURL(url, options = {}) {
  // Implementation...
}
```

### CSS Style Guide

**Key Principles:**
- BEM naming convention for classes
- CSS custom properties for theming
- Mobile-first responsive design
- Avoid `!important` (use specificity)

**Example:**

```css
/* ✅ Good - BEM naming */
.device-frame {
  position: relative;
  border-radius: var(--border-radius-lg);
}

.device-frame__viewport {
  width: 100%;
  height: 100%;
}

.device-frame--iphone {
  aspect-ratio: 9 / 19.5;
}

/* ❌ Bad - Generic names, unclear hierarchy */
.frame {
  position: relative;
}

.viewport {
  width: 100% !important;  /* Avoid !important */
}

.iphone {
  aspect-ratio: 9 / 19.5;
}
```

## Testing Requirements

### Test-Driven Development (TDD)

We follow **Red-Green-Refactor** methodology:

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code quality

**Example TDD workflow:**

```javascript
// Step 1: RED - Write failing test
import { describe, it, expect } from 'vitest';
import { calculateDeviceAspectRatio } from '@/core/device-utils.js';

describe('calculateDeviceAspectRatio', () => {
  it('should calculate iPhone 14 Pro aspect ratio', () => {
    const result = calculateDeviceAspectRatio('iphone-14-pro');
    expect(result).toBeCloseTo(9 / 19.5);
  });
});

// Run test: FAIL (function doesn't exist)

// Step 2: GREEN - Minimal implementation
export function calculateDeviceAspectRatio(deviceId) {
  if (deviceId === 'iphone-14-pro') return 9 / 19.5;
  throw new Error('Unknown device');
}

// Run test: PASS

// Step 3: REFACTOR - Better implementation
const DEVICE_SPECS = {
  'iphone-14-pro': { width: 393, height: 852 },
  'galaxy-s24': { width: 360, height: 780 },
  // ...
};

export function calculateDeviceAspectRatio(deviceId) {
  const spec = DEVICE_SPECS[deviceId];
  if (!spec) throw new Error(`Unknown device: ${deviceId}`);
  return spec.width / spec.height;
}

// Run test: PASS
// Add more test cases...
```

### Unit Test Guidelines

**Coverage Requirements:**
- Core logic: 100% coverage
- Validators: 100% coverage
- Utilities: 90%+ coverage
- UI components: 80%+ coverage

**Test Structure:**

```javascript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Module Name', () => {
  // Setup
  beforeEach(() => {
    // Initialize test environment
  });

  afterEach(() => {
    // Clean up
  });

  describe('Function Name', () => {
    it('should handle happy path', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = functionName(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      expect(() => functionName('')).toThrow();
    });

    it('should handle error conditions', () => {
      // ...
    });
  });
});
```

**Running Unit Tests:**

```bash
npm test                # Watch mode (for development)
npm run test:run        # Single run (for CI)
npm run test:coverage   # Generate coverage report
npm run test:ui         # Visual test UI
```

### E2E Test Guidelines

**When to Write E2E Tests:**
- Critical user workflows
- Cross-component interactions
- Browser-specific behaviors
- Visual regressions

**Test Structure:**

```javascript
import { test, expect } from '@playwright/test';

test.describe('US-1: Device Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4175');
  });

  test('should allow user to switch between devices', async ({ page }) => {
    // Arrange: Verify initial state
    await expect(page.locator('#deviceFrame')).toBeVisible();

    // Act: Switch device
    await page.click('[data-device="galaxy-s24"]');

    // Assert: Device changed
    await expect(page.locator('#deviceFrame')).toHaveAttribute(
      'data-current-device',
      'galaxy-s24'
    );

    // Assert: Viewport dimensions updated
    const viewport = page.locator('#deviceFrame iframe');
    await expect(viewport).toHaveCSS('width', '360px');
  });

  test('should complete device switch in < 300ms', async ({ page }) => {
    const startTime = Date.now();
    await page.click('[data-device="pixel-8-pro"]');
    await page.waitForSelector('[data-current-device="pixel-8-pro"]');
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(300);
  });
});
```

**Running E2E Tests:**

```bash
npm run test:e2e              # All browsers headless
npm run test:e2e:ui           # Interactive UI mode
npm run test:e2e:headed       # Visible browser
npm run test:e2e:chromium     # Chromium only
npm run test:e2e:firefox      # Firefox only
npm run test:e2e:webkit       # WebKit/Safari only
```

### Test Coverage Goals

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| Overall | > 80% | ~75% | 🟡 In Progress |
| Validators | 100% | 100% | ✅ Met |
| Security | 100% | 100% | ✅ Met |
| Core Logic | 90% | ~70% | 🟡 In Progress |
| UI Components | 80% | ~60% | 🟡 In Progress |
| E2E Scenarios | 100% of user stories | ~80% | 🟡 In Progress |

## Pull Request Process

### Before Opening a PR

**Checklist:**
- [ ] All tests pass (`npm test && npm run test:e2e`)
- [ ] Code coverage meets targets
- [ ] Linting passes (`npm run lint` - future)
- [ ] Code formatted (`npm run format` - future)
- [ ] Documentation updated (if API changes)
- [ ] Commit messages follow convention
- [ ] Constitution compliance verified

### Opening a PR

1. **Push your branch:**

```bash
git push origin feature/your-feature-name
```

2. **Create PR on GitHub** with this template:

```markdown
## Summary
Brief description of changes (2-3 sentences)

## Changes
- Bullet list of specific changes
- Include files modified
- Note any breaking changes

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Constitution Compliance
- [ ] Article I (Architecture) - Modularity maintained
- [ ] Article II (Performance) - No performance regression
- [ ] Article III (Code Quality) - Well-documented, tested
- [ ] Article V (Security) - No new vulnerabilities
- [ ] Article VI (Testing) - Adequate test coverage

## Screenshots (if UI changes)
[Attach before/after screenshots]

## Related Issues
Closes #123
Relates to #456
```

3. **Request review** from maintainers

### PR Review Process

**For Authors:**
- Respond to feedback promptly
- Make requested changes in new commits (don't force-push)
- Mark conversations as resolved when addressed
- Re-request review after changes

**For Reviewers:**
- Review code, not the person
- Ask questions, don't demand changes
- Suggest improvements with rationale
- Approve when requirements met

**Approval Criteria:**
- ✅ Code quality (readable, maintainable)
- ✅ Tests comprehensive (covers edge cases)
- ✅ Constitution compliance (articles followed)
- ✅ Performance (no regressions)
- ✅ Security (no vulnerabilities)
- ✅ Documentation (updated if needed)

### Merging

**Merge Requirements:**
- 1+ approvals (2 for sensitive changes)
- All CI checks passing
- No unresolved conversations
- Up-to-date with `main` branch

**Merge Strategy:**
- **Squash and merge** for feature branches (clean history)
- **Merge commit** for agent branches (preserve agent work)

```bash
# Orchestrator merges after approval
git checkout main
git merge --no-ff feature/your-feature-name
git push origin main
```

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

**Key Directories:**
- `src/` - Source code (your changes go here)
- `tests/` - Test suites
- `public/` - Static assets
- `server/` - Backend code
- `.specify/` - Spec-Kit specifications (read-only)

**Important Files:**
- `.specify/memory/constitution.md` - Project principles (read before coding!)
- `.specify/specs/001-platform-specification/spec.md` - Feature requirements
- `.specify/specs/001-platform-specification/tasks-phase1.md` - Task breakdown

## Constitution Compliance

All contributions must comply with the **9 articles** of the project constitution (`.specify/memory/constitution.md`).

### Quick Reference

**Article I**: Modular architecture, component-based design
**Article II**: Performance (< 2s load, < 300ms device switch, 60fps)
**Article III**: Code quality (DRY, clear naming, documentation)
**Article IV**: User experience (responsive, accessible, clear feedback)
**Article V**: Security (input validation, CSP, no secrets)
**Article VI**: Testing (80%+ coverage, TDD methodology)
**Article VII**: Development workflow (Git, build process, env config)
**Article VIII**: Integration & extensibility (API-first, clean interfaces)
**Article IX**: Asset management (optimized images, branding consistency)

**Before submitting**, verify your changes align with relevant articles.

## Common Tasks

### Adding a New Device

1. **Add device specs** to `src/js/device-data.js`:

```javascript
export const DEVICE_SPECS = {
  'iphone-15-pro': {
    name: 'iPhone 15 Pro',
    width: 393,
    height: 852,
    pixelRatio: 3,
    category: 'iphone',
  },
};
```

2. **Add device frame CSS** to `src/styles/device-skins.css`

3. **Write tests** in `tests/unit/device-specs.test.js`

4. **Add E2E test** in `tests/e2e/device-selection.spec.js`

5. **Update documentation** in README.md

### Adding a Security Feature

1. **Review Article V** (Security) in constitution

2. **Write tests first** (TDD):

```javascript
// tests/unit/new-security-feature.test.js
describe('New Security Feature', () => {
  it('should prevent attack vector X', () => {
    // Test implementation
  });
});
```

3. **Implement feature** in `src/core/` or `server/middleware/`

4. **Document security implications** in PR

5. **Request security review** from maintainers

### Optimizing Performance

1. **Measure baseline**:

```bash
npm run perf:lighthouse    # Lighthouse audit
npm run build:analyze      # Bundle analysis
```

2. **Make optimizations**

3. **Measure improvement**

4. **Document in PR** with before/after metrics

5. **Ensure Article II compliance** (performance targets)

## Getting Help

**Questions?**
- Open a discussion on GitHub
- Ask in project Discord/Slack (if available)
- Email maintainers

**Found a bug?**
- Check existing issues first
- Open a new issue with reproduction steps
- Include browser version, OS, screenshots

**Feature request?**
- Open a feature request issue
- Describe use case and benefits
- Check roadmap for planned features

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build great software together.

---

**Thank you for contributing to the Mobile Emulator Platform!** 🚀

For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
For API documentation, see [API.md](./API.md).
For deployment guide, see [DEPLOYMENT.md](./DEPLOYMENT.md).
