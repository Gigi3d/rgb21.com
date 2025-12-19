import translations from './translations.js';

class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('btc_season3_lang') ||
            (navigator.language.startsWith('zh') ? 'zh' : 'en');
        this.init();
    }

    init() {
        this.updateButtons();
        this.translatePage();
        this.applyLanguageToBody();
    }

    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('btc_season3_lang', lang);
        this.init();
    }

    applyLanguageToBody() {
        document.documentElement.lang = this.currentLang;
    }

    updateButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
            btn.addEventListener('click', () => this.setLanguage(btn.dataset.lang), { once: true });
        });
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            let translation = translations[this.currentLang][key] || translations['en'][key];

            if (translation) {
                // Handle interpolation
                const vars = el.getAttribute('data-i18n-vars');
                if (vars) {
                    const parsedVars = JSON.parse(vars);
                    Object.keys(parsedVars).forEach(v => {
                        translation = translation.replace(`{${v}}`, parsedVars[v]);
                    });
                }

                // Keep inner HTML structure if it contains tags like <b> or <br>
                if (translation.includes('<')) {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const langManager = new LanguageManager();

    // ... (keep the rest of the existing logic) ...
    // Progress bar animation simulation
    const progressBar = document.querySelector('.progress-bar');
    const progressPercent = document.querySelector('.progress-percent');

    if (progressBar && progressPercent) {
        // Simulate initial progress after load
        setTimeout(() => {
            const targetProgress = parseInt(progressPercent.getAttribute('data-percent')) || 0;
            const targetCount = parseInt(progressPercent.getAttribute('data-count')) || 0;
            const total = parseInt(progressPercent.getAttribute('data-total')) || 0;

            const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            progressBar.style.width = `${targetProgress}%`;
            progressBar.style.background = '#fbbf24'; // Gold fill for the 70%
            progressPercent.textContent = `${targetProgress}% (${formatNumber(targetCount)}/${formatNumber(total)})`;
        }, 800);
    }

    // Atomic Mint button clicks
    const mintButtons = document.querySelectorAll('.mint-btn:not(.disabled)');

    mintButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const originalText = btn.textContent;
            btn.textContent = 'Processing...';
            btn.disabled = true;

            // Mock processing
            setTimeout(() => {
                btn.textContent = 'Success!';
                btn.style.background = '#10b981'; // Green success

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                }, 2000);
            }, 1000);
        });
    });

    // Hover effect for image cards - parallax-ish
    const cards = document.querySelectorAll('.image-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    });

    // Countdown Timer Logic
    const startCountdown = (elementId, targetDateStr) => {
        const element = document.getElementById(elementId);
        if (!element) return;

        const targetDate = new Date(targetDateStr).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                element.textContent = "LIVE NOW";
                element.classList.add('live');
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            element.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    };

    startCountdown('space-goat-timer', 'January 12, 2026 00:00:00');
    startCountdown('space-goat-timer-classic', 'January 12, 2026 00:00:00');
    startCountdown('space-goat-wl-timer', 'January 12, 2026 00:00:00');
    startCountdown('space-goat-wl-timer-classic', 'January 12, 2026 00:00:00');
    startCountdown('nakamoto-timer', 'January 12, 2026 00:00:00');
    startCountdown('nakamoto-timer-classic', 'January 12, 2026 00:00:00');
    startCountdown('goddess-timer', 'January 12, 2026 00:00:00');
    startCountdown('goddess-timer-classic', 'January 12, 2026 00:00:00');

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Toggle current item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    // Floating CTA scroll logic
    const floatingCta = document.querySelector('.floating-mint-cta');
    const mintSection = document.querySelector('.mint-section');

    if (floatingCta && mintSection) {
        window.addEventListener('scroll', () => {
            const mintRect = mintSection.getBoundingClientRect();
            // Show button after user scrolls past the middle of the mint section
            if (mintRect.bottom < (window.innerHeight / 2)) {
                floatingCta.classList.add('active');
            } else {
                floatingCta.classList.remove('active');
            }
        });

        floatingCta.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Scroll Reveal Logic
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });
});
