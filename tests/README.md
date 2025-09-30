# Testing Infrastructure

This directory contains the comprehensive test suite for the Mobile Emulator Platform.

## Directory Structure

```
tests/
├── unit/           # Unit tests for individual functions and modules
├── integration/    # Integration tests for component interactions
├── e2e/           # End-to-end tests using Playwright
└── README.md      # This file
```

## Testing Frameworks

### Vitest (Unit & Integration Tests)
- **Framework**: Vitest with jsdom environment
- **Coverage**: v8 coverage provider
- **Config**: `vitest.config.js` in project root

### Playwright (E2E Tests)
- **Framework**: Playwright Test
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Config**: `playwright.config.js` in project root

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage report
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### E2E Tests

**IMPORTANT**: The development server must be running on port 4175 before running E2E tests.

```bash
# Start the server first
pnpm start

# In another terminal, run E2E tests:

# Run all E2E tests (all browsers)
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Run specific browser only
pnpm test:e2e:chromium
pnpm test:e2e:firefox
pnpm test:e2e:webkit

# Install Playwright browsers (first time only)
pnpm playwright:install
```

## Test File Naming Conventions

- **Unit tests**: `*.test.js` or `*.spec.js` in `tests/unit/`
- **Integration tests**: `*.test.js` or `*.spec.js` in `tests/integration/`
- **E2E tests**: `*.spec.js` in `tests/e2e/`

## Writing Tests

### Unit Test Example (Vitest)

```javascript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from '../src/myModule';

describe('MyModule', () => {
  describe('myFunction', () => {
    it('should perform expected behavior', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe('expected output');
    });
  });
});
```

### E2E Test Example (Playwright)

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should demonstrate expected behavior', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    // Interact with page
    await page.click('button#submit');

    // Assert outcome
    await expect(page.locator('.result')).toHaveText('Success');
  });
});
```

## Coverage Requirements

As per Constitution Article VI (Testing & Validation):

- **Minimum coverage**: 80% for all code
- **Security/Validator modules**: 90% minimum
- **Coverage reports**: Generated in `coverage/` directory

### Current Status

Coverage thresholds are currently set to 0% during initial setup phase. These will be increased to 80% (90% for critical modules) as the test suite is developed.

To update thresholds, edit `vitest.config.js`:

```javascript
thresholds: {
  lines: 80,      // Increase from 0 to 80
  functions: 80,  // Increase from 0 to 80
  branches: 80,   // Increase from 0 to 80
  statements: 80, // Increase from 0 to 80
}
```

## Test Quality Standards

### Constitution Compliance (Article VI)

1. **Unit Testing**: Core functions (URL parsing, device switching, state management) must have tests
2. **Integration Testing**: End-to-end flows (device selection → URL load → screenshot) must be tested
3. **Cross-Browser**: Support Chrome, Firefox, Safari, Edge latest versions
4. **Device Testing**: Validate accuracy of device emulation frames
5. **Performance Testing**: Regular benchmarking of load times, FPS, memory usage

### Best Practices

- **AAA Pattern**: Arrange, Act, Assert
- **Test Isolation**: Each test should be independent
- **Descriptive Names**: Test names should explain intent
- **Fast Tests**: Unit tests < 10 seconds, E2E tests < 60 seconds
- **Reliable Tests**: 99% reliability required (no flaky tests)
- **Clear Assertions**: Use specific matchers and meaningful error messages

## Continuous Integration

Tests are designed to run in CI environments:

- **Automatic retries**: E2E tests retry failed tests 2x in CI
- **Parallel execution**: Unit tests run in parallel (1 worker in CI)
- **Headless mode**: E2E tests run headless in CI
- **Artifacts**: Screenshots, videos, and traces saved on failure

## Troubleshooting

### E2E Tests Fail to Start

**Problem**: `EADDRINUSE: address already in use 0.0.0.0:4175`

**Solution**: Ensure the server is already running before starting E2E tests, OR stop the existing server and let Playwright start it automatically (uncomment webServer in `playwright.config.js`).

### Coverage Threshold Errors

**Problem**: `Coverage for lines (X%) does not meet global threshold (80%)`

**Solution**: This is expected behavior. Write more tests to increase coverage, or temporarily lower thresholds during development.

### Flaky Tests

**Problem**: Tests pass/fail inconsistently

**Solution**:
1. Check for timing issues (add proper waits)
2. Ensure test isolation (no shared state)
3. Check for race conditions
4. Review test in headed mode: `pnpm test:e2e:headed`

### Playwright Browsers Not Installed

**Problem**: `Executable doesn't exist`

**Solution**: Run `pnpm playwright:install` to install browser binaries.

## Reports and Artifacts

### Vitest Reports
- **Console**: Default output during test runs
- **Coverage**: HTML report in `coverage/` directory

### Playwright Reports
- **HTML Report**: `tests/e2e/reports/` - Open with `pnpm exec playwright show-report tests/e2e/reports`
- **Screenshots**: `tests/e2e/results/` (on failure only)
- **Videos**: `tests/e2e/results/` (on failure only)
- **Traces**: `tests/e2e/results/` (on failure only) - View with `pnpm exec playwright show-trace <path>`

## Next Steps

1. **Write Real Tests**: Replace sample tests with actual implementation tests
2. **Increase Coverage**: Gradually increase coverage to meet 80% threshold
3. **CI Integration**: Add tests to CI/CD pipeline
4. **Performance Benchmarks**: Add performance testing suite
5. **Visual Regression**: Consider adding visual regression testing with Playwright

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Docs](https://testing-library.com/)
- Project Constitution: `.specify/memory/constitution.md` (Article VI)