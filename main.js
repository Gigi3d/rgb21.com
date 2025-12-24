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
        this.initSplashScreen();
    }

    initSplashScreen() {
        // Ensure splash screen stays for at least 800ms for premium feel
        const minLoadTime = 800;
        const startLoad = Date.now();

        window.addEventListener('load', () => {
            const elapsed = Date.now() - startLoad;
            const remaining = Math.max(0, minLoadTime - elapsed);

            setTimeout(() => {
                const splash = document.getElementById('splash-screen');
                if (splash) {
                    splash.classList.add('hidden');

                    // Trigger hero animations after splash fade
                    setTimeout(() => {
                        document.querySelectorAll('.hero-section, .navbar, .mint-section').forEach(el => {
                            el.classList.add('active'); // Ensure they are visible
                        });
                    }, 400);
                }
            }, remaining);
        });
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
        // Update standard elements
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            let translation = translations[this.currentLang] && translations[this.currentLang][key];

            if (translation) {
                const vars = el.getAttribute('data-i18n-vars');
                if (vars) {
                    try {
                        const varObj = JSON.parse(vars.replace(/'/g, '"'));
                        Object.keys(varObj).forEach(vKey => {
                            translation = translation.replace(`{${vKey}}`, varObj[vKey]);
                        });
                    } catch (e) {
                        console.error('Error parsing data-i18n-vars:', e);
                    }
                }
                el.innerHTML = translation;
            }
        });

        // Update attributes (placeholders, alt text, title, etc.)
        const attrElements = document.querySelectorAll('[data-i18n-attr]');
        attrElements.forEach(el => {
            const attrData = el.getAttribute('data-i18n-attr');
            if (!attrData) return;

            attrData.split(',').forEach(part => {
                const [attr, key] = part.split(':').map(s => s.trim());
                const translation = translations[this.currentLang] && translations[this.currentLang][key];
                if (translation) {
                    el.setAttribute(attr, translation);
                }
            });
        });

        // Update meta tags and title
        this.updateMetaTags();
    }

    updateMetaTags() {
        const langData = translations[this.currentLang];
        if (!langData) return;

        // Determine Page Context
        const isNakamoto = document.body.classList.contains('mode-nakamoto-goat');
        const isSpace = document.body.classList.contains('mode-space-goat');
        const isQueen = document.body.classList.contains('mode-queen-goat');
        const isRGB21 = document.body.classList.contains('mode-rgb21-overview');
        const isIndex = document.body.classList.contains('mode-index');

        let titleKey = 'meta_title_base';
        let descKey = 'meta_description';

        if (isNakamoto) titleKey = 'meta_title_nakamoto';
        else if (isSpace) titleKey = 'meta_title_space';
        else if (isQueen) titleKey = 'meta_title_queen';
        else if (isRGB21) {
            titleKey = 'meta_title_rgb21';
            descKey = 'rgb21_meta_desc';
        } else if (isIndex) {
            titleKey = 'meta_title_nakamoto';
            descKey = 'meta_description';
        }

        if (langData[titleKey]) {
            document.title = langData[titleKey];
            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', langData[titleKey]);
            const twTitle = document.querySelector('meta[property="twitter:title"]');
            if (twTitle) twTitle.setAttribute('content', langData[titleKey]);
        }

        if (langData[descKey]) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) metaDesc.setAttribute('content', langData[descKey]);
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', langData[descKey]);
            const twDesc = document.querySelector('meta[property="twitter:description"]');
            if (twDesc) twDesc.setAttribute('content', langData[descKey]);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Logic - Priority Execution
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');


    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling issues
            const isActive = menuToggle.classList.contains('active');

            if (isActive) {
                // Close Menu
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                navLinks.style.right = '-100%';
            } else {
                // Open Menu
                menuToggle.classList.add('active');
                navLinks.classList.add('active');
                document.body.classList.add('menu-open');
                navLinks.style.right = '1rem'; // Match CSS
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                navLinks.style.right = '-100%';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('menu-open') &&
                !navLinks.contains(e.target) &&
                !menuToggle.contains(e.target)) {

                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
                navLinks.style.right = '-100%';
            }
        });
    }

    const langManager = new LanguageManager();

    // ... (keep the rest of the existing logic) ...




    // Atomic Mint button clicks
    const mintButtons = document.querySelectorAll('.mint-btn:not(.disabled), .whitelist-btn, .floating-mint-cta');

    const showSuccessModal = () => {
        const modal = document.getElementById('success-modal');
        if (!modal) return;

        // Populate Twitter link
        const shareLink = document.getElementById('share-x-link');
        if (shareLink) {
            const currentGoat = document.body.classList.contains('mode-nakamoto-goat') ? 'Nakamoto GOAT' :
                document.body.classList.contains('mode-space-goat') ? 'Space GOAT' : 'Queen GOAT';
            const text = encodeURIComponent(`I just summoned my ${currentGoat} on Bitcoin Season 3! 🚀\n\nThe GOATs are arriving via RGB Inscriptions. \n\n#BitcoinSeason3 #RGB #GOAT #BitcoinNative @DIBA_utxo`);
            const url = encodeURIComponent(window.location.href);
            shareLink.href = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        }

        modal.classList.add('active');

        // Create Confetti
        const modalContent = modal.querySelector('.modal-content');
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = ['#fbbf24', '#fcd34d', '#ffffff'][Math.floor(Math.random() * 3)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.width = Math.random() * 8 + 4 + 'px';
            confetti.style.height = confetti.style.width;
            modalContent.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    };

    mintButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Redirect to diba.io
            window.open('https://diba.io', '_blank');
        });
    });

    const closeBtn = document.getElementById('close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('success-modal').classList.remove('active');
        });
    }

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

    startCountdown('space-goat-timer', 'January 21, 2026 00:00:00');
    startCountdown('space-goat-timer-classic', 'January 21, 2026 00:00:00');
    startCountdown('space-goat-wl-timer', 'January 21, 2026 00:00:00');
    startCountdown('space-goat-wl-timer-classic', 'January 21, 2026 00:00:00');
    startCountdown('nakamoto-timer', 'January 21, 2026 00:00:00');
    startCountdown('nakamoto-timer-classic', 'January 21, 2026 00:00:00');
    startCountdown('queen-timer', 'January 12, 2026 00:00:00');
    startCountdown('queen-timer-classic', 'January 12, 2026 00:00:00');

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
