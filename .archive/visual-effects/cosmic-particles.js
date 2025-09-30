/**
 * Verridian AI Cosmic Particles System
 * Creates dynamic particle animations for premium space aesthetic
 */

class CosmicParticles {
  constructor(options = {}) {
    this.options = {
      particleCount: options.particleCount || 50,
      colors: options.colors || ['#6B46C1', '#2563EB', '#EC4899', '#F59E0B'],
      maxSize: options.maxSize || 4,
      minSize: options.minSize || 1,
      speed: options.speed || 0.5,
      connectionDistance: options.connectionDistance || 150,
      mouseInteraction: options.mouseInteraction !== false,
      container: options.container || document.body
    };
    
    this.particles = [];
    this.mouse = { x: null, y: null };
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'cosmic-particles-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      opacity: 0.7;
    `;
    
    this.ctx = this.canvas.getContext('2d');
    this.options.container.appendChild(this.canvas);
    
    this.resize();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.options.speed,
        vy: (Math.random() - 0.5) * this.options.speed,
        size: Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize,
        color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
        opacity: Math.random() * 0.5 + 0.5,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
  }
  
  bindEvents() {
    // Store event handlers for cleanup
    this.resizeHandler = () => this.resize();
    this.mouseMoveHandler = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };
    this.mouseLeaveHandler = () => {
      this.mouse.x = null;
      this.mouse.y = null;
    };
    
    window.addEventListener('resize', this.resizeHandler);
    
    if (this.options.mouseInteraction) {
      document.addEventListener('mousemove', this.mouseMoveHandler);
      document.addEventListener('mouseleave', this.mouseLeaveHandler);
    }
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  updateParticles() {
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Pulse effect
      particle.pulsePhase += 0.02;
      particle.currentOpacity = particle.opacity * (0.5 + Math.sin(particle.pulsePhase) * 0.5);
      
      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx -= (dx / distance) * force * 0.02;
          particle.vy -= (dy / distance) * force * 0.02;
        }
      }
      
      // Damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Maintain minimum speed
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed < 0.1) {
        particle.vx = (Math.random() - 0.5) * this.options.speed;
        particle.vy = (Math.random() - 0.5) * this.options.speed;
      }
    });
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw connections
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.connectionDistance) {
          const opacity = (1 - distance / this.options.connectionDistance) * 0.3;
          
          // Create gradient for connection
          const gradient = this.ctx.createLinearGradient(
            this.particles[i].x, this.particles[i].y,
            this.particles[j].x, this.particles[j].y
          );
          gradient.addColorStop(0, this.particles[i].color);
          gradient.addColorStop(1, this.particles[j].color);
          
          this.ctx.strokeStyle = gradient;
          this.ctx.globalAlpha = opacity;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
    
    // Draw particles
    this.particles.forEach(particle => {
      // Glow effect
      const glowGradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 4
      );
      glowGradient.addColorStop(0, particle.color);
      glowGradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.globalAlpha = particle.currentOpacity * 0.3;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Core particle
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.currentOpacity;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.globalAlpha = 1;
  }
  
  animate() {
    this.updateParticles();
    this.drawParticles();
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    // Cancel animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Remove event listeners
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.mouseMoveHandler) {
      document.removeEventListener('mousemove', this.mouseMoveHandler);
    }
    if (this.mouseLeaveHandler) {
      document.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
    
    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    // Clear particles array
    this.particles = [];
    
    // Clear references
    this.canvas = null;
    this.ctx = null;
  }
}

// Orbital Path Animation for UI Elements
class OrbitalAnimation {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      radius: options.radius || 100,
      speed: options.speed || 0.01,
      centerX: options.centerX || 0,
      centerY: options.centerY || 0,
      startAngle: options.startAngle || 0
    };
    
    this.angle = this.options.startAngle;
    this.animationId = null;
    
    this.animate();
  }
  
  animate() {
    this.angle += this.options.speed;
    
    const x = this.options.centerX + Math.cos(this.angle) * this.options.radius;
    const y = this.options.centerY + Math.sin(this.angle) * this.options.radius;
    
    this.element.style.transform = `translate(${x}px, ${y}px)`;
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// Nebula Background Effect
class NebulaEffect {
  constructor(container) {
    this.container = container;
    this.nebulaElement = null;
    this.styleElements = [];
    this.init();
  }
  
  init() {
    const nebula = document.createElement('div');
    nebula.className = 'nebula-effect';
    nebula.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;
      pointer-events: none;
    `;
    
    // Create multiple nebula clouds
    for (let i = 0; i < 3; i++) {
      const cloud = document.createElement('div');
      cloud.style.cssText = `
        position: absolute;
        width: ${300 + i * 100}px;
        height: ${300 + i * 100}px;
        background: radial-gradient(circle, 
          rgba(107, 70, 193, ${0.3 - i * 0.1}) 0%, 
          transparent 70%);
        border-radius: 50%;
        filter: blur(${40 + i * 20}px);
        animation: nebula-float-${i} ${20 + i * 10}s ease-in-out infinite;
      `;
      
      // Add animation keyframes with tracking for cleanup
      const style = document.createElement('style');
      style.setAttribute('data-nebula-style', `nebula-${i}`);
      style.textContent = `
        @keyframes nebula-float-${i} {
          0%, 100% {
            transform: translate(${Math.random() * 100}%, ${Math.random() * 100}%) scale(1);
          }
          33% {
            transform: translate(${Math.random() * 100}%, ${Math.random() * 100}%) scale(1.2);
          }
          66% {
            transform: translate(${Math.random() * 100}%, ${Math.random() * 100}%) scale(0.8);
          }
        }
      `;
      document.head.appendChild(style);
      
      nebula.appendChild(cloud);
    }
    
    this.nebulaElement = nebula;
    this.container.appendChild(nebula);
  }
  
  destroy() {
    // Remove nebula element
    if (this.nebulaElement && this.nebulaElement.parentNode) {
      this.nebulaElement.parentNode.removeChild(this.nebulaElement);
    }
    
    // Remove style elements
    document.querySelectorAll('[data-nebula-style]').forEach(style => {
      style.remove();
    });
  }
}

// Initialize on DOM ready with cleanup support
document.addEventListener('DOMContentLoaded', () => {
  // Check if already initialized
  if (!window.cosmicParticles) {
    // Initialize cosmic particles
    window.cosmicParticles = new CosmicParticles({
      particleCount: 60,
      connectionDistance: 120,
      speed: 0.3
    });
  }
  
  // Add nebula effect to header
  const header = document.querySelector('.verridian-header');
  if (header) {
    new NebulaEffect(header);
  }
  
  // Add hover glow effect to buttons
  document.querySelectorAll('.btn-cosmic').forEach(button => {
    button.addEventListener('mouseenter', function(e) {
      const ripple = document.createElement('div');
      ripple.className = 'cosmic-ripple';
      ripple.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(236, 72, 153, 0.5), transparent);
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple-expand 0.6s ease-out forwards;
      `;
      
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
  
  // Add CSS for ripple animation if not exists
  if (!document.querySelector('#cosmic-animations')) {
    const style = document.createElement('style');
    style.id = 'cosmic-animations';
    style.textContent = `
      @keyframes ripple-expand {
        to {
          width: 200px;
          height: 200px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
});