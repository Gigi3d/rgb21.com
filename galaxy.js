function generateStars(n) {
    let value = '';
    for (let i = 0; i < n; i++) {
        value += `${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #FFF, `;
    }
    return value.slice(0, -2);
}

function createShootingStars() {
    const container = document.getElementById('shooting-stars');
    if (!container) return;

    setInterval(() => {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2000}ms`;
        star.style.animationDuration = `${2000 + Math.random() * 4000}ms`;
        container.appendChild(star);
        setTimeout(() => star.remove(), 6000);
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    const s1 = document.getElementById('stars');
    const s2 = document.getElementById('stars2');
    const s3 = document.getElementById('stars3');

    if (s1) s1.style.boxShadow = generateStars(700);
    if (s2) s2.style.boxShadow = generateStars(200);
    if (s3) s3.style.boxShadow = generateStars(100);

    createShootingStars();
});
