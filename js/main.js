// Particle System & Floating Shapes Class
class ParticleSystem {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.shapes = [];
        this.particleCount = options.count || 40;
        this.color = options.color || '0, 200, 83'; // Default Green
        this.lineColor = options.lineColor || '255, 215, 0'; // Default Gold
        this.opacity = options.opacity || 0.6;
        this.showShapes = options.showShapes || false;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.init();
        this.animate(0);

        window.addEventListener('resize', this.throttle(() => this.init(), 200));
    }

    init() {
        if (!this.canvas) return;
        if (this.canvas.id === 'particle-canvas') {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        } else {
            const parent = this.canvas.parentElement;
            this.width = parent.offsetWidth;
            this.height = parent.offsetHeight;
        }

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }

        if (this.showShapes) {
            this.shapes = [];
            const shapeCount = Math.min(5, Math.floor(this.width / 300));
            for (let i = 0; i < shapeCount; i++) {
                this.shapes.push(this.createShape());
            }
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.2
        };
    }

    createShape() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 40 + 20,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.01,
            type: Math.floor(Math.random() * 3), // 0: Cube-ish, 1: Diamond, 2: Hexagon
            opacity: Math.random() * 0.1 + 0.05
        };
    }

    updateParticle(p) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;
        if (p.y < 0) p.y = this.height;
        if (p.y > this.height) p.y = 0;
    }

    updateShape(s) {
        s.x += s.speedX;
        s.y += s.speedY;
        s.rotation += s.rotationSpeed;
        if (s.x < -s.size) s.x = this.width + s.size;
        if (s.x > this.width + s.size) s.x = -s.size;
        if (s.y < -s.size) s.y = this.height + s.size;
        if (s.y > this.height + s.size) s.y = -s.size;
    }

    drawShape(s) {
        this.ctx.save();
        this.ctx.translate(s.x, s.y);
        this.ctx.rotate(s.rotation);
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(${this.lineColor}, ${s.opacity})`;
        this.ctx.lineWidth = 1;

        if (s.type === 0) { // Cube outline
            this.ctx.strokeRect(-s.size/2, -s.size/2, s.size, s.size);
            this.ctx.strokeRect(-s.size/3, -s.size/3, s.size, s.size);
            this.ctx.moveTo(-s.size/2, -s.size/2); this.ctx.lineTo(-s.size/3, -s.size/3);
            this.ctx.moveTo(s.size/2, -s.size/2); this.ctx.lineTo(2*s.size/3, -s.size/3);
            this.ctx.moveTo(-s.size/2, s.size/2); this.ctx.lineTo(-s.size/3, 2*s.size/3);
            this.ctx.moveTo(s.size/2, s.size/2); this.ctx.lineTo(2*s.size/3, 2*s.size/3);
        } else if (s.type === 1) { // Diamond
            this.ctx.moveTo(0, -s.size);
            this.ctx.lineTo(s.size/2, 0);
            this.ctx.lineTo(0, s.size);
            this.ctx.lineTo(-s.size/2, 0);
            this.ctx.closePath();
        } else { // Hexagon
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                this.ctx.lineTo(Math.cos(angle) * s.size/2, Math.sin(angle) * s.size/2);
            }
            this.ctx.closePath();
        }
        this.ctx.stroke();

        // Add a subtle glow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = `rgba(${this.lineColor}, 0.3)`;
        this.ctx.stroke();

        this.ctx.restore();
    }

    draw(currentTime) {
        if (!this.ctx || document.hidden) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Shapes first (background)
        if (this.showShapes) {
            this.shapes.forEach(s => {
                this.updateShape(s);
                this.drawShape(s);
            });
        }

        // Draw Particles
        this.particles.forEach((p, i) => {
            this.updateParticle(p);

            this.ctx.fillStyle = `rgba(${this.color}, ${p.opacity * this.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distanceSq = dx * dx + dy * dy;
                if (distanceSq < 70 * 70) {
                    const distance = Math.sqrt(distanceSq);
                    this.ctx.strokeStyle = `rgba(${this.lineColor}, ${0.15 * (1 - distance / 70) * this.opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        });
    }

    animate(currentTime) {
        this.draw(currentTime);
        requestAnimationFrame((time) => this.animate(time));
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Global Event Delegation for Interactivity
document.addEventListener('click', (e) => {
    // 1. FAQ Toggle Logic
    const faqQuestion = e.target.closest('.faq-question');
    if (faqQuestion) {
        e.stopImmediatePropagation();
        const faqItem = faqQuestion.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');

        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.faq-question i');
            if (icon) icon.className = 'bi bi-plus';
        });

        if (!isActive) {
            faqItem.classList.add('active');
            const icon = faqQuestion.querySelector('i');
            if (icon) icon.className = 'bi bi-dash';
        }
        return;
    }

    // 2. Mobile Nav Toggle Logic
    const navToggle = e.target.closest('#nav-toggle');
    if (navToggle) {
        e.stopImmediatePropagation();
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const isOpening = !navLinks.classList.contains('active');
            navLinks.classList.toggle('active');

            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.className = isOpening ? 'bi bi-x-lg' : 'bi bi-list';
            }
            document.body.style.overflow = isOpening ? 'hidden' : '';
        }
        return;
    }

    // 3. Close menu when clicking on a link or outside
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && navLinks.classList.contains('active')) {
        const isClickInsideMenu = navLinks.contains(e.target);
        const isClickOnToggle = document.getElementById('nav-toggle')?.contains(e.target);
        const isClickOnLink = e.target.closest('.nav-links a');

        if (isClickOnLink || (!isClickInsideMenu && !isClickOnToggle)) {
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
            const navToggleBtn = document.getElementById('nav-toggle');
            if (navToggleBtn) {
                const icon = navToggleBtn.querySelector('i');
                if (icon) icon.className = 'bi bi-list';
            }
        }
    }
}, true);

// Scroll Reveal Animation
function initReveal() {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .h-scroll-card, .contact-form, .testimonial-slider, .blog-card, .section-header').forEach(el => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // Main background particles
    new ParticleSystem('particle-canvas');

    // Blog section particles (if present)
    if (document.getElementById('blog-particle-canvas')) {
        new ParticleSystem('blog-particle-canvas', {
            count: 30,
            color: '244, 196, 48', // Gold particles for blog
            lineColor: '0, 208, 132', // Green lines
            opacity: 0.3,
            showShapes: true // Enable 3D-like shapes for blog section
        });
    }

    initReveal();
    console.log('Island Connect AI: All systems loaded.');
});
