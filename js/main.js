// Particle Background Implementation
const canvas = document.getElementById('particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let particles = [];
const particleCount = 40;

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

function initCanvas() {
    if (!canvas) return;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
            this.reset();
        }
    }
    draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(0, 200, 83, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

let lastTime = 0;
const fpsLimit = 30;

function animateParticles(currentTime) {
    if (!ctx) return;
    if (currentTime - lastTime < 1000 / fpsLimit) {
        requestAnimationFrame(animateParticles);
        return;
    }
    lastTime = currentTime;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    particles.forEach((p, i) => {
        p.update();
        p.draw();
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distanceSq = dx * dx + dy * dy;
            if (distanceSq < 5625) {
                const distance = Math.sqrt(distanceSq);
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.1 * (1 - distance / 75)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });
    requestAnimationFrame(animateParticles);
}

// FAQ Functionality
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close others
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }

            // Update icons safely
            faqItems.forEach(i => {
                const icon = i.querySelector('i');
                if (icon) {
                    icon.className = i.classList.contains('active') ? 'bi bi-dash' : 'bi bi-plus';
                }
            });
        });
    });
}

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

    const revealElements = document.querySelectorAll('.service-card, .h-scroll-card, .glass-panel');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

// Form Submission handling
function initForm() {
    const leadForm = document.getElementById('lead-form');
    if (!leadForm) return;
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = leadForm.querySelector('button');
        const originalText = btn.innerHTML;
        const formData = new FormData(leadForm);
        btn.innerHTML = '<i class="bi bi-send"></i> Sending...';
        btn.disabled = true;
        try {
            const response = await fetch(leadForm.action, {
                method: leadForm.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                btn.innerHTML = '<i class="bi bi-check2-circle"></i> Request Sent';
                btn.style.background = 'var(--accent-green)';
                leadForm.reset();
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = 'var(--accent-gold)';
                    btn.disabled = false;
                }, 3000);
            } else {
                alert('Submission failed. Please try again.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            alert('Connection error. Check your internet.');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// Mobile Menu Toggle
function initNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            icon.className = navLinks.classList.contains('active') ? 'bi bi-x-lg' : 'bi bi-list';
        });
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                navToggle.querySelector('i').className = 'bi bi-list';
            });
        });
    }
}

// Hover Video for Projects
function initHoverVideos() {
    const scrollCards = document.querySelectorAll('.h-scroll-card');
    scrollCards.forEach(card => {
        const video = card.querySelector('.hover-video');
        if (video) {
            card.addEventListener('mouseenter', () => video.play().catch(() => { }));
            card.addEventListener('mouseleave', () => video.pause());
        }
    });
}

// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    if (canvas && ctx) {
        createParticles();
        animateParticles(0);
        window.addEventListener('resize', initCanvas);
    }
    initFAQ();
    initReveal();
    initForm();
    initNav();
    initHoverVideos();
});
