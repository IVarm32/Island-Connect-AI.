// Particle Background System
const initParticles = () => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 40;

    let canvasWidth, canvasHeight;

    const resize = () => {
        canvasWidth = canvas.width = window.innerWidth;
        canvasHeight = canvas.height = window.innerHeight;
    };

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvasWidth;
            this.y = Math.random() * canvasHeight;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) this.reset();
        }
        draw() {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        particles.forEach((p, i) => {
            p.update();
            p.draw();
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x, dy = p.y - p2.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < 5625) {
                    const dist = Math.sqrt(distSq);
                    ctx.strokeStyle = `rgba(255, 215, 0, ${0.1 * (1 - dist / 75)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    requestAnimationFrame(animate);
};

// --- Slider Implementation ---
class IslandSlider {
    constructor(config) {
        this.container = document.querySelector(config.container);
        if (!this.container || this.container.dataset.sliderInit) return;
        this.container.dataset.sliderInit = "true";

        this.track = this.container.querySelector(config.track);
        this.items = this.container.querySelectorAll(config.items);
        this.dots = this.container.querySelectorAll(config.dots);
        this.prevBtn = this.container.querySelector(config.prev);
        this.nextBtn = this.container.querySelector(config.next);

        this.interval = config.interval || 5000;
        this.usePixels = config.usePixels || false;
        this.isFanStyle = config.isFanStyle || false;
        this.currentIndex = 0;
        this.timer = null;
        this.startX = 0;

        this.init();
    }

    init() {
        if (this.items.length === 0) return;

        this.nextBtn?.addEventListener('click', () => {
            this.next();
            this.restartAuto();
        });
        this.prevBtn?.addEventListener('click', () => {
            this.prev();
            this.restartAuto();
        });

        this.dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                this.goTo(i);
                this.restartAuto();
            });
        });

        this.container.addEventListener('touchstart', (e) => {
            this.startX = e.touches[0].clientX;
            this.stopAuto();
        }, { passive: true });

        this.container.addEventListener('touchend', (e) => {
            const diff = this.startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? this.next() : this.prev();
            }
            this.startAuto();
        }, { passive: true });

        window.addEventListener('resize', () => {
            const maxIdx = this.getMaxIndex();
            if (this.currentIndex > maxIdx) this.currentIndex = maxIdx;
            this.update();
        });

        this.update();
        this.startAuto();
    }

    getVisibleItems() {
        if (!this.usePixels) return 1;
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1100) return 2;
        return 3;
    }

    getMaxIndex() {
        if (this.isFanStyle) return this.items.length - 1;
        return Math.max(0, this.items.length - this.getVisibleItems());
    }

    update() {
        if (!this.track) return;

        const maxIdx = this.getMaxIndex();
        const itemCount = this.items.length;

        if (!this.isFanStyle) {
            let transformValue = '';
            if (this.usePixels) {
                const itemWidth = this.items[0].offsetWidth || 0;
                const gap = parseFloat(getComputedStyle(this.track).gap) || 0;
                transformValue = `translateX(-${this.currentIndex * (itemWidth + gap)}px)`;
            } else {
                transformValue = `translateX(-${this.currentIndex * 100}%)`;
            }
            this.track.style.transform = transformValue;
        }

        this.dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
            dot.style.display = (i > maxIdx && !this.isFanStyle) ? 'none' : 'block';
        });

        if (this.isFanStyle) {
            const prevIdx = (this.currentIndex - 1 + itemCount) % itemCount;
            const nextIdx = (this.currentIndex + 1) % itemCount;

            this.items.forEach((item, i) => {
                item.classList.remove('active', 'prev', 'next');
                if (i === this.currentIndex) item.classList.add('active');
                else if (i === prevIdx) item.classList.add('prev');
                else if (i === nextIdx) item.classList.add('next');
            });
        }
    }

    next() {
        const maxIdx = this.getMaxIndex();
        const itemCount = this.items.length;

        if (this.isFanStyle) {
            this.currentIndex = (this.currentIndex + 1) % itemCount;
        } else if (maxIdx > 0) {
            this.currentIndex = (this.currentIndex + 1) % (maxIdx + 1);
        } else {
            this.currentIndex = 0;
        }
        this.update();
    }

    prev() {
        const maxIdx = this.getMaxIndex();
        const itemCount = this.items.length;
        if (this.isFanStyle) {
            this.currentIndex = (this.currentIndex - 1 + itemCount) % itemCount;
        } else {
            this.currentIndex = this.currentIndex <= 0 ? maxIdx : this.currentIndex - 1;
        }
        this.update();
    }

    goTo(index) {
        const maxIdx = this.getMaxIndex();
        this.currentIndex = Math.min(index, this.isFanStyle ? this.items.length - 1 : maxIdx);
        this.update();
    }

    startAuto() {
        this.stopAuto();
        this.timer = setInterval(() => this.next(), this.interval);
    }

    stopAuto() {
        if (this.timer) clearInterval(this.timer);
    }

    restartAuto() {
        this.startAuto();
    }
}

// --- Initialization & Other Features ---
const initAll = () => {
    initParticles();

    // Initialize Sliders
    new IslandSlider({
        container: '.project-slider',
        track: '.project-track',
        items: '.project-card',
        dots: '.project-dots .dot',
        interval: 6000,
        usePixels: true
    });

    new IslandSlider({
        container: '.testimonial-slider',
        track: '.testimonial-track',
        items: '.testimonial-card',
        dots: '.slider-dots .dot',
        prev: '.slider-arrow.prev',
        next: '.slider-arrow.next',
        interval: 5000,
        usePixels: false,
        isFanStyle: true
    });

    // FAQ Toggle
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            const wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!wasActive) item.classList.add('active');

            document.querySelectorAll('.faq-item i').forEach(icon => {
                icon.className = icon.closest('.faq-item').classList.contains('active') ? 'bi bi-dash' : 'bi bi-plus';
            });
        });
    });

    // Mobile Nav
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
        const toggleMenu = () => {
            navLinks.classList.toggle('active');
            navToggle.querySelector('i').className = navLinks.classList.contains('active') ? 'bi bi-x-lg' : 'bi bi-list';
        };
        navToggle.addEventListener('click', toggleMenu);
        navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.querySelector('i').className = 'bi bi-list';
        }));
    }

    // Reveal Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.service-card, .glass-panel:not(.nav-content):not(.testimonial-card):not(.project-card):not(.project-track):not(.testimonial-track)').forEach(el => {
        el.classList.add('reveal-item');
        observer.observe(el);
    });

    // Lead Form
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = leadForm.querySelector('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="bi bi-send"></i> Sending...';
            btn.disabled = true;

            try {
                const response = await fetch(leadForm.action, {
                    method: leadForm.method,
                    body: new FormData(leadForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="bi bi-check2-circle"></i> Sent';
                    btn.style.background = 'var(--accent-green)';
                    leadForm.reset();
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error('Submission failed');
                }
            } catch (err) {
                alert('Submission failed. Please try again.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
};

// Use both DOMContentLoaded and immediate execution (since it's a module)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// Final Load Check (ensures dimensions are ready)
window.addEventListener('load', () => {
    // Force a slider update to ensure offsetWidth is captured
    window.dispatchEvent(new Event('resize'));
});

console.log('Island Connect AI fully loaded.');
