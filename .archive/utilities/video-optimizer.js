/**
 * VERRIDIAN AI VIDEO OPTIMIZER
 * Intelligent video background management system
 */

class VerridianVideoOptimizer {
    constructor() {
        this.config = {
            maxRetries: 3,
            loadTimeout: 10000,
            performanceCheckInterval: 5000,
            minFPS: 25,
            networkCheckDelay: 2000
        };
        
        this.state = {
            videosLoaded: new Set(),
            failedVideos: new Set(),
            networkQuality: 'unknown',
            isLowPerformance: false,
            retryCount: new Map()
        };
        
        this.videoObservers = new Map();
        this.eventHandlers = new Map();
        this.timeouts = new Set();
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupOptimizer());
        } else {
            this.setupOptimizer();
        }
    }
    
    setupOptimizer() {
        this.detectCapabilities();
        this.setupVideoElements();
        this.setupPerformanceMonitoring();
        this.setupNetworkMonitoring();
        this.setupErrorHandling();
        
        console.log('🌌 Verridian Video Optimizer initialized');
    }
    
    detectCapabilities() {
        // Device capability detection
        const isMobile = window.innerWidth <= 768;
        const isLowPower = navigator.hardwareConcurrency <= 4;
        const hasSlowConnection = navigator.connection && 
            (navigator.connection.effectiveType === 'slow-2g' || 
             navigator.connection.effectiveType === '2g');
        
        this.state.isLowPerformance = isMobile || isLowPower || hasSlowConnection;
        
        // Prefer reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion || this.state.isLowPerformance) {
            this.disableVideos('Performance/accessibility optimization');
            return;
        }
        
        // Network quality estimation
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.effectiveType === '4g' && connection.downlink > 5) {
                this.state.networkQuality = 'high';
            } else if (connection.effectiveType === '3g' || connection.downlink > 1.5) {
                this.state.networkQuality = 'medium';
            } else {
                this.state.networkQuality = 'low';
            }
        }
        
        console.log('📊 Device capabilities:', {
            mobile: isMobile,
            lowPower: isLowPower,
            slowConnection: hasSlowConnection,
            networkQuality: this.state.networkQuality,
            reducedMotion: prefersReducedMotion
        });
    }
    
    setupVideoElements() {
        const videos = document.querySelectorAll('.background-video-layer, .cosmic-video-background');
        
        videos.forEach((video, index) => {
            this.optimizeVideo(video, index);
        });
    }
    
    optimizeVideo(video, index) {
        const videoId = `video_${index}`;
        
        // Set loading attributes
        video.setAttribute('data-video-id', videoId);
        video.setAttribute('data-loaded', 'false');
        
        // Optimize video settings based on capabilities
        if (this.state.networkQuality === 'low') {
            video.style.display = 'none';
            this.showFallback(video);
            return;
        }
        
        // Set up video event listeners with cleanup tracking
        const loadTimeout = setTimeout(() => {
            console.warn(`⚠️ Video ${videoId} load timeout`);
            this.handleVideoError(video, 'timeout');
            this.timeouts.delete(loadTimeout);
        }, this.config.loadTimeout);
        this.timeouts.add(loadTimeout);
        
        const loadHandler = () => {
            clearTimeout(loadTimeout);
            this.timeouts.delete(loadTimeout);
            this.handleVideoLoad(video, videoId);
        };
        
        const errorHandler = () => {
            clearTimeout(loadTimeout);
            this.timeouts.delete(loadTimeout);
            this.handleVideoError(video, 'error');
        };
        
        const canplayHandler = () => {
            this.state.videosLoaded.add(videoId);
            video.setAttribute('data-loaded', 'true');
            
            // Apply quality class based on network
            document.body.classList.add(`video-quality-${this.state.networkQuality}`);
        };
        
        video.addEventListener('loadeddata', loadHandler);
        video.addEventListener('error', errorHandler);
        video.addEventListener('canplay', canplayHandler);
        
        // Store handlers for cleanup
        this.eventHandlers.set(videoId, {
            loadeddata: loadHandler,
            error: errorHandler,
            canplay: canplayHandler
        });
        
        // Intersection Observer for performance
        this.setupIntersectionObserver(video);
        
        // Retry logic for failed loads
        if (this.state.failedVideos.has(videoId)) {
            const retryCount = this.state.retryCount.get(videoId) || 0;
            if (retryCount < this.config.maxRetries) {
                setTimeout(() => {
                    video.load();
                    this.state.retryCount.set(videoId, retryCount + 1);
                }, 1000 * (retryCount + 1));
            }
        }
    }
    
    setupIntersectionObserver(video) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Video is visible, ensure it's playing
                    if (video.paused && !this.state.isLowPerformance) {
                        video.play().catch(err => {
                            console.warn('Video autoplay failed:', err);
                        });
                    }
                } else {
                    // Video is not visible, pause to save resources
                    if (!video.paused) {
                        video.pause();
                    }
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.1
        });
        
        observer.observe(video);
        this.videoObservers.set(video.getAttribute('data-video-id'), observer);
    }
    
    handleVideoLoad(video, videoId) {
        console.log(`✅ Video ${videoId} loaded successfully`);
        
        // Apply fade-in animation
        video.style.opacity = '0';
        video.style.transition = 'opacity 0.8s ease';
        
        requestAnimationFrame(() => {
            video.style.opacity = '';
        });
        
        // Start playback
        video.play().catch(err => {
            console.warn('Video autoplay blocked:', err);
            // Show play button or handle autoplay restrictions
            this.handleAutoplayBlocked(video);
        });
    }
    
    handleVideoError(video, reason) {
        const videoId = video.getAttribute('data-video-id');
        console.error(`❌ Video ${videoId} failed to load:`, reason);
        
        this.state.failedVideos.add(videoId);
        this.showFallback(video);
        
        // Try alternative source or retry logic
        const retryCount = this.state.retryCount.get(videoId) || 0;
        if (retryCount < this.config.maxRetries && reason !== 'timeout') {
            console.log(`🔄 Retrying video ${videoId} (${retryCount + 1}/${this.config.maxRetries})`);
            this.state.retryCount.set(videoId, retryCount + 1);
            
            const retryTimeout = setTimeout(() => {
                video.load();
                this.timeouts.delete(retryTimeout);
            }, 2000 * (retryCount + 1));
            this.timeouts.add(retryTimeout);
        }
    }
    
    showFallback(video) {
        // Hide video and show static background
        video.style.display = 'none';
        
        // Ensure fallback is visible
        const container = video.closest('.video-background-container, .device-selector-video-bg, .device-emulator-video-bg');
        if (container) {
            const fallback = container.querySelector('.video-fallback-background');
            if (fallback) {
                fallback.style.opacity = '1';
            } else {
                // Create fallback element
                this.createFallbackElement(container);
            }
        }
    }
    
    createFallbackElement(container) {
        const fallback = document.createElement('div');
        fallback.className = 'video-fallback-background';
        fallback.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: radial-gradient(ellipse at center, 
                rgba(16, 0, 43, 0.9) 0%,
                rgba(10, 0, 32, 0.95) 35%,
                rgba(5, 0, 20, 1) 100%);
            z-index: -1;
            opacity: 1;
        `;
        container.appendChild(fallback);
    }
    
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const checkPerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= this.config.performanceCheckInterval) {
                const fps = frameCount / ((currentTime - lastTime) / 1000);
                frameCount = 0;
                lastTime = currentTime;
                
                if (fps < this.config.minFPS && !this.state.isLowPerformance) {
                    console.warn(`🐌 Low FPS detected: ${fps.toFixed(1)}`);
                    this.degradePerformance();
                }
            }
            
            if (!this.state.isLowPerformance) {
                requestAnimationFrame(checkPerformance);
            }
        };
        
        // Start monitoring after videos load
        setTimeout(() => {
            if (this.state.videosLoaded.size > 0) {
                requestAnimationFrame(checkPerformance);
            }
        }, 3000);
    }
    
    degradePerformance() {
        console.log('🔧 Degrading performance for better UX');
        this.state.isLowPerformance = true;
        
        // Reduce video quality
        const videos = document.querySelectorAll('.background-video-layer, .cosmic-video-background');
        videos.forEach(video => {
            video.style.filter += ' blur(1px)';
            video.style.opacity = '0.15';
        });
        
        // Add performance class
        document.body.classList.add('performance-degraded');
    }
    
    setupNetworkMonitoring() {
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.handleNetworkChange();
            });
        }
        
        // Monitor for visibility changes
        document.addEventListener('visibilitychange', () => {
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                if (document.hidden) {
                    video.pause();
                } else if (this.state.videosLoaded.has(video.getAttribute('data-video-id'))) {
                    video.play().catch(() => {
                        // Handle autoplay restrictions
                    });
                }
            });
        });
    }
    
    handleNetworkChange() {
        const connection = navigator.connection;
        const wasLowQuality = this.state.networkQuality === 'low';
        
        // Update network quality
        if (connection.effectiveType === '4g' && connection.downlink > 5) {
            this.state.networkQuality = 'high';
        } else if (connection.effectiveType === '3g' || connection.downlink > 1.5) {
            this.state.networkQuality = 'medium';
        } else {
            this.state.networkQuality = 'low';
        }
        
        console.log(`📶 Network changed to: ${this.state.networkQuality}`);
        
        // Handle quality changes
        if (this.state.networkQuality === 'low' && !wasLowQuality) {
            this.disableVideos('Network degradation');
        } else if (this.state.networkQuality !== 'low' && wasLowQuality) {
            // Re-enable videos after network improvement
            setTimeout(() => {
                this.enableVideos();
            }, this.config.networkCheckDelay);
        }
        
        // Update quality classes
        document.body.className = document.body.className.replace(/video-quality-\w+/g, '');
        document.body.classList.add(`video-quality-${this.state.networkQuality}`);
    }
    
    disableVideos(reason) {
        console.log(`🚫 Disabling videos: ${reason}`);
        
        const videos = document.querySelectorAll('.background-video-layer, .cosmic-video-background');
        videos.forEach(video => {
            video.pause();
            this.showFallback(video);
        });
    }
    
    enableVideos() {
        console.log('✅ Re-enabling videos');
        
        const videos = document.querySelectorAll('.background-video-layer, .cosmic-video-background');
        videos.forEach(video => {
            if (this.state.videosLoaded.has(video.getAttribute('data-video-id'))) {
                video.style.display = '';
                video.play().catch(() => {
                    this.handleAutoplayBlocked(video);
                });
            }
        });
    }
    
    handleAutoplayBlocked(video) {
        // Create user-initiated play mechanism
        const playButton = document.createElement('button');
        playButton.innerHTML = '▶️ Enable Background Video';
        playButton.className = 'video-play-prompt btn-cosmic';
        playButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            background: rgba(107, 70, 193, 0.9);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        playButton.addEventListener('click', () => {
            video.play();
            playButton.remove();
        });
        
        document.body.appendChild(playButton);
        
        // Auto-remove after 10 seconds
        const removeTimeout = setTimeout(() => {
            if (playButton.parentNode) {
                playButton.remove();
            }
            this.timeouts.delete(removeTimeout);
        }, 10000);
        this.timeouts.add(removeTimeout);
    }
    
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            if (event.target.tagName === 'VIDEO') {
                this.handleVideoError(event.target, 'runtime_error');
            }
        });
        
        // Global error recovery
        window.addEventListener('beforeunload', () => {
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                video.pause();
                video.src = '';
            });
        });
    }
}

// Initialize when script loads with cleanup support
let videoOptimizer = null;

if (!window.videoOptimizer) {
    videoOptimizer = new VerridianVideoOptimizer();
    
    // Add cleanup method
    videoOptimizer.destroy = function() {
        // Clear all timeouts
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts.clear();
        
        // Disconnect all observers
        this.videoObservers.forEach(observer => observer.disconnect());
        this.videoObservers.clear();
        
        // Remove all event listeners
        this.eventHandlers.forEach((handlers, videoId) => {
            const video = document.querySelector(`[data-video-id="${videoId}"]`);
            if (video) {
                Object.entries(handlers).forEach(([event, handler]) => {
                    video.removeEventListener(event, handler);
                });
            }
        });
        this.eventHandlers.clear();
        
        // Clear state
        this.state.videosLoaded.clear();
        this.state.failedVideos.clear();
        this.state.retryCount.clear();
    };
} else {
    videoOptimizer = window.videoOptimizer;
}

// Export for manual control if needed
window.VerridianVideoOptimizer = VerridianVideoOptimizer;
window.videoOptimizer = videoOptimizer;