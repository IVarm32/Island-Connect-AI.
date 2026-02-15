// Particle Background Implementation
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 80;

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
    }

    draw() {
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

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();

        // Connect particles
        particles.forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.strokeStyle = `rgba(255, 215, 0, ${0.1 * (1 - distance / 150)})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });
    requestAnimationFrame(animateParticles);
}

// FAQ Functionality
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');

        // Update icons
        faqItems.forEach(i => {
            const icon = i.querySelector('i');
            if (i.classList.contains('active')) {
                icon.className = 'bi bi-dash';
            } else {
                icon.className = 'bi bi-plus';
            }
        });
    });
});

// Scroll Reveal Animation (Simple version using Intersection Observer)
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const revealElements = document.querySelectorAll('.service-card, .portfolio-item, .glass-panel');
revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

// Form Submission handling
const leadForm = document.getElementById('lead-form');
if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = leadForm.querySelector('button');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="bi bi-check2-circle"></i> Request Sent';
        btn.style.background = 'var(--accent-green)';
        btn.disabled = true;

        setTimeout(() => {
            leadForm.reset();
            btn.innerHTML = originalText;
            btn.style.background = 'var(--accent-gold)';
            btn.disabled = false;
            alert('Thank you! Our AI strategist will contact you shortly.');
        }, 2000);
    });
}

// Mobile Menu Toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = navToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'bi bi-x-lg';
        } else {
            icon.className = 'bi bi-list';
        }
    });

    // Close menu when a link is clicked
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.querySelector('i').className = 'bi bi-list';
        });
    });
}


// Testimonial Slider
const track = document.querySelector('.testimonial-track');
const slidesCount = document.querySelectorAll('.testimonial-card').length;
const nextBtn = document.querySelector('.slider-arrow.next');
const prevBtn = document.querySelector('.slider-arrow.prev');
const dots = document.querySelectorAll('.dot');

let currentSlide = 0;
let slideInterval;

const updateSlider = (index) => {
    if (track) {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(dot => dot.classList.remove('active'));
        if (dots[index]) dots[index].classList.add('active');
        currentSlide = index;
    }
};

const nextSlide = () => {
    let index = (currentSlide + 1) % slidesCount;
    updateSlider(index);
};

const prevSlide = () => {
    let index = (currentSlide - 1 + slidesCount) % slidesCount;
    updateSlider(index);
};

if (track && slidesCount > 0) {
    const startAutoSlide = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    };

    startAutoSlide();

    nextBtn?.addEventListener('click', () => {
        nextSlide();
        startAutoSlide();
    });

    prevBtn?.addEventListener('click', () => {
        prevSlide();
        startAutoSlide();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            updateSlider(i);
            startAutoSlide();
        });
    });
}

// Initialize
window.addEventListener('resize', initCanvas);
initCanvas();
createParticles();
animateParticles();

console.log('Island Connect AI initialized successfully.');
