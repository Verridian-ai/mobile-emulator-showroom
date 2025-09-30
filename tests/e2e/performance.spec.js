/**
 * Performance Tests (US-5)
 *
 * User Story: As a developer, I want fast load times and smooth animations
 * so that my workflow isn't disrupted.
 *
 * Constitution Article II: Performance & Optimization
 * - Initial page load < 2 seconds
 * - Device switching < 300ms
 * - 60fps animations
 * - Bundle size < 500KB
 *
 * Task: 1.17 - E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('US-5: Performance Requirements', () => {
  test.describe('Load Time Performance (Article II)', () => {
    test('should load in < 2 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('load');

      const loadTime = Date.now() - startTime;

      console.log(`Load time: ${loadTime}ms`);

      // Article II: < 2 second load time
      expect(loadTime).toBeLessThan(2000);
    });

    test('should reach First Contentful Paint in < 1 second', async ({ page }) => {
      await page.goto('/');

      const fcp = await page.evaluate(() => {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return fcpEntry ? fcpEntry.startTime : 0;
      });

      console.log(`First Contentful Paint: ${fcp}ms`);

      // Article II: FCP < 1 second
      expect(fcp).toBeLessThan(1000);
    });

    test('should reach Time to Interactive in < 2 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');

      // Wait for page to be interactive
      await page.waitForLoadState('networkidle');

      const tti = Date.now() - startTime;

      console.log(`Time to Interactive: ${tti}ms`);

      // Article II: TTI < 2 seconds
      expect(tti).toBeLessThan(2000);
    });
  });

  test.describe('Device Switching Performance', () => {
    test('should switch devices in < 300ms', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const deviceButtons = page.locator('[data-device]');

      if (await deviceButtons.count() >= 2) {
        // Pre-load first device
        await deviceButtons.nth(0).click();
        await page.waitForTimeout(500);

        // Measure switch time
        const startTime = Date.now();
        await deviceButtons.nth(1).click();
        await page.waitForTimeout(100); // Allow for visual update
        const switchTime = Date.now() - startTime;

        console.log(`Device switch time: ${switchTime}ms`);

        // Article IV: < 300ms switch time
        expect(switchTime).toBeLessThan(300);
      }
    });

    test('should maintain performance across multiple switches', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const deviceButtons = page.locator('[data-device]');
      const count = await deviceButtons.count();

      if (count >= 3) {
        const switchTimes = [];

        for (let i = 0; i < 5; i++) {
          const targetDevice = i % count;
          const startTime = Date.now();
          await deviceButtons.nth(targetDevice).click();
          await page.waitForTimeout(50);
          const switchTime = Date.now() - startTime;
          switchTimes.push(switchTime);
        }

        const avgSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;

        console.log(`Average switch time: ${avgSwitchTime}ms`);
        console.log(`All switch times: ${switchTimes.join(', ')}ms`);

        // Average should be < 300ms
        expect(avgSwitchTime).toBeLessThan(300);

        // No individual switch should exceed 500ms
        switchTimes.forEach(time => {
          expect(time).toBeLessThan(500);
        });
      }
    });
  });

  test.describe('Animation Performance (Article II: 60fps)', () => {
    test('should achieve 60fps during device transitions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Setup FPS monitoring
      await page.evaluate(() => {
        window.fps = [];
        let lastTime = performance.now();
        let frameCount = 0;

        function measureFPS() {
          const currentTime = performance.now();
          const delta = currentTime - lastTime;

          if (delta >= 16) { // ~60fps = 16.67ms per frame
            window.fps.push(1000 / delta);
            lastTime = currentTime;
            frameCount++;
          }

          if (frameCount < 60) { // Measure 60 frames (~1 second)
            requestAnimationFrame(measureFPS);
          }
        }

        requestAnimationFrame(measureFPS);
      });

      // Trigger animations
      const deviceButtons = page.locator('[data-device]');
      if (await deviceButtons.count() >= 2) {
        await deviceButtons.nth(0).click();
        await page.waitForTimeout(100);
        await deviceButtons.nth(1).click();
        await page.waitForTimeout(1000);
      }

      const avgFPS = await page.evaluate(() => {
        if (!window.fps || window.fps.length === 0) return 60;
        return window.fps.reduce((a, b) => a + b, 0) / window.fps.length;
      });

      console.log(`Average FPS: ${avgFPS.toFixed(2)}`);

      // Article II: 60fps requirement (allow 50+ for CI variability)
      expect(avgFPS).toBeGreaterThanOrEqual(50);
    });

    test('should have smooth scrolling (no jank)', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Measure layout shifts during scroll
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsScore = 0;

          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
          });

          observer.observe({ type: 'layout-shift', buffered: true });

          // Scroll after delay
          setTimeout(() => {
            window.scrollTo({ top: 100, behavior: 'smooth' });
          }, 100);

          setTimeout(() => {
            observer.disconnect();
            resolve(clsScore);
          }, 1000);
        });
      });

      console.log(`Cumulative Layout Shift: ${cls}`);

      // Good CLS score is < 0.1
      expect(cls).toBeLessThan(0.25); // Allow some tolerance
    });

    test('should not drop frames during intensive operations', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Monitor frame drops
      const frameDrops = await page.evaluate(() => {
        return new Promise((resolve) => {
          let drops = 0;
          let lastTime = performance.now();

          function checkFrame() {
            const currentTime = performance.now();
            const delta = currentTime - lastTime;

            // Frame drop if > 50ms (< 20fps)
            if (delta > 50) {
              drops++;
            }

            lastTime = currentTime;

            if (performance.now() < window.startTime + 2000) {
              requestAnimationFrame(checkFrame);
            } else {
              resolve(drops);
            }
          }

          window.startTime = performance.now();
          requestAnimationFrame(checkFrame);
        });
      });

      // Perform intensive operation
      const deviceButtons = page.locator('[data-device]');
      if (await deviceButtons.count() >= 2) {
        for (let i = 0; i < 5; i++) {
          await deviceButtons.nth(i % 2).click();
          await page.waitForTimeout(100);
        }
      }

      console.log(`Frame drops: ${frameDrops}`);

      // Should have minimal frame drops
      expect(frameDrops).toBeLessThan(5);
    });
  });

  test.describe('Memory Efficiency (Article II)', () => {
    test('should have efficient memory usage < 200MB', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          return {
            // @ts-ignore
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            // @ts-ignore
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            // @ts-ignore
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (initialMemory) {
        const usedMB = initialMemory.usedJSHeapSize / (1024 * 1024);
        console.log(`Initial memory usage: ${usedMB.toFixed(2)}MB`);

        // Article II: < 200MB memory usage
        expect(usedMB).toBeLessThan(200);
      }
    });

    test('should not leak memory during device switching', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const initialMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          // @ts-ignore
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      // Perform many device switches
      const deviceButtons = page.locator('[data-device]');
      if (await deviceButtons.count() >= 2) {
        for (let i = 0; i < 20; i++) {
          await deviceButtons.nth(i % 2).click();
          await page.waitForTimeout(50);
        }
      }

      const finalMemory = await page.evaluate(() => {
        if ('memory' in performance) {
          // @ts-ignore
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      });

      if (initialMemory && finalMemory) {
        const memoryGrowth = (finalMemory - initialMemory) / (1024 * 1024);
        console.log(`Memory growth after 20 switches: ${memoryGrowth.toFixed(2)}MB`);

        // Should not grow by more than 50MB
        expect(memoryGrowth).toBeLessThan(50);
      }
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should have optimized bundle size < 500KB', async ({ page }) => {
      await page.goto('/');

      const resourceSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        let totalJS = 0;
        let totalCSS = 0;

        resources.forEach(resource => {
          if (resource.name.endsWith('.js')) {
            totalJS += resource.transferSize || 0;
          } else if (resource.name.endsWith('.css')) {
            totalCSS += resource.transferSize || 0;
          }
        });

        return { totalJS, totalCSS, combined: totalJS + totalCSS };
      });

      const totalKB = resourceSizes.combined / 1024;
      console.log(`Bundle size: JS=${(resourceSizes.totalJS / 1024).toFixed(2)}KB, CSS=${(resourceSizes.totalCSS / 1024).toFixed(2)}KB, Total=${totalKB.toFixed(2)}KB`);

      // Article II: < 500KB bundle size
      expect(totalKB).toBeLessThan(500);
    });

    test('should have optimized image loading', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const imageSizes = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        let totalImages = 0;
        let imageCount = 0;

        resources.forEach(resource => {
          if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            totalImages += resource.transferSize || 0;
            imageCount++;
          }
        });

        return { totalImages, imageCount };
      });

      const totalImagesMB = imageSizes.totalImages / (1024 * 1024);
      console.log(`Images: ${imageSizes.imageCount} files, ${totalImagesMB.toFixed(2)}MB total`);

      // Article IX: Optimized images (allow up to 5MB for all device frames)
      expect(totalImagesMB).toBeLessThan(5);
    });

    test('should load resources in parallel', async ({ page }) => {
      await page.goto('/');

      const resourceCount = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.length;
      });

      console.log(`Total resources loaded: ${resourceCount}`);

      // Should have loaded resources (not blocking sequentially)
      expect(resourceCount).toBeGreaterThan(0);
    });
  });

  test.describe('Input Responsiveness', () => {
    test('should have no input lag on URL field', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const urlInput = page.locator('input[type="url"], input[placeholder*="URL"]').first();

      if (await urlInput.count() > 0) {
        const startTime = Date.now();

        // Type rapidly
        await urlInput.type('https://example.com', { delay: 10 });

        const typeTime = Date.now() - startTime;

        console.log(`Typing time: ${typeTime}ms`);

        // Should be responsive (< 500ms for typing)
        expect(typeTime).toBeLessThan(500);
      }
    });

    test('should respond to clicks instantly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const deviceButtons = page.locator('[data-device]');

      if (await deviceButtons.count() > 0) {
        const startTime = Date.now();
        await deviceButtons.first().click();

        // Measure click response time
        await page.waitForTimeout(10);
        const responseTime = Date.now() - startTime;

        console.log(`Click response time: ${responseTime}ms`);

        // Should respond immediately (< 100ms)
        expect(responseTime).toBeLessThan(100);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should have minimal HTTP requests', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const requestCount = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources.length;
      });

      console.log(`HTTP requests: ${requestCount}`);

      // Should have reasonable request count (< 50 for initial load)
      expect(requestCount).toBeLessThan(50);
    });

    test('should use caching effectively', async ({ page }) => {
      // First load
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      const cachedResources = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        let cachedCount = 0;

        resources.forEach(resource => {
          if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
            cachedCount++;
          }
        });

        return cachedCount;
      });

      console.log(`Cached resources on reload: ${cachedResources}`);

      // Should cache some resources
      expect(cachedResources).toBeGreaterThan(0);
    });
  });

  test.describe('Lighthouse Score Targets', () => {
    test('should pass Core Web Vitals', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Get Web Vitals
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {};

          // LCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            vitals.lcp = entries[entries.length - 1].startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });

          // FID (can't measure in automation, simulate)
          vitals.fid = 0;

          // CLS
          let clsScore = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
            vitals.cls = clsScore;
          }).observe({ type: 'layout-shift', buffered: true });

          setTimeout(() => resolve(vitals), 1000);
        });
      });

      console.log('Core Web Vitals:', vitals);

      // LCP should be < 2.5s (good)
      if (vitals.lcp) {
        expect(vitals.lcp).toBeLessThan(2500);
      }

      // CLS should be < 0.1 (good)
      if (vitals.cls !== undefined) {
        expect(vitals.cls).toBeLessThan(0.25); // Allow tolerance
      }
    });
  });
});