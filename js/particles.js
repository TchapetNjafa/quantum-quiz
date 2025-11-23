/**
 * Animation de particules quantiques pour le fond
 */

class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 30; // Réduit de 50 à 30 pour meilleures performances
        this.connectionDistance = 120; // Réduit pour moins de connexions

        // Limiter le FPS pour économiser du CPU
        this.fps = 30;
        this.fpsInterval = 1000 / this.fps;
        this.then = Date.now();

        this.resize();
        this.init();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }

    update() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Rebond sur les bords
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Dessine les connexions (optimisé avec early exit)
        this.ctx.lineWidth = 0.5;
        const distanceSquared = this.connectionDistance * this.connectionDistance; // Éviter sqrt

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dSquared = dx * dx + dy * dy; // Plus rapide sans sqrt

                // Early exit si trop loin
                if (dSquared < distanceSquared) {
                    const distance = Math.sqrt(dSquared);
                    const opacity = (1 - distance / this.connectionDistance) * 0.15;
                    this.ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }

        // Dessine les particules (batch pour performance)
        this.ctx.fillStyle = 'rgba(124, 58, 237, 0.5)';
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Throttle FPS à 30 fps pour économiser CPU
        const now = Date.now();
        const elapsed = now - this.then;

        if (elapsed > this.fpsInterval) {
            this.then = now - (elapsed % this.fpsInterval);
            this.update();
            this.draw();
        }
    }
}

// Initialise les particules si le canvas existe
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        new ParticleSystem('particles-canvas');
    }
});

console.log('✅ particles.js chargé');
