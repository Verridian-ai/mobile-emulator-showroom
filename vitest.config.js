import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'jsdom',

    // Test file patterns
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js', 'tests/unit/**/*.spec.js', 'tests/integration/**/*.spec.js'],
    exclude: ['node_modules', 'dist', 'build', '.specify', 'tests/e2e'],

    // Global test settings
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // Coverage thresholds - Constitution Article VI compliance
      // Set to 0 during initial setup phase; increase to 80 when implementing real tests
      thresholds: {
        lines: 0,      // Target: 80% (90% for validators/security)
        functions: 0,  // Target: 80% (90% for validators/security)
        branches: 0,   // Target: 80% (90% for validators/security)
        statements: 0, // Target: 80% (90% for validators/security)

        // Enable per-file thresholds for granular control
        perFile: false,
      },

      // Files to include in coverage
      include: [
        'public/js/**/*.js',
        'server.js',
        'src/**/*.js'
      ],

      // Files to exclude from coverage
      exclude: [
        'node_modules/',
        'tests/',
        'coverage/',
        '*.config.js',
        'dist/',
        'build/',
        '.specify/'
      ]
    },

    // Test timeouts
    testTimeout: 10000, // 10 seconds for unit tests
    hookTimeout: 10000,

    // Reporters
    reporters: ['default', 'verbose'],

    // Mock configuration
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,

    // Performance monitoring
    slowTestThreshold: 5000, // Warn if test takes > 5 seconds

    // Retry flaky tests once
    retry: 1,

    // Watch mode settings
    watch: false,

    // Output
    silent: false,
    passWithNoTests: false
  }
});