import path from 'path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Globals
    globals: true,

    // Test environment
    environment: 'jsdom',

    // Test file patterns
    include: [
      'tests/unit/**/*.test.js',
      'tests/integration/**/*.test.js',
      'tests/unit/**/*.spec.js',
      'tests/integration/**/*.spec.js',
    ],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.js', 'server/**/*.js'],
      exclude: ['tests/**', 'node_modules/**', '**/*.spec.js', '**/*.test.js'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // Reporters
    reporters: ['default', 'verbose'],

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Retry failed tests once
    retry: 1,

    // Watch mode settings
    watch: false,

    // Output
    silent: false,
    passWithNoTests: false,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
