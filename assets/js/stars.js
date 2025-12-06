// Fondo animado de estrellas
const canvas = document.getElementById('stars-bg');
const ctx = canvas.getContext('2d');
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const STAR_COUNT = 120;
const stars = [];
function randomStar() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
    };
}
for (let i = 0; i < STAR_COUNT; i++) stars.push(randomStar());

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let star of stars) {
        star.phase += star.speed;
        star.alpha = 0.5 + 0.5 * Math.sin(star.phase);
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
setInterval(() => {
    // Aleatoriamente "apaga" y "enciende" estrellas cambiando su fase
    for (let star of stars) {
        if (Math.random() < 0.01) star.phase = Math.random() * Math.PI * 2;
    }
}, 300);
function animate() {
    drawStars();
    requestAnimationFrame(animate);
}
animate();