/**
 * Verridian AI Motion System
 * Production-ready animation library with 60fps target
 * Version: 1.0.0
 * 
 * Implements Framer Motion-like animations with:
 * - Spring physics
 * - Gesture recognition
 * - Layout animations
 * - Reduced motion support
 * - Performance monitoring
 */

class VerridianMotion {
  constructor() {
    // Animation configuration
    this.config = {
      fps: 60,
      frameTime: 1000 / 60,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      gpu: true,
      monitoring: false
    };

    // Spring presets matching design system
    this.springs = {
      gentle: { stiffness: 100, damping: 15, mass: 1 },
      snappy: { stiffness: 300, damping: 25, mass: 0.8 },
      bouncy: { stiffness: 400, damping: 10, mass: 0.5 },
      stiff: { stiffness: 500, damping: 30, mass: 1.2 },
      smooth: { stiffness: 200, damping: 20, mass: 1 }
    };

    // Easing curves
    this.easings = {
      linear: t => t,
      easeIn: t => t * t,
      easeOut: t => t * (2 - t),
      easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => (--t) * t * t + 1,
      easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
      easeInQuart: t => t * t * t * t,
      easeOutQuart: t => 1 - (--t) * t * t * t,
      easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
      easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
      easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
      bounce: t => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        else return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    };

    // Active animations tracking
    this.animations = new Map();
    this.frameId = null;
    this.performanceMetrics = {
      fps: 60,
      frameTime: 0,
      droppedFrames: 0,
      lastTime: performance.now()
    };

    // Initialize
    this.init();
  }

  init() {
    // Start animation loop
    this.startLoop();

    // Setup performance monitoring
    if (this.config.monitoring) {
      this.startPerformanceMonitoring();
    }

    // Handle reduced motion preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.config.reducedMotion = e.matches;
    });
  }

  /**
   * Animate element with spring physics
   */
  spring(element, properties, options = {}) {
    if (this.config.reducedMotion && !options.force) {
      // Apply final state immediately for reduced motion
      Object.assign(element.style, this.formatProperties(properties));
      return Promise.resolve();
    }

    const id = this.generateId();
    const config = { ...this.springs.smooth, ...options.spring };
    const duration = options.duration || this.calculateSpringDuration(config);
    
    // Get initial values
    const initial = this.getInitialValues(element, properties);
    const target = properties;
    
    // Create animation object
    const animation = {
      element,
      initial,
      target,
      current: { ...initial },
      velocity: {},
      config,
      duration,
      startTime: performance.now(),
      options,
      type: 'spring',
      promise: null
    };

    // Initialize velocities
    Object.keys(target).forEach(key => {
      animation.velocity[key] = 0;
    });

    // Create promise for animation completion
    animation.promise = new Promise(resolve => {
      animation.resolve = resolve;
    });

    // Add to active animations
    this.animations.set(id, animation);

    return animation.promise;
  }

  /**
   * Animate with duration-based timing
   */
  animate(element, properties, options = {}) {
    if (this.config.reducedMotion && !options.force) {
      Object.assign(element.style, this.formatProperties(properties));
      return Promise.resolve();
    }

    const id = this.generateId();
    const duration = options.duration || 300;
    const easing = this.easings[options.easing || 'easeInOut'];
    
    const initial = this.getInitialValues(element, properties);
    
    const animation = {
      element,
      initial,
      target: properties,
      current: { ...initial },
      duration,
      easing,
      startTime: performance.now(),
      options,
      type: 'tween',
      promise: null
    };

    animation.promise = new Promise(resolve => {
      animation.resolve = resolve;
    });

    this.animations.set(id, animation);

    return animation.promise;
  }

  /**
   * Gesture animations (hover, tap, drag)
   */
  gesture(element, gestures = {}) {
    const handlers = {};

    // Hover animation
    if (gestures.hover) {
      handlers.mouseenter = () => this.spring(element, gestures.hover, { spring: this.springs.snappy });
      handlers.mouseleave = () => this.spring(element, gestures.initial || {}, { spring: this.springs.snappy });
    }

    // Tap animation
    if (gestures.tap) {
      handlers.mousedown = () => this.spring(element, gestures.tap, { spring: this.springs.stiff });
      handlers.mouseup = () => this.spring(element, gestures.initial || {}, { spring: this.springs.stiff });
    }

    // Focus animation
    if (gestures.focus) {
      handlers.focus = () => this.spring(element, gestures.focus, { spring: this.springs.gentle });
      handlers.blur = () => this.spring(element, gestures.initial || {}, { spring: this.springs.gentle });
    }

    // Add event listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      element.addEventListener(event, handler);
    });

    // Return cleanup function
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        element.removeEventListener(event, handler);
      });
    };
  }

  /**
   * Stagger animations for child elements
   */
  stagger(parent, childSelector, properties, options = {}) {
    const children = parent.querySelectorAll(childSelector);
    const staggerDelay = options.staggerDelay || 50;
    const promises = [];

    children.forEach((child, index) => {
      const delay = index * staggerDelay;
      const childOptions = { ...options, delay };
      
      const promise = new Promise(resolve => {
        setTimeout(() => {
          this.spring(child, properties, childOptions).then(resolve);
        }, delay);
      });
      
      promises.push(promise);
    });

    return Promise.all(promises);
  }

  /**
   * Layout animation for position/size changes
   */
  layout(element, callback) {
    // Get initial position
    const initial = element.getBoundingClientRect();
    
    // Execute callback that changes layout
    callback();
    
    // Get final position
    const final = element.getBoundingClientRect();
    
    // Calculate delta
    const deltaX = initial.left - final.left;
    const deltaY = initial.top - final.top;
    const deltaW = initial.width / final.width;
    const deltaH = initial.height / final.height;
    
    // Apply inverse transform
    element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
    element.style.transformOrigin = 'top left';
    
    // Force reflow
    element.offsetHeight;
    
    // Animate to identity transform
    return this.spring(element, {
      transform: 'none'
    }, {
      spring: this.springs.smooth
    });
  }

  /**
   * Animation loop
   */
  startLoop() {
    const loop = (currentTime) => {
      // Calculate frame metrics
      const deltaTime = currentTime - this.performanceMetrics.lastTime;
      this.performanceMetrics.lastTime = currentTime;
      this.performanceMetrics.frameTime = deltaTime;
      this.performanceMetrics.fps = 1000 / deltaTime;

      // Check for dropped frames
      if (deltaTime > this.config.frameTime * 1.5) {
        this.performanceMetrics.droppedFrames++;
      }

      // Update all active animations
      for (const [id, animation] of this.animations) {
        const complete = this.updateAnimation(animation, currentTime);
        
        if (complete) {
          animation.resolve();
          this.animations.delete(id);
        }
      }

      // Continue loop if animations exist
      if (this.animations.size > 0) {
        this.frameId = requestAnimationFrame(loop);
      } else {
        this.frameId = null;
      }
    };

    // Start loop if not already running
    if (!this.frameId && this.animations.size > 0) {
      this.frameId = requestAnimationFrame(loop);
    }
  }

  /**
   * Update single animation
   */
  updateAnimation(animation, currentTime) {
    const elapsed = currentTime - animation.startTime;
    
    if (animation.type === 'spring') {
      return this.updateSpring(animation, elapsed);
    } else {
      return this.updateTween(animation, elapsed);
    }
  }

  /**
   * Spring physics calculation
   */
  updateSpring(animation, elapsed) {
    const { config, target, current, velocity, element } = animation;
    let complete = true;

    Object.keys(target).forEach(key => {
      const targetValue = this.parseValue(target[key]);
      const currentValue = this.parseValue(current[key]);
      
      // Spring physics
      const distance = targetValue - currentValue;
      const springForce = distance * config.stiffness;
      const dampingForce = velocity[key] * config.damping;
      const acceleration = (springForce - dampingForce) / config.mass;
      
      // Update velocity and position
      velocity[key] += acceleration * (this.config.frameTime / 1000);
      current[key] = currentValue + velocity[key] * (this.config.frameTime / 1000);
      
      // Check if animation is complete
      if (Math.abs(velocity[key]) > 0.01 || Math.abs(distance) > 0.01) {
        complete = false;
      }
    });

    // Apply current values to element
    this.applyProperties(element, current);

    // Snap to final values if complete
    if (complete) {
      this.applyProperties(element, target);
    }

    return complete;
  }

  /**
   * Tween animation update
   */
  updateTween(animation, elapsed) {
    const { duration, easing, initial, target, element } = animation;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    
    const current = {};
    Object.keys(target).forEach(key => {
      const initialValue = this.parseValue(initial[key]);
      const targetValue = this.parseValue(target[key]);
      current[key] = initialValue + (targetValue - initialValue) * easedProgress;
    });
    
    this.applyProperties(element, current);
    
    return progress >= 1;
  }

  /**
   * Helper methods
   */
  getInitialValues(element, properties) {
    const computed = window.getComputedStyle(element);
    const initial = {};
    
    Object.keys(properties).forEach(key => {
      if (key === 'transform') {
        initial[key] = computed.transform === 'none' ? 'translate(0, 0)' : computed.transform;
      } else if (key === 'scale') {
        initial[key] = 1;
      } else if (key === 'opacity') {
        initial[key] = parseFloat(computed.opacity) || 1;
      } else {
        initial[key] = computed[key] || 0;
      }
    });
    
    return initial;
  }

  applyProperties(element, properties) {
    const formatted = this.formatProperties(properties);
    
    Object.entries(formatted).forEach(([key, value]) => {
      if (key === 'scale') {
        element.style.transform = `scale(${value})`;
      } else {
        element.style[key] = value;
      }
    });

    // Force GPU acceleration for transforms
    if (this.config.gpu && (properties.transform || properties.scale)) {
      element.style.willChange = 'transform';
      element.style.transform += ' translateZ(0)';
    }
  }

  formatProperties(properties) {
    const formatted = {};
    
    Object.entries(properties).forEach(([key, value]) => {
      if (typeof value === 'number') {
        if (key === 'opacity' || key === 'scale') {
          formatted[key] = value;
        } else {
          formatted[key] = `${value}px`;
        }
      } else {
        formatted[key] = value;
      }
    });
    
    return formatted;
  }

  parseValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  calculateSpringDuration(config) {
    // Estimate spring settling time
    const damping = config.damping;
    const stiffness = config.stiffness;
    const mass = config.mass || 1;
    
    const dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
    
    if (dampingRatio < 1) {
      // Underdamped
      return 4000 / Math.sqrt(stiffness);
    } else {
      // Critically damped or overdamped
      return 6000 / stiffness;
    }
  }

  generateId() {
    return `motion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Performance monitoring
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      if (this.animations.size > 0) {
        console.log(`Motion Performance: ${Math.round(this.performanceMetrics.fps)} FPS | Dropped Frames: ${this.performanceMetrics.droppedFrames}`);
        
        // Reset dropped frames counter
        if (this.performanceMetrics.droppedFrames > 10) {
          console.warn('Performance degradation detected. Consider reducing animation complexity.');
        }
      }
    }, 1000);
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.animations.clear();
  }
}

// Initialize global instance
window.VerridianMotion = new VerridianMotion();