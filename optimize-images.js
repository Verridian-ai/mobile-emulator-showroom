/**
 * Image Optimization Script
 * Optimizes PNG images and generates WebP versions with PNG fallbacks
 * Complies with Article IX (Asset Management) and Article II (Performance)
 *
 * Target Optimizations:
 * - Verridian_logo_1.png: 18MB → 100KB (WebP + PNG)
 * - gold_1.png: 17MB → 150KB (WebP + PNG)
 * - new_electronic_logo.png: 7.6MB → 50KB (WebP + PNG)
 */

const fs = require('fs');
const path = require('path');

const sharp = require('sharp');

// Configuration for each image
const imageConfigs = [
  {
    name: 'Verridian_logo_1.png',
    targetSize: 100, // KB
    quality: 90,
    maxWidth: 800, // Reasonable maximum width for logos
    description: 'Verridian Logo',
  },
  {
    name: 'gold_1.png',
    targetSize: 150, // KB
    quality: 90,
    maxWidth: 1200, // Larger for background/decorative image
    description: 'Gold Background',
  },
  {
    name: 'new_electronic_logo.png',
    targetSize: 50, // KB
    quality: 90,
    maxWidth: 512, // Standard logo size
    description: 'Electronic Logo',
  },
];

const publicDir = path.join(__dirname, 'public');

/**
 * Format bytes to human-readable size
 */
function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file size in KB
 */
function getFileSizeKB(filePath) {
  const stats = fs.statSync(filePath);
  return Math.round(stats.size / 1024);
}

/**
 * Optimize a single image
 */
async function optimizeImage(config) {
  const inputPath = path.join(publicDir, config.name);
  const outputBaseName = config.name.replace('.png', '');
  const outputPngPath = path.join(publicDir, `${outputBaseName}.optimized.png`);
  const outputWebpPath = path.join(publicDir, `${outputBaseName}.optimized.webp`);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Optimizing: ${config.description} (${config.name})`);
  console.log(`${'='.repeat(60)}`);

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`ERROR: File not found: ${inputPath}`);
    return;
  }

  // Get original size
  const originalSize = getFileSizeKB(inputPath);
  console.log(`Original size: ${formatBytes(originalSize * 1024)}`);
  console.log(`Target size: ${config.targetSize}KB`);

  try {
    // Load image and get metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    console.log(`Original dimensions: ${metadata.width}x${metadata.height}`);

    // Calculate optimal dimensions while maintaining aspect ratio
    let newWidth = metadata.width;
    let newHeight = metadata.height;

    if (metadata.width > config.maxWidth) {
      newWidth = config.maxWidth;
      newHeight = Math.round((metadata.height / metadata.width) * config.maxWidth);
      console.log(`Resizing to: ${newWidth}x${newHeight} (maintaining aspect ratio)`);
    } else {
      console.log(`No resizing needed (within ${config.maxWidth}px max width)`);
    }

    // Create optimized PNG
    console.log('\nGenerating optimized PNG...');
    await sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png({
        quality: config.quality,
        compressionLevel: 9,
        adaptiveFiltering: true,
        palette: true, // Use palette-based PNG if possible
      })
      .toFile(outputPngPath);

    const pngSize = getFileSizeKB(outputPngPath);
    console.log(`PNG generated: ${formatBytes(pngSize * 1024)}`);
    console.log(
      `PNG reduction: ${originalSize}KB → ${pngSize}KB (${Math.round((1 - pngSize / originalSize) * 100)}% reduction)`
    );

    // Create WebP version
    console.log('\nGenerating WebP version...');
    await sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: config.quality,
        effort: 6, // Higher effort = better compression (0-6)
      })
      .toFile(outputWebpPath);

    const webpSize = getFileSizeKB(outputWebpPath);
    console.log(`WebP generated: ${formatBytes(webpSize * 1024)}`);
    console.log(
      `WebP reduction: ${originalSize}KB → ${webpSize}KB (${Math.round((1 - webpSize / originalSize) * 100)}% reduction)`
    );

    // Validation
    console.log('\nValidation:');
    const pngTargetMet = pngSize <= config.targetSize;
    const webpTargetMet = webpSize <= config.targetSize;

    console.log(
      `✓ PNG target (${config.targetSize}KB): ${pngTargetMet ? 'MET' : 'EXCEEDED'} (${pngSize}KB)`
    );
    console.log(
      `✓ WebP target (${config.targetSize}KB): ${webpTargetMet ? 'MET' : 'EXCEEDED'} (${webpSize}KB)`
    );

    if (!pngTargetMet) {
      console.log('⚠️  WARNING: PNG exceeds target size. Consider reducing maxWidth or quality.');
    }

    return {
      name: config.name,
      original: originalSize,
      pngOptimized: pngSize,
      webpOptimized: webpSize,
      pngPath: outputPngPath,
      webpPath: outputWebpPath,
      success: true,
    };
  } catch (error) {
    console.error(`ERROR optimizing ${config.name}:`, error.message);
    return {
      name: config.name,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Main optimization function
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Mobile Emulator Platform - Image Optimization Script    ║');
  console.log('║   Article IX (Asset Management) & Article II (Performance)║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const results = [];
  let totalOriginal = 0;
  let totalPngOptimized = 0;
  let totalWebpOptimized = 0;

  // Process each image
  for (const config of imageConfigs) {
    const result = await optimizeImage(config);
    results.push(result);

    if (result.success) {
      totalOriginal += result.original;
      totalPngOptimized += result.pngOptimized;
      totalWebpOptimized += result.webpOptimized;
    }
  }

  // Summary report
  console.log(`\n${'='.repeat(60)}`);
  console.log('OPTIMIZATION SUMMARY');
  console.log(`${'='.repeat(60)}\n`);

  console.log('Individual Results:');
  results.forEach(result => {
    if (result.success) {
      console.log(`\n${result.name}:`);
      console.log(`  Original:      ${result.original}KB`);
      console.log(
        `  PNG Optimized: ${result.pngOptimized}KB (-${Math.round((1 - result.pngOptimized / result.original) * 100)}%)`
      );
      console.log(
        `  WebP Optimized: ${result.webpOptimized}KB (-${Math.round((1 - result.webpOptimized / result.original) * 100)}%)`
      );
    } else {
      console.log(`\n${result.name}: FAILED - ${result.error}`);
    }
  });

  console.log(`\n${'-'.repeat(60)}`);
  console.log('Total Reduction:');
  console.log(`  Total Original:      ${formatBytes(totalOriginal * 1024)}`);
  console.log(
    `  Total PNG Optimized: ${formatBytes(totalPngOptimized * 1024)} (-${Math.round((1 - totalPngOptimized / totalOriginal) * 100)}%)`
  );
  console.log(
    `  Total WebP Optimized: ${formatBytes(totalWebpOptimized * 1024)} (-${Math.round((1 - totalWebpOptimized / totalOriginal) * 100)}%)`
  );
  console.log(`  Space Saved (PNG):   ${formatBytes((totalOriginal - totalPngOptimized) * 1024)}`);
  console.log(`  Space Saved (WebP):  ${formatBytes((totalOriginal - totalWebpOptimized) * 1024)}`);

  console.log(`\n${'='.repeat(60)}\n`);
  console.log('Next Steps:');
  console.log('1. Review optimized images visually');
  console.log('2. Update HTML files with <picture> elements');
  console.log('3. Use Playwright MCP for validation across viewports');
  console.log('4. If satisfied, replace original files with optimized versions');
  console.log(`\n${'='.repeat(60)}\n`);
}

// Run optimization
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
