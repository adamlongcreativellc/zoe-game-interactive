/**
 * Confetti particle celebration system using a 2D canvas overlay.
 */
export class Celebration {
  constructor() {
    this.canvas = document.getElementById('confetti-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animating = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Launch a burst of confetti for correct answers.
   */
  burstSmall(x, y) {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#45b7d1', '#a78bfa', '#f472b6', '#ffa06b'];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: x || this.canvas.width / 2,
        y: y || this.canvas.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6,
        life: 1,
        decay: 0.015 + Math.random() * 0.01,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
    if (!this.animating) this.animate();
  }

  /**
   * Big celebration for winning.
   */
  burstBig() {
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#45b7d1', '#a78bfa', '#f472b6', '#ffa06b', '#fff'];
    // Multiple bursts from different positions
    for (let burst = 0; burst < 5; burst++) {
      setTimeout(() => {
        const bx = Math.random() * this.canvas.width;
        const by = this.canvas.height * 0.3 + Math.random() * this.canvas.height * 0.3;
        for (let i = 0; i < 50; i++) {
          const angle = (Math.PI * 2 * i) / 50 + Math.random() * 0.5;
          const speed = 3 + Math.random() * 6;
          this.particles.push({
            x: bx,
            y: by,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 5 + Math.random() * 8,
            life: 1,
            decay: 0.008 + Math.random() * 0.008,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.3,
            shape: Math.random() > 0.3 ? 'rect' : 'circle',
          });
        }
        if (!this.animating) this.animate();
      }, burst * 200);
    }
  }

  animate() {
    this.animating = true;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.life -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.life;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      requestAnimationFrame(() => this.animate());
    } else {
      this.animating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
