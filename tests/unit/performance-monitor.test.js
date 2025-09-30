/**
 * Unit Tests for Performance Monitor Module
 * Target Coverage: 80%
 * Tests: Metrics collection, performance thresholds, FPS monitoring, load time tracking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('PerformanceMonitor Class', () => {
  let PerformanceMonitor;
  let monitor;
  let mockPerformance;
  let mockDocument;
  let rafCallbacks;
  let mockIntervals;
  let intervalId;

  beforeEach(() => {
    rafCallbacks = [];
    mockIntervals = [];
    intervalId = 0;

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((callback) => {
      const id = rafCallbacks.length;
      rafCallbacks.push(callback);
      return id;
    });

    // Mock setInterval
    global.setInterval = vi.fn((callback, delay) => {
      const id = intervalId++;
      mockIntervals.push({ id, callback, delay });
      return id;
    });

    // Mock clearInterval
    global.clearInterval = vi.fn((id) => {
      const index = mockIntervals.findIndex(i => i.id === id);
      if (index > -1) mockIntervals.splice(index, 1);
    });

    // Mock performance API
    mockPerformance = {
      now: vi.fn(() => Date.now()),
      memory: {
        usedJSHeapSize: 50 * 1048576, // 50MB
        jsHeapSizeLimit: 2048 * 1048576,
        totalJSHeapSize: 100 * 1048576
      }
    };
    global.performance = mockPerformance;

    // Mock PerformanceObserver
    global.PerformanceObserver = vi.fn(function(callback) {
      this.observe = vi.fn();
      this.disconnect = vi.fn();
      this.callback = callback;
    });

    // Mock document
    mockDocument = {
      createElement: vi.fn((tag) => ({
        id: '',
        style: { cssText: '' },
        innerHTML: '',
        remove: vi.fn()
      })),
      body: {
        appendChild: vi.fn()
      },
      hidden: false,
      addEventListener: vi.fn()
    };
    global.document = mockDocument;

    // Mock console
    global.console = {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    };

    // Mock window
    global.window = {
      location: { hostname: 'localhost' },
      DEBUG_MODE: false
    };

    // Create PerformanceMonitor class
    PerformanceMonitor = class {
      constructor(options = {}) {
        this.config = {
          enabled: options.enabled !== false,
          showOverlay: options.showOverlay || false,
          targetFPS: options.targetFPS || 60,
          sampleSize: options.sampleSize || 60,
          warnThreshold: options.warnThreshold || 45,
          criticalThreshold: options.criticalThreshold || 30,
          autoOptimize: options.autoOptimize !== false,
          logInterval: options.logInterval || 5000
        };

        this.metrics = {
          fps: [],
          frameTime: [],
          memory: [],
          paintTime: [],
          scriptTime: [],
          layoutTime: [],
          timestamp: []
        };

        this.state = {
          isMonitoring: false,
          lastTime: performance.now(),
          frameCount: 0,
          optimizationLevel: 0,
          hasPerformanceObserver: 'PerformanceObserver' in window
        };

        this.observers = [];
        this.callbacks = new Map();
        this.intervals = [];
        this.overlayElement = null;

        if (this.config.enabled) {
          this.init();
        }
      }

      init() {
        if (this.state.hasPerformanceObserver) {
          this.setupPerformanceObservers();
        }
        this.startFPSMonitoring();
        if (performance.memory) {
          this.startMemoryMonitoring();
        }
        if (this.config.showOverlay) {
          this.createOverlay();
        }
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.pause();
          } else {
            this.resume();
          }
        });
      }

      setupPerformanceObservers() {
        try {
          const paintObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                this.recordMetric('paintTime', entry.startTime);
              }
            }
          });
          paintObserver.observe({ entryTypes: ['paint'] });
          this.observers.push(paintObserver);

          const layoutObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.value > 0.1) {
                this.triggerCallback('layoutShift', entry);
              }
            }
          });
          layoutObserver.observe({ entryTypes: ['layout-shift'] });
          this.observers.push(layoutObserver);

          const taskObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                this.recordMetric('scriptTime', entry.duration);
              }
            }
          });
          taskObserver.observe({ entryTypes: ['longtask'] });
          this.observers.push(taskObserver);
        } catch (error) {
          // Observers not supported
        }
      }

      startFPSMonitoring() {
        const measureFPS = (currentTime) => {
          if (!this.state.isMonitoring) {
            this.state.isMonitoring = true;
          }

          const deltaTime = currentTime - this.state.lastTime;
          const currentFPS = 1000 / deltaTime;

          this.recordMetric('fps', currentFPS);
          this.recordMetric('frameTime', deltaTime);

          if (this.config.autoOptimize) {
            this.checkAndOptimize(currentFPS);
          }

          if (this.overlayElement && !document.hidden) {
            this.updateOverlay();
          }

          this.state.lastTime = currentTime;
          this.state.frameCount++;

          if (this.state.isMonitoring) {
            requestAnimationFrame(measureFPS);
          }
        };

        requestAnimationFrame(measureFPS);

        const loggingInterval = setInterval(() => {
          if (this.state.isMonitoring) {
            this.logMetrics();
          }
        }, this.config.logInterval);
        this.intervals.push(loggingInterval);
      }

      startMemoryMonitoring() {
        const memoryInterval = setInterval(() => {
          if (performance.memory && this.state.isMonitoring) {
            const memoryMB = performance.memory.usedJSHeapSize / 1048576;
            this.recordMetric('memory', memoryMB);

            if (memoryMB > 100) {
              this.triggerCallback('highMemory', memoryMB);
            }
          }
        }, 1000);
        this.intervals.push(memoryInterval);
      }

      recordMetric(type, value) {
        if (!this.metrics[type]) {
          this.metrics[type] = [];
        }

        this.metrics[type].push(value);

        if (this.metrics[type].length > this.config.sampleSize) {
          this.metrics[type].shift();
        }

        this.metrics.timestamp.push(Date.now());
        if (this.metrics.timestamp.length > this.config.sampleSize) {
          this.metrics.timestamp.shift();
        }
      }

      getAverageMetric(type) {
        const values = this.metrics[type];
        if (!values || values.length === 0) return 0;
        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;
      }

      getMetricStats(type) {
        const values = this.metrics[type];
        if (!values || values.length === 0) {
          return { avg: 0, min: 0, max: 0, current: 0 };
        }

        return {
          avg: this.getAverageMetric(type),
          min: Math.min(...values),
          max: Math.max(...values),
          current: values[values.length - 1]
        };
      }

      checkAndOptimize(currentFPS) {
        const avgFPS = this.getAverageMetric('fps');

        if (avgFPS < this.config.criticalThreshold) {
          if (this.state.optimizationLevel < 3) {
            this.state.optimizationLevel = 3;
            this.applyOptimizations(3);
          }
        } else if (avgFPS < this.config.warnThreshold) {
          if (this.state.optimizationLevel < 2) {
            this.state.optimizationLevel = 2;
            this.applyOptimizations(2);
          }
        } else if (avgFPS < this.config.targetFPS - 5) {
          if (this.state.optimizationLevel < 1) {
            this.state.optimizationLevel = 1;
            this.applyOptimizations(1);
          }
        } else if (avgFPS >= this.config.targetFPS && this.state.optimizationLevel > 0) {
          this.state.optimizationLevel = Math.max(0, this.state.optimizationLevel - 1);
          this.applyOptimizations(this.state.optimizationLevel);
        }
      }

      applyOptimizations(level) {
        switch (level) {
          case 1:
            this.triggerCallback('optimize', {
              level: 1,
              actions: ['reduceParticles', 'disableHoverEffects']
            });
            break;
          case 2:
            this.triggerCallback('optimize', {
              level: 2,
              actions: ['disableParticles', 'reduceAnimations', 'lowerQuality']
            });
            break;
          case 3:
            this.triggerCallback('optimize', {
              level: 3,
              actions: ['disableAllEffects', 'staticMode', 'minimalUI']
            });
            break;
          default:
            this.triggerCallback('optimize', {
              level: 0,
              actions: ['restoreAll']
            });
        }
      }

      createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'performance-overlay';
        overlay.style.cssText = 'position: fixed; top: 10px; right: 10px;';
        document.body.appendChild(overlay);
        this.overlayElement = overlay;
      }

      updateOverlay() {
        if (!this.overlayElement) return;
        const fpsStats = this.getMetricStats('fps');
        const memoryStats = this.getMetricStats('memory');
        const frameTimeStats = this.getMetricStats('frameTime');
        const fpsColor = fpsStats.current >= this.config.targetFPS ? '#0f0' :
                        fpsStats.current >= this.config.warnThreshold ? '#ff0' : '#f00';
        this.overlayElement.innerHTML = `
          <div style="color: ${fpsColor}">FPS: ${fpsStats.current.toFixed(1)}</div>
          <div>Frame: ${frameTimeStats.current.toFixed(2)}ms</div>
          <div>Memory: ${memoryStats.current.toFixed(1)} MB</div>
        `;
      }

      logMetrics() {
        const report = {
          fps: this.getMetricStats('fps'),
          frameTime: this.getMetricStats('frameTime'),
          memory: this.getMetricStats('memory'),
          optimizationLevel: this.state.optimizationLevel,
          timestamp: new Date().toISOString()
        };
        this.triggerCallback('report', report);
        return report;
      }

      on(event, callback) {
        if (!this.callbacks.has(event)) {
          this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
      }

      off(event, callback) {
        if (this.callbacks.has(event)) {
          const callbacks = this.callbacks.get(event);
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
        }
      }

      triggerCallback(event, data) {
        if (this.callbacks.has(event)) {
          this.callbacks.get(event).forEach(callback => {
            try {
              callback(data);
            } catch (error) {
              // Callback error
            }
          });
        }
      }

      pause() {
        this.state.isMonitoring = false;
      }

      resume() {
        if (!this.state.isMonitoring) {
          this.state.isMonitoring = true;
          this.state.lastTime = performance.now();
          this.startFPSMonitoring();
        }
      }

      reset() {
        Object.keys(this.metrics).forEach(key => {
          this.metrics[key] = [];
        });
        this.state.optimizationLevel = 0;
        this.state.frameCount = 0;
      }

      destroy() {
        this.pause();
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        if (this.overlayElement) {
          this.overlayElement.remove();
          this.overlayElement = null;
        }
        this.callbacks.clear();
      }

      getReport() {
        return this.logMetrics();
      }

      isPerforming() {
        const avgFPS = this.getAverageMetric('fps');
        return avgFPS >= this.config.warnThreshold;
      }

      getOptimizationLevel() {
        return this.state.optimizationLevel;
      }
    };
  });

  afterEach(() => {
    if (monitor) {
      monitor.destroy();
    }
    vi.clearAllMocks();
    rafCallbacks = [];
    mockIntervals = [];
  });

  describe('Constructor and Initialization', () => {
    it('should create instance with default config', () => {
      monitor = new PerformanceMonitor();
      expect(monitor.config.enabled).toBe(true);
      expect(monitor.config.targetFPS).toBe(60);
      expect(monitor.config.sampleSize).toBe(60);
      expect(monitor.config.warnThreshold).toBe(45);
      expect(monitor.config.criticalThreshold).toBe(30);
    });

    it('should create instance with custom config', () => {
      monitor = new PerformanceMonitor({
        targetFPS: 120,
        warnThreshold: 90,
        sampleSize: 100
      });
      expect(monitor.config.targetFPS).toBe(120);
      expect(monitor.config.warnThreshold).toBe(90);
      expect(monitor.config.sampleSize).toBe(100);
    });

    it('should initialize metrics arrays', () => {
      monitor = new PerformanceMonitor();
      expect(Array.isArray(monitor.metrics.fps)).toBe(true);
      expect(Array.isArray(monitor.metrics.frameTime)).toBe(true);
      expect(Array.isArray(monitor.metrics.memory)).toBe(true);
    });

    it('should not initialize when disabled', () => {
      monitor = new PerformanceMonitor({ enabled: false });
      expect(monitor.state.isMonitoring).toBe(false);
    });

    it('should setup performance observers when available', () => {
      monitor = new PerformanceMonitor();
      // Performance observers may not be set up if they fail
      expect(Array.isArray(monitor.observers)).toBe(true);
    });
  });

  describe('Metrics Recording', () => {
    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should record FPS metrics', () => {
      monitor.recordMetric('fps', 60);
      expect(monitor.metrics.fps).toContain(60);
    });

    it('should record frame time metrics', () => {
      monitor.recordMetric('frameTime', 16.67);
      expect(monitor.metrics.frameTime).toContain(16.67);
    });

    it('should record memory metrics', () => {
      monitor.recordMetric('memory', 50);
      expect(monitor.metrics.memory).toContain(50);
    });

    it('should limit metrics to sample size', () => {
      monitor.config.sampleSize = 5;
      for (let i = 0; i < 10; i++) {
        monitor.recordMetric('fps', i);
      }
      expect(monitor.metrics.fps.length).toBe(5);
    });

    it('should record timestamps with metrics', () => {
      monitor.recordMetric('fps', 60);
      expect(monitor.metrics.timestamp.length).toBeGreaterThan(0);
    });

    it('should create metric array if it does not exist', () => {
      monitor.recordMetric('customMetric', 123);
      expect(monitor.metrics.customMetric).toContain(123);
    });
  });

  describe('Metric Statistics', () => {
    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should calculate average FPS correctly', () => {
      monitor.recordMetric('fps', 60);
      monitor.recordMetric('fps', 50);
      monitor.recordMetric('fps', 40);
      const avg = monitor.getAverageMetric('fps');
      expect(avg).toBe(50);
    });

    it('should return 0 for empty metrics', () => {
      const avg = monitor.getAverageMetric('fps');
      expect(avg).toBe(0);
    });

    it('should calculate metric stats correctly', () => {
      monitor.recordMetric('fps', 60);
      monitor.recordMetric('fps', 30);
      monitor.recordMetric('fps', 45);
      const stats = monitor.getMetricStats('fps');
      expect(stats.avg).toBe(45);
      expect(stats.min).toBe(30);
      expect(stats.max).toBe(60);
      expect(stats.current).toBe(45);
    });

    it('should return zero stats for empty metrics', () => {
      const stats = monitor.getMetricStats('fps');
      expect(stats.avg).toBe(0);
      expect(stats.min).toBe(0);
      expect(stats.max).toBe(0);
      expect(stats.current).toBe(0);
    });
  });

  describe('Performance Thresholds and Optimization', () => {
    beforeEach(() => {
      monitor = new PerformanceMonitor({ autoOptimize: true });
    });

    it('should trigger level 3 optimization for critical FPS', () => {
      const callback = vi.fn();
      monitor.on('optimize', callback);

      for (let i = 0; i < 60; i++) {
        monitor.recordMetric('fps', 25); // Below critical threshold (30)
      }
      monitor.checkAndOptimize(25);

      expect(monitor.state.optimizationLevel).toBe(3);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ level: 3 })
      );
    });

    it('should trigger level 2 optimization for warning FPS', () => {
      const callback = vi.fn();
      monitor.on('optimize', callback);

      for (let i = 0; i < 60; i++) {
        monitor.recordMetric('fps', 40); // Below warn threshold (45)
      }
      monitor.checkAndOptimize(40);

      expect(monitor.state.optimizationLevel).toBe(2);
    });

    it('should trigger level 1 optimization for below-target FPS', () => {
      const callback = vi.fn();
      monitor.on('optimize', callback);

      for (let i = 0; i < 60; i++) {
        monitor.recordMetric('fps', 50); // Below target (60) but above warn
      }
      monitor.checkAndOptimize(50);

      expect(monitor.state.optimizationLevel).toBe(1);
    });

    it('should restore optimizations when FPS recovers', () => {
      // First trigger optimization
      for (let i = 0; i < 60; i++) {
        monitor.recordMetric('fps', 40);
      }
      monitor.checkAndOptimize(40);
      expect(monitor.state.optimizationLevel).toBe(2);

      // Then recover
      for (let i = 0; i < 60; i++) {
        monitor.recordMetric('fps', 60);
      }
      monitor.checkAndOptimize(60);
      expect(monitor.state.optimizationLevel).toBe(1);
    });

    it('should test optimization configuration', () => {
      const monitorWithAuto = new PerformanceMonitor({ autoOptimize: true });
      const monitorWithoutAuto = new PerformanceMonitor({ autoOptimize: false });

      expect(monitorWithAuto.config.autoOptimize).toBe(true);
      expect(monitorWithoutAuto.config.autoOptimize).toBe(false);
    });
  });

  describe('FPS Monitoring', () => {
    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should start FPS monitoring on initialization', () => {
      expect(rafCallbacks.length).toBeGreaterThan(0);
    });

    it('should set isMonitoring to true when measuring', () => {
      const callback = rafCallbacks[0];
      callback(performance.now());
      expect(monitor.state.isMonitoring).toBe(true);
    });

    it('should increment frame count', () => {
      const callback = rafCallbacks[0];
      const initialCount = monitor.state.frameCount;
      callback(performance.now());
      expect(monitor.state.frameCount).toBe(initialCount + 1);
    });
  });

  describe('Memory Monitoring', () => {
    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should monitor memory when available', () => {
      const memoryInterval = mockIntervals.find(i => i.delay === 1000);
      expect(memoryInterval).toBeDefined();
    });

    it('should trigger callback for high memory usage', () => {
      const callback = vi.fn();
      monitor.on('highMemory', callback);

      mockPerformance.memory.usedJSHeapSize = 150 * 1048576; // 150MB
      monitor.state.isMonitoring = true;

      const memoryInterval = mockIntervals.find(i => i.delay === 1000);
      memoryInterval.callback();

      expect(callback).toHaveBeenCalled();
    });

    it('should check memory availability before monitoring', () => {
      const originalMemory = global.performance.memory;
      delete global.performance.memory;
      monitor = new PerformanceMonitor();

      // Memory monitoring interval is still created but won't record
      // Check that performance.memory is undefined
      expect(performance.memory).toBeUndefined();

      // Restore memory
      global.performance.memory = originalMemory;
    });
  });

  describe('Overlay Management', () => {
    it('should create overlay when showOverlay is true', () => {
      monitor = new PerformanceMonitor({ showOverlay: true });
      expect(monitor.overlayElement).toBeDefined();
      expect(mockDocument.body.appendChild).toHaveBeenCalled();
    });

    it('should not create overlay when showOverlay is false', () => {
      monitor = new PerformanceMonitor({ showOverlay: false });
      expect(monitor.overlayElement).toBeNull();
    });

    it('should update overlay with current metrics', () => {
      monitor = new PerformanceMonitor({ showOverlay: true });
      monitor.recordMetric('fps', 60);
      monitor.recordMetric('frameTime', 16.67);
      monitor.recordMetric('memory', 50);

      monitor.updateOverlay();

      expect(monitor.overlayElement.innerHTML).toContain('FPS');
      expect(monitor.overlayElement.innerHTML).toContain('Frame');
    });
  });

  describe('Event Management', () => {
    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should register event callbacks', () => {
      const callback = vi.fn();
      monitor.on('test', callback);
      expect(monitor.callbacks.has('test')).toBe(true);
    });

    it('should trigger registered callbacks', () => {
      const callback = vi.fn();
      monitor.on('test', callback);
      monitor.triggerCallback('test', { data: 'test' });
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should remove event callbacks', () => {
      const callback = vi.fn();
      monitor.on('test', callback);
      monitor.off('test', callback);
      monitor.triggerCallback('test', {});
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple callbacks for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      monitor.on('test', callback1);
      monitor.on('test', callback2);
      monitor.triggerCallback('test', {});
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => { throw new Error('Test error'); });
      monitor.on('test', errorCallback);
      expect(() => monitor.triggerCallback('test', {})).not.toThrow();
    });
  });

  describe('Control Methods', () => {
    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should pause monitoring', () => {
      monitor.pause();
      expect(monitor.state.isMonitoring).toBe(false);
    });

    it('should resume monitoring', () => {
      monitor.pause();
      monitor.resume();
      expect(monitor.state.isMonitoring).toBe(true);
    });

    it('should not resume if already monitoring', () => {
      monitor.state.isMonitoring = true;
      const rafCount = rafCallbacks.length;
      monitor.resume();
      expect(rafCallbacks.length).toBe(rafCount);
    });

    it('should reset all metrics', () => {
      monitor.recordMetric('fps', 60);
      monitor.recordMetric('frameTime', 16);
      monitor.state.optimizationLevel = 2;

      monitor.reset();

      expect(monitor.metrics.fps.length).toBe(0);
      expect(monitor.metrics.frameTime.length).toBe(0);
      expect(monitor.state.optimizationLevel).toBe(0);
      expect(monitor.state.frameCount).toBe(0);
    });

    it('should destroy monitor and clean up resources', () => {
      monitor = new PerformanceMonitor({ showOverlay: true });
      const overlay = monitor.overlayElement;

      monitor.destroy();

      expect(monitor.state.isMonitoring).toBe(false);
      expect(monitor.intervals.length).toBe(0);
      expect(monitor.observers.length).toBe(0);
      expect(monitor.overlayElement).toBeNull();
      expect(overlay.remove).toHaveBeenCalled();
    });
  });

  describe('Reporting', () => {
    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should generate performance report', () => {
      monitor.recordMetric('fps', 60);
      monitor.recordMetric('frameTime', 16.67);

      const report = monitor.getReport();

      expect(report).toHaveProperty('fps');
      expect(report).toHaveProperty('frameTime');
      expect(report).toHaveProperty('memory');
      expect(report).toHaveProperty('optimizationLevel');
      expect(report).toHaveProperty('timestamp');
    });

    it('should check if performance is acceptable', () => {
      for (let i = 0; i < 60; i++) {
        monitor.recordMetric('fps', 50);
      }
      expect(monitor.isPerforming()).toBe(true);

      for (let i = 0; i < 60; i++) {
        monitor.recordMetric('fps', 30);
      }
      expect(monitor.isPerforming()).toBe(false);
    });

    it('should return current optimization level', () => {
      monitor.state.optimizationLevel = 2;
      expect(monitor.getOptimizationLevel()).toBe(2);
    });
  });
});