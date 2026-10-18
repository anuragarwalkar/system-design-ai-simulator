/**
 * ==============================================================================
 * Particle System (Object Pool Pattern)
 * ==============================================================================
 * High-performance particle animation for simulated network traffic.
 * Uses a pre-allocated object pool to prevent garbage collection pauses,
 * ensuring silky-smooth 60FPS animation even with thousands of packets.
 */

export class Particle {
  constructor() {
    this.active = false;
    this.edgeId = null;
    this.progress = 0; // 0.0 to 1.0 along the Bezier curve
    this.speed = 0.01;
    this.color = '#10B981'; // Green (success) or #EF4444 Red (dropped/error)
    this.size = 3.5;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.cp1X = 0;
    this.cp1Y = 0;
    this.cp2X = 0;
    this.cp2Y = 0;
  }

  reset() {
    this.active = false;
    this.edgeId = null;
    this.progress = 0;
  }
}

export class ParticlePool {
  constructor(maxParticles = 500) {
    this.pool = Array.from({ length: maxParticles }, () => new Particle());
    this.activeCount = 0;
    this.spawnTimer = 0;
  }

  /**
   * Spawn a new packet along an edge curve
   * @param {Object} params - { edgeId, startX, startY, endX, endY, cp1X, cp1Y, cp2X, cp2Y, isError, speed }
   */
  spawn(params) {
    const particle = this.pool.find(p => !p.active);
    if (!particle) return; // Pool full, gracefully skip to protect frame rate

    particle.active = true;
    particle.edgeId = params.edgeId;
    particle.progress = 0;
    particle.speed = params.speed || 0.012 + Math.random() * 0.006;
    particle.color = params.isError ? '#EF4444' : '#10B981';
    particle.size = params.isError ? 4.0 : 3.0;

    particle.startX = params.startX;
    particle.startY = params.startY;
    particle.endX = params.endX;
    particle.endY = params.endY;
    particle.cp1X = params.cp1X;
    particle.cp1Y = params.cp1Y;
    particle.cp2X = params.cp2X;
    particle.cp2Y = params.cp2Y;

    this.activeCount++;
  }

  /**
   * Update particle positions along Bezier curve
   * @param {number} deltaMs
   */
  update(deltaMs) {
    const timeScale = Math.min(2.0, deltaMs / 16.6); // normalize against 60fps frame time

    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.progress += p.speed * timeScale;
      if (p.progress >= 1.0) {
        p.active = false;
        this.activeCount--;
      }
    }
  }

  /**
   * Render all active particles to canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    for (let i = 0; i < this.pool.length; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      // Evaluate cubic Bezier at t = p.progress
      const t = p.progress;
      const oneMinusT = 1 - t;

      const x =
        Math.pow(oneMinusT, 3) * p.startX +
        3 * Math.pow(oneMinusT, 2) * t * p.cp1X +
        3 * oneMinusT * Math.pow(t, 2) * p.cp2X +
        Math.pow(t, 3) * p.endX;

      const y =
        Math.pow(oneMinusT, 3) * p.startY +
        3 * Math.pow(oneMinusT, 2) * t * p.cp1Y +
        3 * oneMinusT * Math.pow(t, 2) * p.cp2Y +
        Math.pow(t, 3) * p.endY;

      // Draw glowing particle
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  }

  clear() {
    for (const p of this.pool) {
      p.reset();
    }
    this.activeCount = 0;
  }
}
