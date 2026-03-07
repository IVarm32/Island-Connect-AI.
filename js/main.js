// Particle Background Implementation
const canvas = document.getElementById('particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let particles = [];
const particleCount = 40; // Reduced from 80 for better performance

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

function initCanvas() {
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
        this.speedX = (Math.random() - 0.5) * 0.3; // Slower for less distraction
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
    if (currentTime - lastTime < 1000 / fpsLimit) {
        requestAnimationFrame(animateParticles);
        return;
    }
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    particles.forEach((p, i) => {
        p.update();
        p.draw();

        // Connect particles (optimized O(N^2))
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < 5625) { // 75px squared (was 80px)
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
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = leadForm.querySelector('button');
        const originalText = btn.innerHTML;

        // Use FormData directly (more robust for Formspree)
        const formData = new FormData(leadForm);

        // Visual feedback
        btn.innerHTML = '<i class="bi bi-send"></i> Sending...';
        btn.disabled = true;

        try {
            const response = await fetch(leadForm.action, {
                method: leadForm.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            // Try to parse as JSON, but handle cases where it's not
            let result;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                result = { message: await response.text() };
            }

            if (response.ok) {
                btn.innerHTML = '<i class="bi bi-check2-circle"></i> Request Sent';
                btn.style.background = 'var(--accent-green)';
                leadForm.reset();

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = 'var(--accent-gold)';
                    btn.disabled = false;
                    alert('Thank you! Your inquiry has been sent to Island Connect AI.');
                }, 3000);
            } else {
                // Formspree error
                console.error('Formspree Error Status:', response.status);
                console.error('Formspree Result:', result);

                let errorMessage = 'Submission failed.';
                if (result.errors) {
                    errorMessage = result.errors.map(err => err.message).join(', ');
                } else if (result.error) {
                    errorMessage = result.error;
                } else if (response.status === 404) {
                    errorMessage = 'Form not found. Please check your Formspree ID.';
                } else if (response.status === 401) {
                    errorMessage = 'Form requires activation. Please check your email and confirm the form.';
                }

                alert(`Submission Error (${response.status}): ${errorMessage}`);

                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            console.error('Submission Exception:', error);

            // Check if user is testing locally via file://
            if (window.location.protocol === 'file:') {
                alert('Local Testing Notice: Browsers often block form submissions when opening HTML files directly (file://). Please try using a local server (like Live Server in VS Code) or upload the files to a preview site to test the contact form.');
            } else {
                alert('Connection error. Please check your internet or Formspree setup and try again.');
            }

            btn.innerHTML = originalText;
            btn.disabled = false;
        }
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
console.log('Initializing Testimonial Slider...');
const testimonialSlider = document.querySelector('.testimonial-slider');
console.log('testimonialSlider found:', !!testimonialSlider);
if (testimonialSlider) {
    const track = testimonialSlider.querySelector('.testimonial-track');
    let slides = Array.from(testimonialSlider.querySelectorAll('.testimonial-card'));
    const nextBtn = testimonialSlider.querySelector('.slider-arrow.next');
    const prevBtn = testimonialSlider.querySelector('.slider-arrow.prev');
    const dots = Array.from(testimonialSlider.querySelectorAll('.dots .dot, .slider-dots .dot'));

    // Clone slides if only a few exist to make looping seamless
    if (slides.length > 0 && slides.length < 5) {
        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            clone.classList.remove('active');
            track.appendChild(clone);
        });
        slides = Array.from(testimonialSlider.querySelectorAll('.testimonial-card'));
    }

    let currentSlide = 0;
    const slidesCount = slides.length;
    let slideInterval;

    if (slidesCount > 0) {
        const updateSlider = (index) => {
            track.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            track.style.transform = `translateX(-${index * 100}%)`;

            dots.forEach(dot => dot.classList.remove('active'));
            // Map the current index back to the original dots
            const dotIndex = index % dots.length;
            if (dots[dotIndex]) dots[dotIndex].classList.add('active');

            slides.forEach((s, i) => s.classList.toggle('active', i === index));
            currentSlide = index;
        };

        const nextSlide = () => {
            let nextIndex = currentSlide + 1;
            // If we reached the end of clones, reset instantly
            if (nextIndex >= slidesCount) {
                track.style.transition = 'none';
                track.style.transform = `translateX(0%)`;
                currentSlide = 0;
                // Force reflow
                track.offsetHeight;
                nextIndex = 1;
            }
            updateSlider(nextIndex);
        };

        const prevSlide = () => {
            let prevIndex = currentSlide - 1;
            if (prevIndex < 0) {
                track.style.transition = 'none';
                currentSlide = slidesCount - 1;
                track.style.transform = `translateX(-${currentSlide * 100}%)`;
                // Force reflow
                track.offsetHeight;
                prevIndex = currentSlide - 1;
            }
            updateSlider(prevIndex);
        };

        const startAutoSlide = () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        };

        // Initialize display
        dots[0]?.classList.add('active');
        startAutoSlide();

        testimonialSlider.addEventListener('mouseenter', () => clearInterval(slideInterval));
        testimonialSlider.addEventListener('mouseleave', startAutoSlide);

        nextBtn?.addEventListener('click', () => { nextSlide(); startAutoSlide(); });
        prevBtn?.addEventListener('click', () => { prevSlide(); startAutoSlide(); });

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                updateSlider(i);
                startAutoSlide();
            });
        });

        // Touch support
        let startX = 0;
        testimonialSlider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            clearInterval(slideInterval);
        }, { passive: true });
        testimonialSlider.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
            startAutoSlide();
        }, { passive: true });

        // Ensure auto slide restarts when window regains focus
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) clearInterval(slideInterval);
            else startAutoSlide();
        });
    }
}

// Featured Projects Slider
console.log('Initializing Featured Projects Slider...');
const projectSlider = document.querySelector('.project-slider');
console.log('projectSlider found:', !!projectSlider);
if (projectSlider) {
    const projectTrack = projectSlider.querySelector('.project-track');
    let projectCards = Array.from(projectSlider.querySelectorAll('.project-card'));
    const projectDots = Array.from(projectSlider.querySelectorAll('.project-dots .dot'));

    if (projectTrack && projectCards.length > 0) {
        // Clone project cards to enable absolute seamless loop on large screens
        if (projectCards.length <= 6) {
            projectCards.forEach(card => {
                const clone = card.cloneNode(true);
                projectTrack.appendChild(clone);
            });
            projectCards = Array.from(projectSlider.querySelectorAll('.project-card'));
        }

        let currentProjectSlide = 0;
        const totalProjects = projectCards.length;
        let projectSlideInterval;

        const updateProjectSlider = (index) => {
            const isMobile = window.innerWidth <= 768;
            const isTablet = window.innerWidth <= 1100;

            let itemsVisible = 3;
            if (isMobile) itemsVisible = 1;
            else if (isTablet) itemsVisible = 2;

            // Using pure continuous track instead of maxIndex stop
            const maxScrollable = totalProjects - itemsVisible;
            if (index > maxScrollable) {
                // Instant snap to beginning
                projectTrack.style.transition = 'none';
                projectTrack.style.transform = `translateX(0%)`;
                currentProjectSlide = 0;
                projectTrack.offsetHeight; // reflow
                index = 1;
            } else if (index < 0) {
                projectTrack.style.transition = 'none';
                currentProjectSlide = maxScrollable;
                projectTrack.style.transform = `translateX(-${maxScrollable * (100 / itemsVisible)}%)`;
                projectTrack.offsetHeight;
                index = maxScrollable - 1;
            }

            let movePercent = 100 / itemsVisible;
            projectTrack.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            projectTrack.style.transform = `translateX(-${index * movePercent}%)`;

            projectDots.forEach((dot, i) => {
                const dotIndex = index % projectDots.length;
                dot.classList.toggle('active', i === dotIndex);
            });
            currentProjectSlide = index;
        };

        const nextProjectSlide = () => updateProjectSlider(currentProjectSlide + 1);
        const prevProjectSlide = () => updateProjectSlider(currentProjectSlide - 1);

        const startProjectAutoSlide = () => {
            clearInterval(projectSlideInterval);
            projectSlideInterval = setInterval(nextProjectSlide, 6000);
        };

        projectDots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                updateProjectSlider(i);
                startProjectAutoSlide();
            });
        });

        // Add pause on hover
        projectSlider.addEventListener('mouseenter', () => clearInterval(projectSlideInterval));
        projectSlider.addEventListener('mouseleave', startProjectAutoSlide);

        // Touch support for projects
        let startX = 0;
        projectSlider.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            clearInterval(projectSlideInterval);
        }, { passive: true });

        projectSlider.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextProjectSlide();
                else prevProjectSlide();
            }
            startProjectAutoSlide();
        }, { passive: true });

        window.addEventListener('resize', () => {
            projectTrack.style.transition = 'none';
            updateProjectSlider(currentProjectSlide);
        });

        // Initialize setup
        projectDots[0]?.classList.add('active');
        projectTrack.style.transition = 'none';
        updateProjectSlider(0);
        setTimeout(startProjectAutoSlide, 500);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) clearInterval(projectSlideInterval);
            else startProjectAutoSlide();
        });
    }
}

if (canvas && ctx) {
    window.addEventListener('resize', initCanvas);
    initCanvas();
    createParticles();
    animateParticles(0);
}

console.log('Island Connect AI initialized successfully.');
