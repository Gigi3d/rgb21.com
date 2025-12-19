document.addEventListener('DOMContentLoaded', () => {
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
});
