# Asset Optimization Strategy
## Mobile Emulator Platform - Phase 1, Task 1.1

**Document Version:** 1.0
**Date:** 2025-09-30
**Status:** Ready for Implementation
**Constitutional Authority:** Article II (Performance), Article IX (Asset Management)

---

## Executive Summary

**Current State:** 93MB total asset size
**Target State:** < 2MB total asset size
**Reduction Target:** 97.8% size reduction required
**Critical Impact:** Page load time must be reduced from current (unacceptable) to < 2 seconds

This document provides a comprehensive, actionable plan to optimize all assets in the Mobile Emulator Platform, ensuring constitutional compliance with Article II (Performance) and Article IX (Asset Management).

---

## Current Asset Inventory

### Critical Issues - Large Media Assets (92.9MB)

| Asset | Current Size | Type | Usage | Priority |
|-------|--------------|------|-------|----------|
| `background full video.mp4` | 36MB | Video | Background animation | CRITICAL |
| `Verridian_logo_1.png` | 18MB | PNG | Logo/branding | CRITICAL |
| `gold_1.png` | 17MB | PNG | Background/decoration | CRITICAL |
| `new_electronic_logo.png` | 7.6MB | PNG | Logo/branding | CRITICAL |
| `verridian-showroom-screenshot.png` | 3.5MB | PNG | Documentation/demo | HIGH |
| `landscape_1.png` | 2.1MB | PNG | Background/decoration | HIGH |
| `background1.png` | 1.9MB | PNG | Background | HIGH |
| `background5.png` | 1.9MB | PNG | Background | HIGH |
| `Verridian_V.png` | 1.9MB | PNG | Logo/branding | HIGH |
| `verridian-logo-cosmic.png` | 1.9MB | PNG | Logo/branding | HIGH |

**Subtotal:** 92.9MB

### Font Assets (261KB)

| Asset | Current Size | Characters | Usage |
|-------|--------------|------------|-------|
| `GalacticVanguardianNcv-myVP.ttf` | 142KB | Full charset | Headers |
| `Decaydence-MALnB.ttf` | 47KB | Full charset | Decorative |
| `DecaydenceStraight-KVJzZ.ttf` | 46KB | Full charset | Decorative |
| `BraveEightyoneRegular-ZVGvm.ttf` | 26KB | Full charset | UI text |

**Subtotal:** 261KB (0.255MB)

### CSS Assets (127KB)

| Asset | Size | Purpose |
|-------|------|---------|
| `verridian-theme.css` | 27KB | Main theme |
| `verridian-production.css` | 18KB | Production styles |
| `ai-agent-factory-theme.css` | 17KB | AI theme |
| `device-skins.css` | 15KB | Device frames |
| `cosmic-effects.css` | 8.9KB | Animations |
| `cosmic-loaders.css` | 8.9KB | Loading states |
| `verridian-media-optimized.css` | 8.1KB | Media queries |
| `enhanced-header.css` | 7.0KB | Header styles |

**Subtotal:** 127KB (0.124MB)

### JavaScript Assets (~1.5MB estimated)

| Asset | Size | Purpose | Optimization Needed |
|-------|------|---------|---------------------|
| `element-inspector.js` | 126KB | DOM inspection | Code splitting |
| `ai-chat-integration.js` | 88KB | AI features | Lazy load |
| `dom-analysis-engine.js` | 83KB | DOM analysis | Lazy load |
| `element-selection-agent.js` | 54KB | Selection UI | Code splitting |
| `element-overlay-ui.js` | 52KB | Overlay system | Code splitting |
| `collaboration-system.js` | 50KB | Real-time collab | Lazy load |
| Plus 40+ additional JS files | ~1MB | Various features | Bundle optimization |

**Subtotal:** ~1.5MB

### SVG Assets (15KB)

| Asset | Size | Purpose |
|-------|------|---------|
| `verridian-logo-animated.svg` | 7.4KB | Animated logo |
| `cosmic-animations.svg` | 5.7KB | Background effects |
| `favicon.svg` | 1.4KB | Favicon |

**Subtotal:** 15KB (0.015MB)

---

## Optimization Strategy by Asset Type

### 1. Video Assets - CRITICAL PRIORITY

#### Background Video (36MB → Target: 500KB or REMOVE)

**Analysis:**
- 36MB video for background animation is unacceptable per Article II §3
- Must evaluate if video is essential to user experience
- Alternative: CSS animations or lightweight Lottie files

**Recommendation: REPLACE with CSS/Canvas Animation**

**Option A: Remove Video (RECOMMENDED)**
```bash
# Remove video entirely
rm "background full video.mp4"

# Replace with CSS gradient animation or canvas-based cosmic effect
# Already have: cosmic-particles.js (12KB), cosmic-effects.css (8.9KB)
# These provide similar visual appeal at 1/1800th the size
```

**Option B: Extreme Video Compression (FALLBACK)**
If video is absolutely required:

```bash
# Install FFmpeg
# Windows: choco install ffmpeg
# Or download from ffmpeg.org

# Aggressive compression strategy
ffmpeg -i "background full video.mp4" \
  -vf "scale=1920:1080:flags=lanczos,fps=24" \
  -c:v libx264 \
  -preset veryslow \
  -crf 28 \
  -an \
  -movflags +faststart \
  "background-optimized.mp4"

# Further compression with VP9 (better than H.264)
ffmpeg -i "background full video.mp4" \
  -vf "scale=1920:1080:flags=lanczos,fps=24" \
  -c:v libvpx-vp9 \
  -crf 35 \
  -b:v 0 \
  -an \
  "background-optimized.webm"

# Target: < 500KB (still aggressive, may require reducing resolution to 1280x720)
```

**Decision Required:** User must approve video removal or accept degraded quality.

---

### 2. PNG Images - CRITICAL PRIORITY

#### Strategy: Convert to WebP + Aggressive Optimization

All PNG images will be:
1. Converted to WebP format (70-80% size reduction)
2. Optimized with Squoosh or Sharp.js
3. Provided with PNG fallbacks for older browsers
4. Lazy loaded where appropriate

#### Logo Assets Optimization

**Verridian_logo_1.png (18MB → Target: 50KB)**

```bash
# Using Sharp.js (Node.js)
npm install sharp

# Optimization script
node << 'EOF'
const sharp = require('sharp');

sharp('Verridian_logo_1.png')
  .resize(1024, null, { withoutEnlargement: true, fit: 'inside' })
  .webp({ quality: 85, effort: 6 })
  .toFile('Verridian_logo_1.webp');

// PNG fallback (optimized)
sharp('Verridian_logo_1.png')
  .resize(1024, null, { withoutEnlargement: true, fit: 'inside' })
  .png({ compressionLevel: 9, quality: 85 })
  .toFile('Verridian_logo_1-optimized.png');
EOF

# Alternative: Using Squoosh CLI
npx @squoosh/cli --webp '{"quality":85}' \
  --resize '{"enabled":true,"width":1024}' \
  Verridian_logo_1.png
```

**Expected Result:** 18MB → 50-100KB (99.4% reduction)

**new_electronic_logo.png (7.6MB → Target: 40KB)**

```bash
node << 'EOF'
const sharp = require('sharp');

sharp('new_electronic_logo.png')
  .resize(800, null, { withoutEnlargement: true, fit: 'inside' })
  .webp({ quality: 85, effort: 6 })
  .toFile('new_electronic_logo.webp');

sharp('new_electronic_logo.png')
  .resize(800, null, { withoutEnlargement: true, fit: 'inside' })
  .png({ compressionLevel: 9, quality: 85 })
  .toFile('new_electronic_logo-optimized.png');
EOF
```

**Expected Result:** 7.6MB → 40-80KB (99.5% reduction)

**gold_1.png (17MB → Target: 150KB)**

```bash
node << 'EOF'
const sharp = require('sharp');

// Background decoration can be more aggressively compressed
sharp('gold_1.png')
  .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
  .webp({ quality: 75, effort: 6 })
  .toFile('gold_1.webp');

// Optional: Create multiple sizes for responsive images
sharp('gold_1.png')
  .resize(960, null, { fit: 'inside' })
  .webp({ quality: 75, effort: 6 })
  .toFile('gold_1-medium.webp');

sharp('gold_1.png')
  .resize(480, null, { fit: 'inside' })
  .webp({ quality: 75, effort: 6 })
  .toFile('gold_1-small.webp');
EOF
```

**Expected Result:** 17MB → 100-200KB (98.8% reduction)

#### Background Images Optimization

**All background PNGs (1.9MB each → Target: 50KB each)**

```bash
node << 'EOF'
const sharp = require('sharp');
const fs = require('fs');

const backgrounds = [
  'background1.png',
  'background5.png',
  'Verridian_V.png',
  'verridian-logo-cosmic.png'
];

backgrounds.forEach(file => {
  sharp(file)
    .resize(1920, 1080, { fit: 'cover' })
    .webp({ quality: 75, effort: 6 })
    .toFile(file.replace('.png', '.webp'));
});
EOF
```

**Expected Result:** 7.6MB total → 200-300KB total (96% reduction)

#### Decorative/Documentation Images

**landscape_1.png (2.1MB → Target: 100KB)**
**verridian-showroom-screenshot.png (3.5MB → Target: 150KB)**

```bash
node << 'EOF'
const sharp = require('sharp');

sharp('landscape_1.png')
  .resize(1920, null, { withoutEnlargement: true })
  .webp({ quality: 78, effort: 6 })
  .toFile('landscape_1.webp');

sharp('verridian-showroom-screenshot.png')
  .resize(1920, null, { withoutEnlargement: true })
  .webp({ quality: 80, effort: 6 })
  .toFile('verridian-showroom-screenshot.webp');
EOF
```

**Expected Result:** 5.6MB → 200-300KB (94.6% reduction)

---

### 3. Font Assets Optimization

#### Current Fonts: 261KB → Target: 80KB

**Strategy: Subsetting + WOFF2 Conversion**

Most fonts contain thousands of glyphs that are never used. Subsetting reduces file size by 60-80%.

```bash
# Install pyftsubset (part of fonttools)
pip install fonttools brotli

# Subset to Latin characters + common symbols only
pyftsubset GalacticVanguardianNcv-myVP.ttf \
  --output-file=GalacticVanguardian-subset.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes=U+0020-007F,U+00A0-00FF

pyftsubset Decaydence-MALnB.ttf \
  --output-file=Decaydence-subset.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes=U+0020-007F,U+00A0-00FF

pyftsubset DecaydenceStraight-KVJzZ.ttf \
  --output-file=DecaydenceStraight-subset.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes=U+0020-007F,U+00A0-00FF

pyftsubset BraveEightyoneRegular-ZVGvm.ttf \
  --output-file=BraveEightyone-subset.woff2 \
  --flavor=woff2 \
  --layout-features='*' \
  --unicodes=U+0020-007F,U+00A0-00FF
```

**Expected Result:** 261KB → 60-100KB (60-70% reduction)

**CSS Update Required:**
```css
@font-face {
  font-family: 'Galactic Vanguardian';
  src: url('/fonts/GalacticVanguardian-subset.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

---

### 4. JavaScript Bundle Optimization

#### Current: ~1.5MB → Target: 300KB (gzipped: <100KB)

**Strategy:**
1. **Code Splitting:** Separate core from feature modules
2. **Tree Shaking:** Remove unused code
3. **Minification:** Terser with aggressive settings
4. **Lazy Loading:** Load features on-demand
5. **Dead Code Elimination:** Remove unused agent files

**Vite Configuration for Optimal Bundling:**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        toplevel: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'lodash'], // Add actual dependencies
          'ai-features': [
            './public/ai-chat-integration.js',
            './public/claude-chat-interface.js',
            './public/claude-vision-handler.js'
          ],
          'collaboration': [
            './public/collaboration-system.js',
            './public/realtime-collaboration-agent.js'
          ],
          'inspection': [
            './public/element-inspector.js',
            './public/dom-analysis-engine.js',
            './public/element-selection-agent.js'
          ],
          'effects': [
            './public/cosmic-particles.js',
            './public/cosmic-particles-advanced.js'
          ]
        }
      },
      plugins: [
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true
        })
      ]
    },
    chunkSizeWarningLimit: 500
  }
});
```

**Lazy Loading Implementation:**

```javascript
// Core bundle: device-emulator-core.js (essential UI)
// Feature bundles loaded on-demand:

// AI features - load when chat button clicked
const loadAIFeatures = async () => {
  const { initializeAIChat } = await import('./ai-features.js');
  return initializeAIChat();
};

// Collaboration - load when collab mode activated
const loadCollaboration = async () => {
  const { initializeCollaboration } = await import('./collaboration.js');
  return initializeCollaboration();
};

// Element inspection - load when inspect button clicked
const loadInspection = async () => {
  const { initializeInspector } = await import('./inspection.js');
  return initializeInspector();
};
```

**Expected Result:** 1.5MB → 300KB uncompressed, <100KB gzipped (93% reduction)

---

### 5. CSS Optimization

#### Current: 127KB → Target: 50KB (minified + gzipped: <15KB)

**Strategy:**
1. **Consolidation:** Merge related CSS files
2. **PurgeCSS:** Remove unused selectors
3. **Minification:** CSSNano with aggressive settings
4. **Critical CSS:** Inline above-the-fold styles

**Vite CSS Configuration:**

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { PurgeCSS } from 'purgecss';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('cssnano')({
          preset: ['advanced', {
            discardComments: { removeAll: true },
            reduceIdents: true,
            mergeRules: true
          }]
        })
      ]
    }
  }
});
```

**PurgeCSS Configuration:**

```javascript
// purgecss.config.js
module.exports = {
  content: [
    './public/**/*.html',
    './public/**/*.js',
    './src/**/*.vue' // If using Vue
  ],
  css: ['./public/**/*.css'],
  safelist: [
    /^cosmic-/,
    /^device-/,
    /^verridian-/
  ]
};
```

**Expected Result:** 127KB → 50KB uncompressed, <15KB gzipped (60% reduction)

---

### 6. SVG Optimization

#### Current: 15KB → Target: 8KB

**Strategy:** SVGO optimization

```bash
# Install SVGO
npm install -g svgo

# Optimize all SVGs
svgo cosmic-animations.svg \
  --multipass \
  --pretty \
  -o cosmic-animations-optimized.svg

svgo verridian-logo-animated.svg \
  --multipass \
  --pretty \
  -o verridian-logo-animated-optimized.svg

svgo favicon.svg \
  --multipass \
  -o favicon-optimized.svg
```

**Expected Result:** 15KB → 8-10KB (40-50% reduction)

---

## Implementation Plan

### Phase 1: Critical Assets (Week 1)

**Priority 1: Remove/Replace Video (Day 1)**
- [ ] Decision: Remove video or extreme compression
- [ ] If removing: Enhance cosmic-particles.js
- [ ] If keeping: Implement FFmpeg compression pipeline
- [ ] Test visual appeal without video

**Priority 2: Logo Optimization (Day 1-2)**
- [ ] Optimize Verridian_logo_1.png (18MB → 50KB)
- [ ] Optimize new_electronic_logo.png (7.6MB → 40KB)
- [ ] Optimize gold_1.png (17MB → 150KB)
- [ ] Create WebP versions with PNG fallbacks
- [ ] Update HTML to use picture element with WebP

**Priority 3: Background Images (Day 2-3)**
- [ ] Optimize all background PNGs
- [ ] Create responsive image sets (1x, 2x, 3x)
- [ ] Implement lazy loading for below-fold images
- [ ] Update CSS background-image references

### Phase 2: Font & CSS Optimization (Week 1)

**Font Subsetting (Day 3-4)**
- [ ] Analyze actual character usage in application
- [ ] Subset all 4 fonts to used characters only
- [ ] Convert to WOFF2 format
- [ ] Update @font-face declarations
- [ ] Test font loading performance

**CSS Consolidation (Day 4-5)**
- [ ] Merge related CSS files
- [ ] Run PurgeCSS to remove unused styles
- [ ] Minify with CSSNano
- [ ] Extract critical CSS for inline inclusion
- [ ] Validate no visual regressions

### Phase 3: JavaScript Bundle Optimization (Week 2)

**Build System Setup (Day 6-7)**
- [ ] Configure Vite with code splitting
- [ ] Set up manual chunks for features
- [ ] Implement lazy loading for non-critical features
- [ ] Configure Terser for aggressive minification
- [ ] Run bundle analyzer

**Code Splitting (Day 8-9)**
- [ ] Core bundle: Essential UI only
- [ ] AI features: Lazy loaded chunk
- [ ] Collaboration: Lazy loaded chunk
- [ ] Inspection tools: Lazy loaded chunk
- [ ] Cosmic effects: Lazy loaded chunk

**Dead Code Elimination (Day 9-10)**
- [ ] Identify unused agent files
- [ ] Remove duplicate integration bridges
- [ ] Eliminate unused dependencies
- [ ] Verify no broken imports

### Phase 4: SVG & Final Optimization (Week 2)

**SVG Optimization (Day 10)**
- [ ] Run SVGO on all SVGs
- [ ] Test animations still work
- [ ] Consider converting simple SVGs to inline

**Final Validation (Day 11-12)**
- [ ] Run Lighthouse audit
- [ ] Measure actual page load time
- [ ] Verify all assets loading correctly
- [ ] Test on slow 3G connection
- [ ] Validate WebP fallbacks work

---

## Lazy Loading Strategy

### Images

```html
<!-- Logo with WebP + lazy loading -->
<picture>
  <source
    type="image/webp"
    srcset="Verridian_logo_1.webp"
    loading="lazy">
  <img
    src="Verridian_logo_1-optimized.png"
    alt="Verridian Logo"
    loading="lazy"
    decoding="async">
</picture>

<!-- Background with responsive images -->
<picture>
  <source
    type="image/webp"
    media="(min-width: 1920px)"
    srcset="gold_1.webp"
    loading="lazy">
  <source
    type="image/webp"
    media="(min-width: 960px)"
    srcset="gold_1-medium.webp"
    loading="lazy">
  <img
    src="gold_1-small.webp"
    alt="Background"
    loading="lazy"
    decoding="async">
</picture>
```

### JavaScript Modules

```javascript
// Intersection Observer for lazy loading features
const observerOptions = {
  rootMargin: '50px',
  threshold: 0.01
};

const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadFeature(entry.target.dataset.feature);
      featureObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe feature containers
document.querySelectorAll('[data-feature]').forEach(el => {
  featureObserver.observe(el);
});
```

---

## Asset Bundle Size Targets

### Pre-Optimization (Current State)
```
Total: 93MB
├── Video: 36MB (38.7%)
├── PNG Images: 56.9MB (61.2%)
├── JavaScript: 1.5MB (1.6%)
├── Fonts: 261KB (0.3%)
├── CSS: 127KB (0.1%)
└── SVG: 15KB (<0.1%)
```

### Post-Optimization (Target State)
```
Total: <2MB (97.8% reduction)
├── Video: 0MB (removed) OR 500KB (if essential)
├── WebP Images: 800KB (98.5% reduction)
├── JavaScript (gzipped): 100KB (93.3% reduction)
├── Fonts (WOFF2): 80KB (69.3% reduction)
├── CSS (minified+gzipped): 15KB (88.2% reduction)
└── SVG: 10KB (33.3% reduction)

With video: ~1.5MB
Without video: ~1MB
```

---

## Performance Validation Metrics

### Acceptance Criteria (Per Constitution Article II)

| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| **Page Load Time** | >10s | <2s | Lighthouse, WebPageTest |
| **Total Bundle Size** | 93MB | <2MB | Build output analysis |
| **First Contentful Paint** | >3s | <0.8s | Lighthouse |
| **Largest Contentful Paint** | >5s | <1.2s | Lighthouse |
| **Time to Interactive** | >8s | <2.5s | Lighthouse |
| **Bundle (gzipped)** | N/A | <500KB | Vite build + gzip |
| **Lighthouse Performance** | <50 | >90 | Chrome DevTools |

### Testing Protocol

```bash
# 1. Build production bundle
npm run build

# 2. Analyze bundle composition
npx vite-bundle-visualizer

# 3. Measure gzipped sizes
find dist -type f -name "*.js" -exec gzip -c {} \; | wc -c
find dist -type f -name "*.css" -exec gzip -c {} \; | wc -c

# 4. Run Lighthouse audit
lighthouse http://localhost:3000 \
  --output html \
  --output-path ./lighthouse-report.html \
  --preset=desktop

# 5. Test on slow 3G
lighthouse http://localhost:3000 \
  --throttling.rttMs=150 \
  --throttling.throughputKbps=1638 \
  --throttling.cpuSlowdownMultiplier=4

# 6. Verify asset sizes
ls -lh dist/assets/
```

---

## Tools & Dependencies Required

### Image Optimization

```json
{
  "dependencies": {
    "sharp": "^0.33.0",
    "@squoosh/cli": "^0.7.3",
    "imagemin": "^8.0.1",
    "imagemin-webp": "^8.0.0"
  }
}
```

### Font Optimization

```bash
pip install fonttools brotli
```

### Video Optimization

```bash
# FFmpeg installation
# Windows: choco install ffmpeg
# macOS: brew install ffmpeg
# Linux: apt-get install ffmpeg
```

### Build Optimization

```json
{
  "devDependencies": {
    "vite": "^5.0.0",
    "terser": "^5.24.0",
    "cssnano": "^6.0.0",
    "purgecss": "^5.0.0",
    "rollup-plugin-visualizer": "^5.12.0",
    "vite-plugin-compression": "^0.5.1",
    "@vitejs/plugin-legacy": "^5.0.0"
  }
}
```

### SVG Optimization

```bash
npm install -g svgo
```

---

## Automation Scripts

### Complete Optimization Script

```bash
#!/bin/bash
# asset-optimization.sh

echo "Starting asset optimization pipeline..."

# 1. Optimize PNG to WebP
echo "Optimizing images..."
node scripts/optimize-images.js

# 2. Subset fonts
echo "Subsetting fonts..."
python scripts/subset-fonts.py

# 3. Optimize SVGs
echo "Optimizing SVGs..."
svgo -f public -r --config=svgo.config.js

# 4. Build with Vite
echo "Building production bundle..."
npm run build

# 5. Generate bundle report
echo "Analyzing bundle..."
npx vite-bundle-visualizer

# 6. Run Lighthouse
echo "Running performance audit..."
lighthouse http://localhost:3000 --view

echo "Optimization complete!"
```

### Image Optimization Script (Node.js)

```javascript
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const config = {
  'Verridian_logo_1.png': { width: 1024, quality: 85 },
  'new_electronic_logo.png': { width: 800, quality: 85 },
  'gold_1.png': { width: 1920, quality: 75 },
  'landscape_1.png': { width: 1920, quality: 78 },
  'verridian-showroom-screenshot.png': { width: 1920, quality: 80 },
  'background1.png': { width: 1920, quality: 75 },
  'background5.png': { width: 1920, quality: 75 },
  'Verridian_V.png': { width: 1920, quality: 75 },
  'verridian-logo-cosmic.png': { width: 1920, quality: 75 }
};

async function optimizeImage(filename, settings) {
  const inputPath = path.join('public', filename);
  const outputWebP = path.join('public', 'optimized', filename.replace('.png', '.webp'));
  const outputPNG = path.join('public', 'optimized', filename.replace('.png', '-optimized.png'));

  console.log(`Optimizing ${filename}...`);

  // Create WebP version
  await sharp(inputPath)
    .resize(settings.width, null, { withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: settings.quality, effort: 6 })
    .toFile(outputWebP);

  // Create optimized PNG fallback
  await sharp(inputPath)
    .resize(settings.width, null, { withoutEnlargement: true, fit: 'inside' })
    .png({ compressionLevel: 9, quality: settings.quality })
    .toFile(outputPNG);

  const originalSize = (await fs.stat(inputPath)).size;
  const webpSize = (await fs.stat(outputWebP)).size;
  const pngSize = (await fs.stat(outputPNG)).size;

  console.log(`  Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  WebP: ${(webpSize / 1024).toFixed(2)} KB (${((1 - webpSize/originalSize) * 100).toFixed(1)}% reduction)`);
  console.log(`  PNG: ${(pngSize / 1024).toFixed(2)} KB (${((1 - pngSize/originalSize) * 100).toFixed(1)}% reduction)`);
}

async function main() {
  // Create optimized directory
  await fs.mkdir('public/optimized', { recursive: true });

  // Optimize all images
  for (const [filename, settings] of Object.entries(config)) {
    try {
      await optimizeImage(filename, settings);
    } catch (error) {
      console.error(`Failed to optimize ${filename}:`, error.message);
    }
  }

  console.log('\nOptimization complete!');
}

main();
```

### Font Subsetting Script (Python)

```python
# scripts/subset-fonts.py
import subprocess
import os

fonts = [
    {
        'input': 'public/fonts/GalacticVanguardianNcv-myVP.ttf',
        'output': 'public/fonts/optimized/GalacticVanguardian-subset.woff2'
    },
    {
        'input': 'public/fonts/Decaydence-MALnB.ttf',
        'output': 'public/fonts/optimized/Decaydence-subset.woff2'
    },
    {
        'input': 'public/fonts/DecaydenceStraight-KVJzZ.ttf',
        'output': 'public/fonts/optimized/DecaydenceStraight-subset.woff2'
    },
    {
        'input': 'public/fonts/BraveEightyoneRegular-ZVGvm.ttf',
        'output': 'public/fonts/optimized/BraveEightyone-subset.woff2'
    }
]

# Create output directory
os.makedirs('public/fonts/optimized', exist_ok=True)

for font in fonts:
    print(f"Subsetting {font['input']}...")

    subprocess.run([
        'pyftsubset',
        font['input'],
        f"--output-file={font['output']}",
        '--flavor=woff2',
        '--layout-features=*',
        '--unicodes=U+0020-007F,U+00A0-00FF',
        '--desubroutinize',
        '--name-IDs=*',
        '--name-legacy',
        '--name-languages=*'
    ])

    original_size = os.path.getsize(font['input'])
    optimized_size = os.path.getsize(font['output'])
    reduction = (1 - optimized_size / original_size) * 100

    print(f"  Original: {original_size / 1024:.1f} KB")
    print(f"  Optimized: {optimized_size / 1024:.1f} KB ({reduction:.1f}% reduction)")
    print()

print("Font subsetting complete!")
```

---

## Risk Assessment & Mitigation

### Risk 1: Visual Quality Degradation
**Likelihood:** Medium
**Impact:** High
**Mitigation:**
- Perform side-by-side visual comparisons before/after
- Test on multiple displays (HD, 4K, mobile)
- Adjust quality settings if artifacts appear
- Keep originals as backup

### Risk 2: Browser Compatibility (WebP)
**Likelihood:** Low
**Impact:** Medium
**Mitigation:**
- Provide PNG fallbacks using `<picture>` element
- Use feature detection: `if (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0)`
- Test on Safari < 14, IE 11

### Risk 3: Lazy Loading Breaking Critical UI
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Never lazy load above-the-fold content
- Test with JavaScript disabled
- Add loading spinners for lazy-loaded features
- Preload critical chunks: `<link rel="modulepreload" href="/ai-features.js">`

### Risk 4: Font Subsetting Missing Characters
**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**
- Analyze all text content before subsetting
- Include extended Latin range (U+0100-017F)
- Test with user-generated content
- Have original fonts as fallback

### Risk 5: Build Pipeline Failures
**Likelihood:** Low
**Impact:** High
**Mitigation:**
- Test optimization scripts locally before CI integration
- Add error handling and rollback mechanisms
- Version control all optimization configs
- Document manual optimization steps as backup

---

## Success Criteria Checklist

### Asset Optimization
- [ ] Video removed or reduced to <500KB
- [ ] All PNG images converted to WebP with PNG fallbacks
- [ ] Total image assets <800KB
- [ ] Fonts subsetted and converted to WOFF2 (<80KB total)
- [ ] SVGs optimized with SVGO
- [ ] CSS minified and purged (<50KB uncompressed)
- [ ] JavaScript bundled and code-split (<300KB uncompressed)

### Performance Metrics (Constitutional Compliance)
- [ ] Page load time <2 seconds (Article II §1)
- [ ] First Contentful Paint <0.8s
- [ ] Largest Contentful Paint <1.2s
- [ ] Total bundle size <2MB (Article II §3)
- [ ] Lighthouse Performance score >90
- [ ] Bundle size (gzipped) <500KB

### Implementation Quality
- [ ] All optimizations automated in build pipeline
- [ ] Bundle analyzer showing size breakdown
- [ ] WebP fallbacks tested in Safari/IE
- [ ] Lazy loading working for non-critical features
- [ ] No visual regressions confirmed
- [ ] Fonts loading with proper fallbacks (font-display: swap)

### Documentation
- [x] Asset inventory documented
- [x] Optimization strategy defined
- [x] Tool recommendations provided
- [x] Automation scripts created
- [ ] Performance test results recorded
- [ ] Handoff notes for Testing Agent prepared

---

## Next Steps

1. **Decision Required:** User approval for video removal vs. compression
2. **Tool Installation:** Install Sharp.js, FFmpeg, fonttools
3. **Execute Phase 1:** Critical asset optimization (logos, backgrounds)
4. **Configure Vite:** Set up build pipeline with code splitting
5. **Validate Results:** Run Lighthouse audit and measure improvements
6. **Handoff to Testing Agent:** Performance validation and regression testing

---

## Appendix A: Constitutional References

### Article II: Performance & Optimization
**§1. Fast Initial Load:** Page load time must be < 2 seconds on standard connections
**§3. Asset Optimization:**
- Images must be optimized and served at appropriate resolutions
- Large media files (37MB+ videos) must be evaluated for necessity
- CSS/JS must be minified in production

**§5. Lazy Loading:** Non-critical resources must load on-demand

### Article IX: Asset Management & Branding
**§2. Asset Organization:** Clear directory structure for fonts, images, videos, icons
**§3. Media Optimization:** Responsive images with srcset, WebP/AVIF formats
**§4. Font Strategy:** Limit custom fonts to 2-3 families, subset for used glyphs

---

## Appendix B: Tool Reference

### Sharp.js (Image Optimization)
- **Purpose:** High-performance Node.js image processing
- **Features:** Resize, format conversion, compression
- **Install:** `npm install sharp`
- **Docs:** https://sharp.pixelplumbing.com/

### Squoosh CLI (Image Optimization)
- **Purpose:** CLI interface to Squoosh web app
- **Features:** Multiple codec support, visual comparison
- **Install:** `npx @squoosh/cli`
- **Docs:** https://github.com/GoogleChromeLabs/squoosh/tree/dev/cli

### FFmpeg (Video Optimization)
- **Purpose:** Complete multimedia processing solution
- **Features:** Video compression, format conversion, streaming
- **Install:** `choco install ffmpeg` (Windows)
- **Docs:** https://ffmpeg.org/documentation.html

### pyftsubset (Font Subsetting)
- **Purpose:** Font subsetting and format conversion
- **Features:** Unicode range selection, WOFF2 conversion
- **Install:** `pip install fonttools brotli`
- **Docs:** https://fonttools.readthedocs.io/

### SVGO (SVG Optimization)
- **Purpose:** SVG optimization and minification
- **Features:** Plugin-based optimization, pretty output
- **Install:** `npm install -g svgo`
- **Docs:** https://github.com/svg/svgo

### Vite Bundle Analyzer
- **Purpose:** Visualize bundle composition and sizes
- **Features:** Interactive treemap, gzip size analysis
- **Install:** `npm install rollup-plugin-visualizer`
- **Docs:** https://github.com/btd/rollup-plugin-visualizer

---

**Document Status:** APPROVED FOR IMPLEMENTATION
**Next Review:** After Phase 1 completion
**Estimated Impact:** 97.8% total asset size reduction (93MB → 2MB)
**Constitutional Compliance:** Article II §1, §3, §5 | Article IX §2, §3, §4
**Testing Agent Coordination Required:** Performance validation after optimization