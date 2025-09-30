/**
 * Lighthouse Performance Audit
 * Task 1.20: Performance Validation
 *
 * Validates Article II (Performance) requirements:
 * - Lighthouse Performance score > 90
 * - First Contentful Paint < 1s
 * - Time to Interactive < 2s
 * - Cumulative Layout Shift < 0.1
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run Lighthouse audit on specified URL
 * @param {string} url - URL to audit
 * @returns {Promise<Object>} Lighthouse results
 */
async function runLighthouseAudit(url) {
  console.log(`\n🔍 Running Lighthouse audit on ${url}...`);

  // Launch Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    // Run Lighthouse
    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices'],
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
      },
    };

    const runnerResult = await lighthouse(url, options);
    return runnerResult;
  } finally {
    // Always close Chrome
    await chrome.kill();
  }
}

/**
 * Format metric value for display
 * @param {Object} audit - Lighthouse audit result
 * @returns {string} Formatted display value
 */
function formatMetric(audit) {
  return audit.displayValue || 'N/A';
}

/**
 * Extract and validate performance metrics
 * @param {Object} lhr - Lighthouse results
 * @returns {Object} Metrics and validation results
 */
function analyzePerformance(lhr) {
  // Extract scores
  const performance = lhr.categories.performance.score * 100;
  const accessibility = lhr.categories.accessibility.score * 100;
  const bestPractices = lhr.categories['best-practices'].score * 100;

  // Extract metrics
  const metrics = {
    'Performance Score': performance.toFixed(0),
    'Accessibility Score': accessibility.toFixed(0),
    'Best Practices Score': bestPractices.toFixed(0),
    'First Contentful Paint': formatMetric(lhr.audits['first-contentful-paint']),
    'Largest Contentful Paint': formatMetric(lhr.audits['largest-contentful-paint']),
    'Time to Interactive': formatMetric(lhr.audits['interactive']),
    'Speed Index': formatMetric(lhr.audits['speed-index']),
    'Total Blocking Time': formatMetric(lhr.audits['total-blocking-time']),
    'Cumulative Layout Shift': formatMetric(lhr.audits['cumulative-layout-shift']),
  };

  // Extract numeric values for validation
  const fcpMs = lhr.audits['first-contentful-paint'].numericValue;
  const ttiMs = lhr.audits['interactive'].numericValue;
  const clsValue = lhr.audits['cumulative-layout-shift'].numericValue;

  // Validate against Article II targets
  const validations = {
    'Performance > 90': {
      passed: performance >= 90,
      target: '≥ 90',
      actual: performance.toFixed(0),
    },
    'FCP < 1.0s': {
      passed: fcpMs < 1000,
      target: '< 1.0s',
      actual: `${(fcpMs / 1000).toFixed(2)}s`,
    },
    'TTI < 2.0s': {
      passed: ttiMs < 2000,
      target: '< 2.0s',
      actual: `${(ttiMs / 1000).toFixed(2)}s`,
    },
    'CLS < 0.1': {
      passed: clsValue < 0.1,
      target: '< 0.1',
      actual: clsValue.toFixed(3),
    },
  };

  return { metrics, validations, performance };
}

/**
 * Save Lighthouse reports to disk
 * @param {Object} result - Lighthouse result
 * @param {string} reportsDir - Directory to save reports
 */
async function saveReports(result, reportsDir) {
  await fs.mkdir(reportsDir, { recursive: true });

  const { lhr, report } = result;

  // Save HTML report
  const htmlPath = path.join(reportsDir, 'lighthouse-report.html');
  await fs.writeFile(htmlPath, report[0]);

  // Save JSON report
  const jsonPath = path.join(reportsDir, 'lighthouse-report.json');
  await fs.writeFile(jsonPath, JSON.stringify(lhr, null, 2));

  console.log(`\n📄 Reports saved:`);
  console.log(`   HTML: ${htmlPath}`);
  console.log(`   JSON: ${jsonPath}`);
}

/**
 * Main execution function
 */
async function main() {
  const url = process.env.TEST_URL || 'http://localhost:4175';
  const reportsDir = path.join(__dirname, 'reports');

  try {
    // Run audit
    const result = await runLighthouseAudit(url);
    const { lhr } = result;

    // Analyze results
    const { metrics, validations, performance } = analyzePerformance(lhr);

    // Display metrics
    console.log('\n📊 Performance Metrics:');
    console.log('━'.repeat(60));
    for (const [key, value] of Object.entries(metrics)) {
      console.log(`  ${key.padEnd(30)}: ${value}`);
    }
    console.log('━'.repeat(60));

    // Display validation results
    console.log('\n🎯 Article II Performance Targets:');
    console.log('━'.repeat(60));
    for (const [target, result] of Object.entries(validations)) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${target.padEnd(20)}: ${status}`);
      console.log(`     Target: ${result.target.padEnd(10)} | Actual: ${result.actual}`);
    }
    console.log('━'.repeat(60));

    // Save reports
    await saveReports(result, reportsDir);

    // Check if all validations passed
    const allPassed = Object.values(validations).every(v => v.passed);

    if (allPassed) {
      console.log('\n✅ All Article II performance targets met!');
      console.log(`   Performance Score: ${performance.toFixed(0)}/100`);
      return 0;
    } else {
      const failed = Object.entries(validations)
        .filter(([, v]) => !v.passed)
        .map(([k]) => k);

      console.error('\n❌ Performance validation failed:');
      failed.forEach(target => console.error(`   - ${target}`));
      return 1;
    }

  } catch (error) {
    console.error('\n❌ Lighthouse audit failed:', error.message);
    console.error(error.stack);
    return 1;
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().then(code => process.exit(code));
}

export { runLighthouseAudit, analyzePerformance };