/**
 * Verridian AI - Advanced Cosmic Particle System
 * Premium WebGL/Canvas particle effects with orbital mechanics
 */

class CosmicParticleSystem {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.orbitals = [];
    this.nebulaClouds = [];
    this.comets = [];
    this.energyRings = [];
    
    this.options = {
      particleCount: options.particleCount || 150,
      orbitalCount: options.orbitalCount || 3,
      nebulaCount: options.nebulaCount || 2,
      cometCount: options.cometCount || 1,
      colors: {
        primary: '#6B46C1',
        secondary: '#2563EB',
        accent: '#EC4899',
        gold: '#F59E0B',
        white: '#FFFFFF'
      },
      ...options
    };

    this.time = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isInitialized = false;
    
    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.createOrbitals();
    this.createNebulaClouds();
    this.createComets();
    this.createEnergyRings();
    this.bindEvents();
    this.isInitialized = true;
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: this.getRandomColor(),
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        glowIntensity: Math.random() * 0.5 + 0.5,
        type: Math.random() > 0.8 ? 'star' : 'particle'
      });
    }
  }

  createOrbitals() {
    const orbitalColors = [this.options.colors.primary, this.options.colors.secondary, this.options.colors.accent];
    
    for (let i = 0; i < this.options.orbitalCount; i++) {
      this.orbitals.push({
        radius: 100 + i * 80,
        angle: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.002,
        tilt: Math.random() * 0.5 - 0.25,
        opacity: 0.3 + Math.random() * 0.3,
        color: orbitalColors[i % orbitalColors.length],
        particles: this.createOrbitalParticles(8 + i * 3)
      });
    }
  }

  createOrbitalParticles(count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        angle: (Math.PI * 2 / count) * i,
        speed: 0.02 + Math.random() * 0.01,
        size: Math.random() * 4 + 2,
        distance: Math.random() * 20 - 10,
        glow: Math.random() * 0.5 + 0.5
      });
    }
    return particles;
  }

  createNebulaClouds() {
    for (let i = 0; i < this.options.nebulaCount; i++) {
      this.nebulaClouds.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: 150 + Math.random() * 100,
        density: Math.random() * 0.3 + 0.1,
        color: i % 2 === 0 ? this.options.colors.primary : this.options.colors.accent,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        pulsePhase: Math.random() * Math.PI * 2,
        particles: this.createNebulaParticles(30)
      });
    }
  }

  createNebulaParticles(count) {
    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100;
      particles.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5
      });
    }
    return particles;
  }

  createComets() {
    for (let i = 0; i < this.options.cometCount; i++) {
      this.comets.push({
        x: -100,
        y: Math.random() * this.canvas.height,
        vx: 2 + Math.random() * 3,
        vy: (Math.random() - 0.5) * 2,
        size: 4 + Math.random() * 3,
        tailLength: 50 + Math.random() * 50,
        tailParticles: [],
        lastSpawn: Date.now(),
        spawnInterval: 3000 + Math.random() * 5000
      });
    }
  }

  createEnergyRings() {
    this.energyRings.push({
      x: this.centerX,
      y: this.centerY,
      radius: 0,
      maxRadius: Math.min(this.canvas.width, this.canvas.height) * 0.8,
      speed: 2,
      opacity: 1,
      color: this.options.colors.gold,
      active: false,
      lastPulse: Date.now(),
      pulseInterval: 5000
    });
  }

  getRandomColor() {
    const colors = Object.values(this.options.colors);
    return colors[Math.floor(Math.random() * colors.length)];
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    this.canvas.addEventListener('click', (e) => {
      this.createEnergyPulse(e.clientX, e.clientY);
    });
  }

  createEnergyPulse(x, y) {
    const ring = this.energyRings.find(r => !r.active);
    if (ring) {
      ring.x = x;
      ring.y = y;
      ring.radius = 0;
      ring.opacity = 1;
      ring.active = true;
    } else {
      this.energyRings.push({
        x, y,
        radius: 0,
        maxRadius: 200,
        speed: 2,
        opacity: 1,
        color: this.options.colors.accent,
        active: true
      });
    }
  }

  updateParticles() {
    this.particles.forEach(particle => {
      // 3D movement simulation
      particle.z += particle.vz;
      if (particle.z > 1000 || particle.z < 0) {
        particle.z = Math.random() * 1000;
        particle.x = Math.random() * this.canvas.width;
        particle.y = Math.random() * this.canvas.height;
      }

      // Parallax effect based on Z depth
      const parallaxFactor = particle.z / 1000;
      particle.x += particle.vx * (1 - parallaxFactor);
      particle.y += particle.vy * (1 - parallaxFactor);

      // Wrap around screen
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Pulse effect
      particle.pulsePhase += particle.pulseSpeed;
      particle.glowIntensity = 0.5 + Math.sin(particle.pulsePhase) * 0.5;

      // Mouse interaction
      const dx = this.mouseX - particle.x;
      const dy = this.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.05;
        particle.vy += (dy / distance) * force * 0.05;
      }

      // Damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
    });
  }

  updateOrbitals() {
    this.orbitals.forEach(orbital => {
      orbital.angle += orbital.speed;
      
      orbital.particles.forEach(particle => {
        particle.angle += particle.speed;
      });
    });
  }

  updateNebulaClouds() {
    this.nebulaClouds.forEach(cloud => {
      cloud.rotation += cloud.rotationSpeed;
      cloud.pulsePhase += 0.01;
      cloud.density = 0.1 + Math.sin(cloud.pulsePhase) * 0.05;
      
      // Slow drift
      cloud.x += Math.sin(this.time * 0.001) * 0.2;
      cloud.y += Math.cos(this.time * 0.001) * 0.1;
    });
  }

  updateComets() {
    const now = Date.now();
    
    this.comets.forEach(comet => {
      if (comet.x > this.canvas.width + 100) {
        if (now - comet.lastSpawn > comet.spawnInterval) {
          comet.x = -100;
          comet.y = Math.random() * this.canvas.height;
          comet.vx = 2 + Math.random() * 3;
          comet.vy = (Math.random() - 0.5) * 2;
          comet.tailParticles = [];
          comet.lastSpawn = now;
        }
      } else {
        comet.x += comet.vx;
        comet.y += comet.vy;
        
        // Add tail particles
        if (Math.random() > 0.3) {
          comet.tailParticles.push({
            x: comet.x,
            y: comet.y,
            vx: -comet.vx * 0.2 + (Math.random() - 0.5) * 0.5,
            vy: -comet.vy * 0.2 + (Math.random() - 0.5) * 0.5,
            life: 1,
            size: comet.size * 0.5
          });
        }
        
        // Update tail particles
        comet.tailParticles = comet.tailParticles.filter(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
          return p.life > 0;
        });
      }
    });
  }

  updateEnergyRings() {
    const now = Date.now();
    
    this.energyRings.forEach(ring => {
      if (ring.active) {
        ring.radius += ring.speed;
        ring.opacity = 1 - (ring.radius / ring.maxRadius);
        
        if (ring.radius >= ring.maxRadius) {
          ring.active = false;
          ring.lastPulse = now;
        }
      } else if (now - ring.lastPulse > ring.pulseInterval) {
        ring.x = this.centerX;
        ring.y = this.centerY;
        ring.radius = 0;
        ring.opacity = 1;
        ring.active = true;
      }
    });
  }

  drawParticle(particle) {
    const { ctx } = this;
    const depth = particle.z / 1000;
    const scale = 1 - depth * 0.5;
    const size = particle.size * scale;
    const opacity = particle.glowIntensity * (1 - depth * 0.3);

    ctx.save();
    
    if (particle.type === 'star') {
      // Draw star with glow
      ctx.shadowBlur = size * 3;
      ctx.shadowColor = particle.color;
      
      ctx.fillStyle = this.options.colors.white;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Star rays
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = opacity * 0.5;
      for (let i = 0; i < 4; i++) {
        const angle = (Math.PI / 2) * i + particle.pulsePhase;
        ctx.beginPath();
        ctx.moveTo(
          particle.x + Math.cos(angle) * size,
          particle.y + Math.sin(angle) * size
        );
        ctx.lineTo(
          particle.x + Math.cos(angle) * size * 3,
          particle.y + Math.sin(angle) * size * 3
        );
        ctx.stroke();
      }
    } else {
      // Regular particle with gradient
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, size
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.5, particle.color + '88');
      gradient.addColorStop(1, particle.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = opacity;
      ctx.fillRect(particle.x - size, particle.y - size, size * 2, size * 2);
    }
    
    ctx.restore();
  }

  drawOrbital(orbital) {
    const { ctx } = this;
    
    ctx.save();
    ctx.translate(this.centerX, this.centerY);
    ctx.rotate(orbital.angle);
    
    // Draw orbital ring
    ctx.strokeStyle = orbital.color + '33';
    ctx.lineWidth = 2;
    ctx.globalAlpha = orbital.opacity;
    ctx.beginPath();
    ctx.ellipse(0, 0, orbital.radius, orbital.radius * (1 + orbital.tilt), 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw orbital particles
    orbital.particles.forEach(particle => {
      const px = Math.cos(particle.angle) * (orbital.radius + particle.distance);
      const py = Math.sin(particle.angle) * (orbital.radius * (1 + orbital.tilt) + particle.distance);
      
      ctx.shadowBlur = particle.size * 2;
      ctx.shadowColor = orbital.color;
      ctx.fillStyle = this.options.colors.white;
      ctx.globalAlpha = particle.glow;
      ctx.beginPath();
      ctx.arc(px, py, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }

  drawNebulaCloud(cloud) {
    const { ctx } = this;
    
    ctx.save();
    ctx.translate(cloud.x, cloud.y);
    ctx.rotate(cloud.rotation);
    
    // Draw nebula gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.radius);
    gradient.addColorStop(0, cloud.color + '44');
    gradient.addColorStop(0.5, cloud.color + '22');
    gradient.addColorStop(1, cloud.color + '00');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = cloud.density;
    ctx.fillRect(-cloud.radius, -cloud.radius, cloud.radius * 2, cloud.radius * 2);
    
    // Draw nebula particles
    cloud.particles.forEach(particle => {
      ctx.fillStyle = this.options.colors.white;
      ctx.globalAlpha = particle.opacity * cloud.density;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();
  }

  drawComet(comet) {
    const { ctx } = this;
    
    if (comet.x > -100 && comet.x < this.canvas.width + 100) {
      // Draw comet tail
      comet.tailParticles.forEach(particle => {
        ctx.fillStyle = this.options.colors.gold;
        ctx.globalAlpha = particle.life * 0.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw comet head
      ctx.save();
      ctx.shadowBlur = comet.size * 4;
      ctx.shadowColor = this.options.colors.gold;
      ctx.fillStyle = this.options.colors.white;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(comet.x, comet.y, comet.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawEnergyRing(ring) {
    if (!ring.active) return;
    
    const { ctx } = this;
    
    ctx.save();
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = ring.opacity;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ring.color;
    
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner ring
    ctx.globalAlpha = ring.opacity * 0.5;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }

  draw() {
    const { ctx } = this;
    
    // Clear with fade effect for trails
    ctx.fillStyle = 'rgba(10, 0, 32, 0.1)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw layers in order
    this.nebulaClouds.forEach(cloud => this.drawNebulaCloud(cloud));
    this.orbitals.forEach(orbital => this.drawOrbital(orbital));
    this.particles.forEach(particle => this.drawParticle(particle));
    this.comets.forEach(comet => this.drawComet(comet));
    this.energyRings.forEach(ring => this.drawEnergyRing(ring));
  }

  animate() {
    if (!this.isInitialized) return;
    
    this.time++;
    
    this.updateParticles();
    this.updateOrbitals();
    this.updateNebulaClouds();
    this.updateComets();
    this.updateEnergyRings();
    
    this.draw();
    
    requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.isInitialized = false;
    this.particles = [];
    this.orbitals = [];
    this.nebulaClouds = [];
    this.comets = [];
    this.energyRings = [];
  }
}

// Auto-initialize on DOM ready
if (typeof window !== 'undefined') {
  window.CosmicParticleSystem = CosmicParticleSystem;
  
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('cosmic-canvas');
    if (canvas) {
      window.cosmicSystem = new CosmicParticleSystem(canvas, {
        particleCount: 200,
        orbitalCount: 3,
        nebulaCount: 2,
        cometCount: 2
      });
    }
  });
}