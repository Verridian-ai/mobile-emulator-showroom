import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const isAnalyze = mode === 'analyze';

  return {
    // Base public path
    base: './',

    // Development server configuration
    server: {
      port: 4175,
      strictPort: true,
      host: true,
      open: false,
      hmr: {
        overlay: true,
      },
      // Proxy for WebSocket broker if needed
      proxy: {
        '/ws': {
          target: 'ws://localhost:7071',
          ws: true,
        },
      },
    },

    // Preview server configuration
    preview: {
      port: 4175,
      strictPort: true,
      host: true,
    },

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDevelopment ? 'inline' : false,
      minify: isDevelopment ? false : 'terser',

      // Terser minification options
      terserOptions: {
        compress: {
          drop_console: !isDevelopment,
          drop_debugger: !isDevelopment,
          pure_funcs: ['console.log', 'console.info'],
        },
        format: {
          comments: false,
        },
      },

      // CSS code splitting
      cssCodeSplit: true,

      // Rollup options for advanced bundling
      rollupOptions: {
        // Multiple entry points
        input: {
          main: path.resolve(__dirname, 'index.html'),
          minimal: path.resolve(__dirname, 'minimal.html'),
        },

        output: {
          // Manual chunk splitting strategy
          manualChunks: (id) => {
            // Vendor chunks for node_modules
            if (id.includes('node_modules')) {
              return 'vendor';
            }

            // Core device emulation bundle
            if (id.includes('minimal.js') || id.includes('device-skins')) {
              return 'core-emulation';
            }

            // Security and performance utilities
            if (id.includes('security-config') || id.includes('performance-monitor')) {
              return 'utils';
            }

            // WebSocket features (lazy loaded)
            if (
              id.includes('websocket') ||
              id.includes('protocol-integration') ||
              id.includes('broker')
            ) {
              return 'websocket-features';
            }

            // AI/Claude integration (lazy loaded)
            if (
              id.includes('claude') ||
              id.includes('ai-chat') ||
              id.includes('dom-analysis')
            ) {
              return 'ai-integration';
            }

            // Collaboration features (lazy loaded)
            if (
              id.includes('collaboration') ||
              id.includes('element-inspector') ||
              id.includes('screenshot')
            ) {
              return 'collaboration';
            }
          },

          // Asset file naming
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];

            // Images
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(extType)) {
              return `assets/images/[name]-[hash][extname]`;
            }

            // Fonts
            if (/woff2?|eot|ttf|otf/i.test(extType)) {
              return `assets/fonts/[name]-[hash][extname]`;
            }

            // CSS
            if (extType === 'css') {
              return `assets/styles/[name]-[hash][extname]`;
            }

            // Default
            return `assets/[name]-[hash][extname]`;
          },

          // Chunk file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
      },

      // Performance budgets
      chunkSizeWarningLimit: 200, // 200 KB warning threshold

      // Ensure assets are optimized
      assetsInlineLimit: 4096, // 4kb - inline small assets as base64
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@js': path.resolve(__dirname, './src/js'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@public': path.resolve(__dirname, './public'),
      },
    },

    // CSS configuration
    css: {
      devSourcemap: isDevelopment,
      postcss: {
        plugins: [
          // Add autoprefixer and other PostCSS plugins if needed
        ],
      },
    },

    // Asset optimization
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],

    // Plugins
    plugins: [
      // Bundle analyzer
      (isAnalyze || process.env.ANALYZE) && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/bundle-analysis.html',
        template: 'treemap', // 'sunburst', 'treemap', 'network'
      }),
    ].filter(Boolean),

    // Optimization configuration
    optimizeDeps: {
      include: [
        // Pre-bundle dependencies for faster dev server startup
      ],
      exclude: [
        // Exclude large dependencies that should be loaded on demand
      ],
    },

    // Define global constants
    define: {
      __DEV__: isDevelopment,
      __PROD__: !isDevelopment,
    },

    // Logging level
    logLevel: isDevelopment ? 'info' : 'warn',

    // Clear screen on rebuild
    clearScreen: false,
  };
});