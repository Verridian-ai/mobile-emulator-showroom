/**
 * Verridian AI - Performance Monitor
 * Real-time performance metrics and optimization
 * Version: 1.0.0
 */

class PerformanceMonitor {
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
        
        if (this.config.enabled) {
            this.init();
        }
    }

    init() {
        // Setup performance observers
        if (this.state.hasPerformanceObserver) {
            this.setupPerformanceObservers();
        }

        // Setup FPS monitoring
        this.startFPSMonitoring();

        // Setup memory monitoring if available
        if (performance.memory) {
            this.startMemoryMonitoring();
        }

        // Create overlay if requested
        if (this.config.showOverlay) {
            this.createOverlay();
        }

        // Setup visibility change handler
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        console.log('🎯 Performance Monitor initialized');
    }

    setupPerformanceObservers() {
        try {
            // Paint timing
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.recordMetric('paintTime', entry.startTime);
                    }
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });
            this.observers.push(paintObserver);

            // Layout shifts
            const layoutObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.value > 0.1) {
                        console.warn('Layout shift detected:', entry.value);
                        this.triggerCallback('layoutShift', entry);
                    }
                }
            });
            layoutObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.push(layoutObserver);

            // Long tasks
            const taskObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        this.recordMetric('scriptTime', entry.duration);
                        if (entry.duration > 100) {
                            console.warn('Long task detected:', entry.duration + 'ms');
                        }
                    }
                }
            });
            taskObserver.observe({ entryTypes: ['longtask'] });
            this.observers.push(taskObserver);

        } catch (error) {
            console.warn('Performance Observer setup failed:', error);
        }
    }

    startFPSMonitoring() {
        const measureFPS = (currentTime) => {
            if (!this.state.isMonitoring) {
                this.state.isMonitoring = true;
            }

            const deltaTime = currentTime - this.state.lastTime;
            const currentFPS = 1000 / deltaTime;

            // Record FPS
            this.recordMetric('fps', currentFPS);
            this.recordMetric('frameTime', deltaTime);

            // Auto-optimize if needed
            if (this.config.autoOptimize) {
                this.checkAndOptimize(currentFPS);
            }

            // Update overlay if visible
            if (this.overlayElement && !document.hidden) {
                this.updateOverlay();
            }

            this.state.lastTime = currentTime;
            this.state.frameCount++;

            // Continue monitoring
            if (this.state.isMonitoring) {
                requestAnimationFrame(measureFPS);
            }
        };

        requestAnimationFrame(measureFPS);

        // Periodic logging
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

                // Warn if memory usage is high
                if (memoryMB > 100) {
                    console.warn(`High memory usage: ${memoryMB.toFixed(2)} MB`);
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

        // Keep only recent samples
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

        // Determine optimization level
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
            // Performance recovered, reduce optimizations
            this.state.optimizationLevel = Math.max(0, this.state.optimizationLevel - 1);
            this.applyOptimizations(this.state.optimizationLevel);
        }
    }

    applyOptimizations(level) {
        console.log(`Applying optimization level ${level}`);
        
        switch (level) {
            case 1: // Mild optimizations
                this.triggerCallback('optimize', {
                    level: 1,
                    actions: ['reduceParticles', 'disableHoverEffects']
                });
                break;
                
            case 2: // Moderate optimizations
                this.triggerCallback('optimize', {
                    level: 2,
                    actions: ['disableParticles', 'reduceAnimations', 'lowerQuality']
                });
                break;
                
            case 3: // Aggressive optimizations
                this.triggerCallback('optimize', {
                    level: 3,
                    actions: ['disableAllEffects', 'staticMode', 'minimalUI']
                });
                break;
                
            default: // No optimizations
                this.triggerCallback('optimize', {
                    level: 0,
                    actions: ['restoreAll']
                });
        }
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'performance-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #0f0;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            border-radius: 5px;
            min-width: 200px;
            pointer-events: none;
            user-select: none;
        `;
        
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
            <div style="color: ${fpsColor}">FPS: ${fpsStats.current.toFixed(1)} (avg: ${fpsStats.avg.toFixed(1)})</div>
            <div>Frame: ${frameTimeStats.current.toFixed(2)}ms</div>
            ${performance.memory ? `<div>Memory: ${memoryStats.current.toFixed(1)} MB</div>` : ''}
            <div>Optimization: L${this.state.optimizationLevel}</div>
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

        // Log to console only in development with debug flag
        if (window.location.hostname === 'localhost' && window.DEBUG_MODE) {
            console.log('Performance Report:', report);
        }

        // Trigger callback for external logging
        this.triggerCallback('report', report);

        return report;
    }

    // Event management
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
                    console.error(`Error in performance callback:`, error);
                }
            });
        }
    }

    // Control methods
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
        
        // Clean up intervals
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
        
        // Clean up observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        // Remove overlay
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
        
        // Clear callbacks
        this.callbacks.clear();
    }

    // Public API
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
}

// Auto-initialize if included
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
    
    // Auto-start in development mode
    if (window.location.hostname === 'localhost') {
        window.performanceMonitor = new PerformanceMonitor({
            enabled: true,
            showOverlay: false,
            autoOptimize: true
        });
    }
}