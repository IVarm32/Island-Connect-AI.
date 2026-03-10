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
}

function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

let lastTime = 0;
const fpsLimit = 30;
let animationId = null;

// Handle visibility change to save CPU/Battery
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        if (!animationId) {
            animationId = requestAnimationFrame(animateParticles);
        }
    } else {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
});

function animateParticles(currentTime) {
    animationId = requestAnimationFrame(animateParticles);

    if (currentTime - lastTime < 1000 / fpsLimit) {
        return;
    }
    lastTime = currentTime;

    // Clear once per frame
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Pre-calculate common styles
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();

        // Draw particle
        ctx.fillStyle = `rgba(0, 200, 83, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distanceSq = dx * dx + dy * dy;

            // distance < 75 => distanceSq < 5625
            if (distanceSq < 5625) {
                const distance = Math.sqrt(distanceSq);
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.1 * (1 - distance / 75)})`;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

// Global Event Delegation for Interactivity
document.addEventListener('click', (e) => {
    // 1. FAQ Toggle Logic
    const faqQuestion = e.target.closest('.faq-question');
    if (faqQuestion) {
        console.log('FAQ Question Clicked');
        e.stopImmediatePropagation();
        const faqItem = faqQuestion.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');

        // Close all other items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            const icon = item.querySelector('.faq-question i');
            if (icon) icon.className = 'bi bi-plus';
        });

        // Toggle the clicked item
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
        console.log('Nav Toggle Clicked');
        e.stopImmediatePropagation();
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const isOpening = !navLinks.classList.contains('active');
            navLinks.classList.toggle('active');

            // Update Toggle Icon
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.className = isOpening ? 'bi bi-x-lg' : 'bi bi-list';
            }

            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpening ? 'hidden' : '';
        }
        return;
    }

    // 3. Close menu when clicking on a link or outside
    const navLinks = document.querySelector('.nav-links');
    if (navLinks && navLinks.classList.contains('active')) {
        const isClickInsideMenu = navLinks.contains(e.target);
        const isClickOnToggle = document.getElementById('nav-toggle').contains(e.target);
        const isClickOnLink = e.target.closest('.nav-links a');

        if (isClickOnLink || (!isClickInsideMenu && !isClickOnToggle)) {
            console.log('Closing Nav Links');
            e.stopImmediatePropagation();
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
            const navToggleBtn = document.getElementById('nav-toggle');
            if (navToggleBtn) {
                const icon = navToggleBtn.querySelector('i');
                if (icon) icon.className = 'bi bi-list';
            }
        }
    }
}, true); // Use capture phase to ensure we catch it before other things

// Utility: Throttle function to limit execution frequency of rapid events
function throttle(func, limit) {
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

// Scroll Reveal Animation (Intersection Observer)
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

    document.querySelectorAll('.service-card, .h-scroll-card, .contact-form, .testimonial-slider').forEach(el => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

// Initialize on Load
window.addEventListener('load', () => {
    initCanvas();
    if (canvas && ctx) {
        createParticles();
        animateParticles(0);
        window.addEventListener('resize', throttle(initCanvas, 200));
    }
    initReveal();
    console.log('Island Connect AI: All systems loaded.');
});
