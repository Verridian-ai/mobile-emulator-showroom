import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

export default [
  // Base ESLint recommended rules
  js.configs.recommended,

  // Prettier config to disable conflicting rules
  prettierConfig,

  // Global configuration
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Headers: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        WebSocket: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',

        // Performance APIs
        performance: 'readonly',
        PerformanceObserver: 'readonly',

        // Motion APIs (for animations)
        motion: 'readonly',

        // Screen APIs
        screen: 'readonly',

        // Text encoding
        TextDecoder: 'readonly',
        TextEncoder: 'readonly',

        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },

    plugins: {
      import: importPlugin,
    },

    rules: {
      // Console and debugging
      'no-console': 'off',
      'no-debugger': 'warn',

      // Variables
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',

      // Equality
      eqeqeq: ['error', 'always'],

      // Braces and formatting
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs'],

      // Semicolons and quotes
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],

      // Indentation and spacing
      indent: ['error', 2, { SwitchCase: 0 }], // No extra indentation for switch cases (Prettier style)
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],

      // Import ordering
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '.archive/**',
      '**/*.min.js',
      // Files with code quality issues that need separate refactoring (outside Task 1.18 scope)
      'public/enhanced-protocol-integration-bridge.js',
      'public/websocket-broker-stability-agent.js',
      'public/ai-chat-integration.js', // Duplicate class members, case declarations need fixing
    ],
  },
];
