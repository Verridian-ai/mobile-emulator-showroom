/**
 * Bundle Size Analysis
 * Task 1.20: Performance Validation
 *
 * Validates Article II (Performance) requirement:
 * - Total bundle size < 500KB (gzipped)
 */

import fs from 'fs/promises';
import path from 'path';
import { gzipSync } from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get file size and gzipped size
 * @param {string} filePath - Path to file
 * @returns {Promise<Object>} Size information
 */
async function getFileSizes(filePath) {
  const content = await fs.readFile(filePath);
  const size = content.length;
  const gzipSize = gzipSync(content).length;

  return {
    size,
    gzipSize,
    sizeKB: (size / 1024).toFixed(2),
    gzipKB: (gzipSize / 1024).toFixed(2),
  };
}

/**
 * Recursively find files in directory
 * @param {string} dir - Directory to search
 * @param {string} ext - File extension to match
 * @returns {Promise<string[]>} Array of file paths
 */
async function findFiles(dir, ext) {
  const files = [];

  async function scan(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.name.endsWith(ext) && !entry.name.endsWith('.map')) {
        files.push(fullPath);
      }
    }
  }

  await scan(dir);
  return files;
}

/**
 * Analyze bundle directory
 * @param {string} distDir - Distribution directory path
 * @returns {Promise<Object>} Bundle analysis results
 */
async function analyzeBundle(distDir = 'dist') {
  console.log('\n📦 Analyzing bundle sizes...\n');

  // Check if dist directory exists
  try {
    await fs.access(distDir);
  } catch {
    console.error(`❌ Distribution directory not found: ${distDir}`);
    console.error('   Run "npm run build" first to generate production bundle');
    return null;
  }

  // Find all JS and CSS files recursively
  const jsFiles = await findFiles(distDir, '.js');
  const cssFiles = await findFiles(distDir, '.css');

  let totalSize = 0;
  let totalGzipSize = 0;

  const jsAnalysis = [];
  const cssAnalysis = [];

  // Analyze JavaScript files
  console.log('JavaScript Bundles:');
  console.log('━'.repeat(80));

  for (const filePath of jsFiles) {
    const sizes = await getFileSizes(filePath);
    const relPath = path.relative(distDir, filePath);

    totalSize += sizes.size;
    totalGzipSize += sizes.gzipSize;

    jsAnalysis.push({
      file: relPath,
      ...sizes,
    });

    console.log(`  ${relPath}`);
    console.log(`    Size: ${sizes.sizeKB} KB | Gzip: ${sizes.gzipKB} KB`);
  }

  console.log('━'.repeat(80));
  const jsTotalSize = jsAnalysis.reduce((sum, f) => sum + f.size, 0);
  const jsTotalGzip = jsAnalysis.reduce((sum, f) => sum + f.gzipSize, 0);
  console.log(`  Total JS: ${(jsTotalSize / 1024).toFixed(2)} KB | Gzip: ${(jsTotalGzip / 1024).toFixed(2)} KB`);
  console.log('━'.repeat(80));

  // Analyze CSS files if present
  if (cssFiles.length > 0) {
    console.log('\nCSS Bundles:');
    console.log('━'.repeat(80));

    for (const filePath of cssFiles) {
      const sizes = await getFileSizes(filePath);
      const relPath = path.relative(distDir, filePath);

      totalSize += sizes.size;
      totalGzipSize += sizes.gzipSize;

      cssAnalysis.push({
        file: relPath,
        ...sizes,
      });

      console.log(`  ${relPath}`);
      console.log(`    Size: ${sizes.sizeKB} KB | Gzip: ${sizes.gzipKB} KB`);
    }

    console.log('━'.repeat(80));
    const cssTotalSize = cssAnalysis.reduce((sum, f) => sum + f.size, 0);
    const cssTotalGzip = cssAnalysis.reduce((sum, f) => sum + f.gzipSize, 0);
    console.log(`  Total CSS: ${(cssTotalSize / 1024).toFixed(2)} KB | Gzip: ${(cssTotalGzip / 1024).toFixed(2)} KB`);
    console.log('━'.repeat(80));
  }

  // Grand total
  console.log('\nGrand Total:');
  console.log('━'.repeat(80));
  console.log(`  Total Size: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`  Total Gzip: ${(totalGzipSize / 1024).toFixed(2)} KB`);
  console.log('━'.repeat(80));

  return {
    js: jsAnalysis,
    css: cssAnalysis,
    totalSize,
    totalGzipSize,
    totalSizeKB: (totalSize / 1024).toFixed(2),
    totalGzipKB: (totalGzipSize / 1024).toFixed(2),
  };
}

/**
 * Validate bundle size against Article II target
 * @param {Object} analysis - Bundle analysis results
 * @returns {boolean} Whether validation passed
 */
function validateBundleSize(analysis) {
  if (!analysis) return false;

  const targetKB = 500;
  const actualKB = parseFloat(analysis.totalGzipKB);

  console.log('\n🎯 Article II Bundle Size Target:');
  console.log('━'.repeat(80));
  console.log(`  Target: < ${targetKB} KB (gzipped)`);
  console.log(`  Actual: ${actualKB.toFixed(2)} KB (gzipped)`);

  if (actualKB < targetKB) {
    const margin = targetKB - actualKB;
    const percentage = ((actualKB / targetKB) * 100).toFixed(1);

    console.log(`  Status: ✅ PASS`);
    console.log(`  Margin: ${margin.toFixed(2)} KB under budget (${percentage}% of target)`);
    console.log('━'.repeat(80));
    return true;
  } else {
    const overage = actualKB - targetKB;
    const percentage = ((overage / targetKB) * 100).toFixed(1);

    console.log(`  Status: ❌ FAIL`);
    console.log(`  Overage: ${overage.toFixed(2)} KB over budget (+${percentage}%)`);
    console.log('━'.repeat(80));
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Resolve dist directory path
    const projectRoot = path.resolve(__dirname, '../..');
    const distDir = path.join(projectRoot, 'dist');

    // Run analysis
    const analysis = await analyzeBundle(distDir);

    if (!analysis) {
      return 1;
    }

    // Validate against target
    const passed = validateBundleSize(analysis);

    if (passed) {
      console.log('\n✅ Bundle size validation passed!');
      return 0;
    } else {
      console.error('\n❌ Bundle size exceeds Article II target');
      console.error('   Recommendations:');
      console.error('   - Review large dependencies');
      console.error('   - Enable code splitting for routes');
      console.error('   - Check for duplicate dependencies');
      console.error('   - Analyze with rollup-plugin-visualizer');
      return 1;
    }

  } catch (error) {
    console.error('\n❌ Bundle analysis failed:', error.message);
    console.error(error.stack);
    return 1;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(code => process.exit(code));
}

export { analyzeBundle, validateBundleSize };