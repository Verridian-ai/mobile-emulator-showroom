import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Globals
    globals: true,

    // Test environment
    environment: 'node',

    // Test file patterns
    include: ['tests/integration/**/*.test.js'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],

    // Reporters
    reporters: ['default', 'verbose'],

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
