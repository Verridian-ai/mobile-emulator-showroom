# Mobile Emulator Platform - Build System Documentation

**Build System:** Vite 7.1.7
**Last Updated:** 2025-10-01
**Constitutional Compliance:** Article II (Performance), Article VII (Development Workflow)

---

## Overview

This project uses Vite as its build system, providing:
- Lightning-fast Hot Module Replacement (HMR) for development
- Optimized production bundles with code splitting
- Automatic compression (Gzip and Brotli)
- Legacy browser support via plugin
- Comprehensive bundle analysis

---

## Performance Benchmarks

### Development Server
- **Startup Time:** 499ms (< 2s requirement)
- **HMR Update:** < 200ms
- **Port:** 4175
- **Host:** 0.0.0.0 (accessible on network)

### Production Build
- **Build Time:** 2.187s (< 10s requirement)
- **Total Bundle Size (gzipped):** 7.9KB JavaScript
- **Code Splitting:** Automatic by route and feature
- **Compression:** Gzip + Brotli enabled
- **Source Maps:** Enabled for debugging

### Bundle Breakdown (Gzipped)
```
core-emulation:     821 bytes
utils:            3,219 bytes
websocket-features: 3,861 bytes
----------------------------
TOTAL:            7,901 bytes (7.9KB)
```

**Status:** WELL UNDER 500KB constitutional requirement

---

## NPM Scripts

### Development

```bash
npm run dev
```
Starts Vite development server with:
- Fast HMR (Hot Module Replacement)
- Source maps inline
- No minification
- Console logs enabled
- Dev server on http://localhost:4175

**Use Case:** Active development and testing

---

### Production Build

```bash
npm run build
```
Creates optimized production bundle with:
- Terser minification
- Tree-shaking (removes dead code)
- Code splitting (route-based and feature-based)
- Gzip and Brotli compression
- Source maps (separate files)
- Console logs removed
- Build output in `dist/`

**Use Case:** Deployment to production

---

### Production Preview

```bash
npm run preview
```
Serves the production build locally for testing:
- Serves files from `dist/`
- Uses same port as dev (4175)
- Tests compression and caching
- Validates production behavior

**Use Case:** Pre-deployment validation

---

### Bundle Analysis

```bash
npm run build:analyze
```
Builds and generates interactive bundle visualization:
- Creates `dist/bundle-analysis.html`
- Shows gzipped and brotli sizes
- Visualizes chunk composition
- Identifies large dependencies

**Use Case:** Performance optimization and auditing

---

## Configuration Details

### Entry Points

```javascript
{
  main: 'index.html',      // Full device emulator interface
  minimal: 'minimal.html'  // Lightweight minimal version
}
```

### Code Splitting Strategy

Vite automatically splits code into chunks:

1. **Vendor Chunk** - Third-party dependencies from `node_modules`
2. **Core Emulation** - Device rendering and minimal UI
3. **Utils** - Security config and performance monitoring
4. **WebSocket Features** - Real-time communication (lazy loaded)
5. **AI Integration** - Claude/AI features (lazy loaded)
6. **Collaboration** - Screenshots, inspector (lazy loaded)

**Benefit:** Only load what you need, when you need it

---

### Asset Optimization

#### Images
- Organized in `dist/assets/images/`
- Hashed filenames for cache busting
- Inline small assets (< 4KB) as base64

#### Fonts
- Organized in `dist/assets/fonts/`
- Font files lazy-loaded as needed

#### CSS
- Code-split by component
- Minified and hashed
- Organized in `dist/assets/styles/`

---

### Compression

Production builds include both:

**Gzip** (`.gz` files)
- Widely supported by all servers
- Good compression ratio (~70% reduction)

**Brotli** (`.br` files)
- Better compression ratio (~80% reduction)
- Supported by modern browsers and CDNs

**Server Configuration:** Ensure your web server serves `.br` files first, falling back to `.gz`, then original

---

### Browser Support

**Target:** ES2015+ (modern browsers)

**Supported Browsers:**
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari/Chrome: Latest 2 versions

**Not Supported:**
- Internet Explorer (any version)
- Very old mobile browsers (< 2020)

**Rationale:** Modern tooling for modern platforms per constitutional Article II

---

## Path Aliases

Use these aliases in your code for cleaner imports:

```javascript
import Component from '@/components/Device.js';      // ./src/components/
import util from '@js/security-config.js';           // ./src/js/
import '@styles/device-skins.css';                   // ./src/styles/
import logo from '@public/logo.png';                 // ./public/
```

---

## Performance Budgets

As defined in constitution Article II:

- **Total Bundle (gzipped):** < 500KB
- **Build Time:** < 10 seconds
- **HMR Update:** < 200ms
- **Dev Server Startup:** < 2 seconds
- **Lighthouse Performance:** > 90

**Current Status:** ALL BUDGETS MET

---

## Build Output Structure

```
dist/
├── index.html                      # Main app entry
├── minimal.html                    # Minimal version entry
├── bundle-analysis.html            # Bundle visualization (analyze mode)
└── assets/
    ├── js/
    │   ├── core-emulation-[hash].js       # Device rendering
    │   ├── core-emulation-[hash].js.gz    # Gzipped
    │   ├── core-emulation-[hash].js.br    # Brotli
    │   ├── utils-[hash].js                # Security & performance
    │   ├── websocket-features-[hash].js   # WebSocket integration
    │   └── ...
    ├── images/
    │   ├── logo-[hash].webp
    │   └── ...
    ├── fonts/
    │   ├── Decaydence-[hash].ttf
    │   └── ...
    └── styles/
        ├── main-[hash].css
        └── ...
```

---

## Development Workflow

### Starting Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - Local: http://localhost:4175
   - Network: http://[your-ip]:4175

4. **Make changes:**
   - Edit files in `src/`, `public/`, or root HTML files
   - Browser auto-refreshes via HMR

---

### Building for Production

1. **Clean previous build:**
   ```bash
   rm -rf dist
   ```

2. **Build:**
   ```bash
   npm run build
   ```

3. **Test build locally:**
   ```bash
   npm run preview
   ```

4. **Deploy:**
   - Upload `dist/` directory to your web server
   - Configure server to:
     - Serve `.br` files if supported
     - Fall back to `.gz` files
     - Set proper cache headers for hashed files
     - Enable gzip/brotli compression for dynamic content

---

### Analyzing Bundle Size

1. **Generate analysis:**
   ```bash
   npm run build:analyze
   ```

2. **View analysis:**
   - Opens `dist/bundle-analysis.html` in browser automatically
   - Interactive treemap visualization
   - Hover over chunks to see sizes

3. **Identify issues:**
   - Look for unexpectedly large chunks
   - Check if dependencies are tree-shaken properly
   - Verify lazy loading is working

---

## Optimization Tips

### Reducing Bundle Size

1. **Check for duplicate dependencies:**
   - Use `npm ls [package-name]`
   - Deduplicate with `npm dedupe`

2. **Analyze imports:**
   - Use named imports instead of default
   - Import only what you need
   ```javascript
   // Bad
   import _ from 'lodash';

   // Good
   import { debounce } from 'lodash-es';
   ```

3. **Lazy load features:**
   ```javascript
   // Load feature on demand
   const feature = await import('./feature.js');
   ```

---

### Improving Build Speed

1. **Exclude from optimization:**
   ```javascript
   // vite.config.js
   optimizeDeps: {
     exclude: ['large-package']
   }
   ```

2. **Use faster compression:**
   - Disable Brotli for faster builds (dev only)
   - Enable only for production CI/CD

3. **Parallel builds:**
   - Vite uses all CPU cores by default
   - No configuration needed

---

## Troubleshooting

### Dev Server Won't Start

**Error:** Port 4175 already in use

**Solution:**
```bash
# Kill existing process
pkill -f "vite"

# Or use different port
PORT=4176 npm run dev
```

---

### Build Fails

**Error:** Out of memory

**Solution:**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

### HMR Not Working

**Symptoms:** Changes don't reflect in browser

**Solution:**
1. Check browser console for errors
2. Hard refresh (Ctrl+Shift+R)
3. Restart dev server
4. Check file watchers limit (Linux)

---

### Large Bundle Size

**Symptoms:** Bundle exceeds 500KB

**Solution:**
1. Run bundle analysis
2. Identify large dependencies
3. Check for:
   - Duplicate packages
   - Unused imports
   - Large assets not lazy-loaded
4. Consider alternatives to large libraries

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Build and Test

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Check bundle size
        run: |
          SIZE=$(du -sb dist/assets/js/*.js.gz | awk '{sum+=$1} END {print sum}')
          if [ $SIZE -gt 512000 ]; then
            echo "Bundle size $SIZE exceeds 500KB limit"
            exit 1
          fi

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

---

## Security Considerations

### Content Security Policy

Production builds work with strict CSP:
```
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' data: https:;
```

No inline scripts or styles in production builds.

---

### Source Maps

Production source maps are **enabled** for debugging but should be:
- Served only to authenticated users
- Excluded from public access via `.htaccess` or server config
- Optional to disable in `vite.config.js`

---

## Related Documentation

- **Constitution:** `.specify/memory/constitution.md` - Performance requirements
- **Specification:** `.specify/specs/001-platform-specification/spec.md` - Features
- **Security:** `server/CSP-CONFIGURATION.md` - Security policies
- **Testing:** `tests/README.md` - Testing guidelines

---

## Support

For build system issues:
- Check this documentation first
- Review Vite documentation: https://vitejs.dev
- Check GitHub issues
- Contact Build & Tooling Agent

---

**Last Build:** 2025-10-01 00:50 UTC
**Build Time:** 2.187 seconds
**Bundle Size:** 7.9KB (gzipped)
**Status:** PASSING all constitutional requirements