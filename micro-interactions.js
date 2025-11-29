// ========================================
// COUSINS VAULT - MICRO-INTERACTIONS ENGINE
// Enhanced animations and interactive feedback
// ========================================

class MicroInteractionsEngine {
    constructor() {
        this.isInitialized = false;
        this.observers = [];
        this.activeAnimations = new Set();
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupClickEffects();
        this.setupFormAnimations();
        this.setupLoadingStates();
        this.setupPageTransitions();
        this.setupParallaxEffects();
        this.setupSmartAnimations();
        
        this.isInitialized = true;
        console.log('🎨 Micro-interactions engine initialized');
    }

    // ========================================
    // SCROLL-TRIGGERED ANIMATIONS
    // ========================================

    setupScrollAnimations() {
        // Intersection Observer for fade-in animations
        const fadeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate-fade-in-up');
                        this.activeAnimations.add(element);
                    }, delay);
                    
                    fadeObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });

        // Auto-detect elements that should animate
        const animatableSelectors = [
            '.feature-card',
            '.cousin-folder', 
            '.vault-card',
            '.event-card',
            '.family-member',
            '.intro-section',
            '.featured-section'
        ];

        animatableSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach((element, index) => {
                element.dataset.delay = index * 100; // Stagger effect
                fadeObserver.observe(element);
            });
        });

        this.observers.push(fadeObserver);

        // Parallax scroll effects
        this.setupParallaxScroll();
    }

    setupParallaxScroll() {
        let ticking = false;

        const updateParallax = () => {
            const scrollY = window.pageYOffset;
            
            // Parallax for floating icons
            document.querySelectorAll('.float-icon, .floating-shape').forEach((icon, index) => {
                const speed = 0.5 + (index * 0.1);
                const yPos = -(scrollY * speed);
                icon.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });

            // Parallax for hero content
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                const yPos = scrollY * 0.3;
                heroContent.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }

            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // ========================================
    // ENHANCED HOVER EFFECTS
    // ========================================

    setupHoverEffects() {
        // Magnetic effect for buttons
        document.querySelectorAll('.submit-btn, .hero-cta, .btn-primary').forEach(button => {
            this.addMagneticEffect(button);
        });

        // 3D tilt effect for cards
        document.querySelectorAll('.cousin-folder, .feature-card, .member-card').forEach(card => {
            this.add3DTiltEffect(card);
        });

        // Glow effect for interactive elements
        document.querySelectorAll('.permission-btn, .control-btn, .user-menu-btn').forEach(element => {
            element.classList.add('glow-effect');
        });
    }

    addMagneticEffect(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            element.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.02)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
        });
    }

    add3DTiltEffect(element) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
        });
    }

    // ========================================
    // CLICK EFFECTS & RIPPLES
    // ========================================

    setupClickEffects() {
        // Ripple effect for all buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn, .action-btn');
            if (button && !button.classList.contains('no-ripple')) {
                this.createRipple(e, button);
            }
        });

        // Success feedback for form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn) {
                    submitBtn.classList.add('success-feedback');
                    setTimeout(() => {
                        submitBtn.classList.remove('success-feedback');
                    }, 600);
                }
            });
        });
    }

    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
        ripple.classList.add('ripple-effect');
        
        // Inline styles for the ripple effect
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple-animation 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        // Add keyframes if they don't exist
        if (!document.getElementById('ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // ========================================
    // FORM ANIMATIONS
    // ========================================

    setupFormAnimations() {
        // Floating labels
        document.querySelectorAll('.form-group').forEach(group => {
            const input = group.querySelector('.form-input');
            const label = group.querySelector('.form-label');
            
            if (input && label) {
                group.classList.add('floating');
                
                // Check if input has value on load
                if (input.value) {
                    group.classList.add('has-value');
                }
                
                input.addEventListener('focus', () => {
                    group.classList.add('focused');
                });
                
                input.addEventListener('blur', () => {
                    group.classList.remove('focused');
                    if (input.value) {
                        group.classList.add('has-value');
                    } else {
                        group.classList.remove('has-value');
                    }
                });
            }
        });

        // Input validation animations
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('invalid', (e) => {
                e.target.classList.add('error-shake');
                setTimeout(() => {
                    e.target.classList.remove('error-shake');
                }, 500);
            });
        });

        // Enhanced focus effects
        document.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('focus', () => {
                this.createFocusRing(input);
            });
        });
    }

    createFocusRing(element) {
        const ring = document.createElement('div');
        ring.className = 'focus-ring';
        ring.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 2px solid var(--sage-green);
            border-radius: ${getComputedStyle(element).borderRadius};
            opacity: 0;
            animation: focusRingAnim 0.3s ease;
            pointer-events: none;
            z-index: 10;
        `;

        if (!document.getElementById('focus-ring-keyframes')) {
            const style = document.createElement('style');
            style.id = 'focus-ring-keyframes';
            style.textContent = `
                @keyframes focusRingAnim {
                    0% {
                        opacity: 0;
                        transform: scale(1.1);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        element.parentNode.style.position = 'relative';
        element.parentNode.appendChild(ring);

        element.addEventListener('blur', () => {
            ring.remove();
        }, { once: true });
    }

    // ========================================
    // LOADING STATES
    // ========================================

    setupLoadingStates() {
        // Auto-detect forms and add loading states
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('[type="submit"]');
                if (submitBtn && !submitBtn.classList.contains('loading')) {
                    this.showLoadingState(submitBtn);
                }
            });
        });

        // Loading skeletons for async content
        this.setupSkeletonLoaders();
    }

    showLoadingState(button) {
        const originalText = button.textContent;
        button.classList.add('loading');
        button.disabled = true;
        
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        button.appendChild(spinner);
        
        // Store original text for restoration
        button.dataset.originalText = originalText;
        button.querySelector('.btn-text')?.style.setProperty('opacity', '0');
    }

    hideLoadingState(button) {
        button.classList.remove('loading');
        button.disabled = false;
        button.querySelector('.loading-spinner')?.remove();
        
        const btnText = button.querySelector('.btn-text');
        if (btnText) {
            btnText.style.opacity = '1';
        } else {
            button.textContent = button.dataset.originalText || button.textContent;
        }
    }

    setupSkeletonLoaders() {
        // Create skeleton loaders for delayed content
        const skeletonElements = document.querySelectorAll('[data-skeleton]');
        skeletonElements.forEach(element => {
            element.classList.add('skeleton', 'loading-pulse');
        });
    }

    // ========================================
    // PAGE TRANSITIONS
    // ========================================

    setupPageTransitions() {
        // Smooth page transitions
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && link.href.includes(window.location.origin) && !link.target) {
                e.preventDefault();
                this.transitionToPage(link.href);
            }
        });

        // Page load animation
        this.animatePageLoad();
    }

    transitionToPage(url) {
        // Fade out current page
        document.body.style.opacity = '0.8';
        document.body.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            window.location.href = url;
        }, 200);
    }

    animatePageLoad() {
        // Animate elements on page load
        const elementsToAnimate = document.querySelectorAll('.hero-content, .page-header, .nav-container');
        elementsToAnimate.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // ========================================
    // PARALLAX & SCROLL EFFECTS
    // ========================================

    setupParallaxEffects() {
        // Enhanced floating particles
        this.createFloatingParticles();
        
        // Scroll-based animations
        let lastScrollY = 0;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.pageYOffset;
            
            // Hide/show navbar on scroll
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }

    createFloatingParticles() {
        const containers = document.querySelectorAll('.hero, .auth-background');
        containers.forEach(container => {
            // Add more floating particles
            const particleIcons = ['💫', '✨', '🌟', '💎', '🔮', '🎨', '📸', '💝', '🎪', '🎭'];
            
            for (let i = 0; i < 6; i++) {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.textContent = particleIcons[Math.floor(Math.random() * particleIcons.length)];
                particle.style.cssText = `
                    position: absolute;
                    font-size: ${1 + Math.random()}rem;
                    opacity: 0.1;
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    animation-delay: ${Math.random() * 20}s;
                    animation-duration: ${15 + Math.random() * 10}s;
                    pointer-events: none;
                    user-select: none;
                `;
                container.appendChild(particle);
            }
        });
    }

    // ========================================
    // SMART ANIMATIONS
    // ========================================

    setupSmartAnimations() {
        // Counter animations
        this.animateCounters();
        
        // Progressive image loading
        this.setupProgressiveImages();
        
        // Auto-sparkle effects for special elements
        this.addSparkleEffects();
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.textContent) || 0;
            const duration = 2000;
            const start = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(easeOutQuart * target);
                
                counter.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            // Start animation when element comes into view
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    requestAnimationFrame(animate);
                    observer.disconnect();
                }
            });
            
            observer.observe(counter);
        });
    }

    setupProgressiveImages() {
        // Progressive loading for images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('animate-fade-in-up');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    addSparkleEffects() {
        // Add sparkle effect to special elements
        const sparkleElements = document.querySelectorAll('.hero-cta, .vault-card:first-child');
        sparkleElements.forEach(element => {
            element.classList.add('sparkle');
        });
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    // Debounce function for performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Check if user prefers reduced motion
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // Cleanup method
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.activeAnimations.clear();
        this.isInitialized = false;
    }
}

// Initialize the micro-interactions engine when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.microInteractions = new MicroInteractionsEngine();
    });
} else {
    window.microInteractions = new MicroInteractionsEngine();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroInteractionsEngine;
}