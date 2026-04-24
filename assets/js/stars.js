// ============================================================
// STARS BACKGROUND — Enhanced version
// ============================================================
const canvas = document.getElementById('stars-bg');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    initStars();
});

// ---- Config ------------------------------------------------
const CONFIG = {
    STAR_COUNT: 220,
    SHOOTING_STAR_INTERVAL: 3200,   // ms between shooting stars
    PARALLAX_STRENGTH: 0.018,        // mouse parallax factor
    NEBULA_OPACITY: 0.13,
};

// ---- Star colours -----------------------------------------
const STAR_COLORS = [
    { r: 255, g: 255, b: 255 },   // pure white
    { r: 200, g: 220, b: 255 },   // cold blue-white
    { r: 255, g: 240, b: 210 },   // warm yellow-white
    { r: 180, g: 210, b: 255 },   // blue
    { r: 255, g: 255, b: 230 },   // cream
];

// ---- Layers (depth simulation) ----------------------------
// 0 = far (small, slow), 1 = mid, 2 = near (larger, faster twinkle)
const LAYER_CONFIG = [
    { count: 130, minR: 0.3, maxR: 0.9,  minSpeed: 0.005, maxSpeed: 0.015, parallax: 0.3 },
    { count: 60,  minR: 0.8, maxR: 1.6,  minSpeed: 0.012, maxSpeed: 0.025, parallax: 0.6 },
    { count: 30,  minR: 1.4, maxR: 2.6,  minSpeed: 0.020, maxSpeed: 0.040, parallax: 1.0 },
];

let stars = [];
let shootingStars = [];
let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;

// ---- Star factory -----------------------------------------
function makeStar(layer, layerIdx) {
    const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    return {
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       layer.minR + Math.random() * (layer.maxR - layer.minR),
        phase:   Math.random() * Math.PI * 2,
        speed:   layer.minSpeed + Math.random() * (layer.maxSpeed - layer.minSpeed),
        parallax: layer.parallax,
        color,
        // glow only on larger stars
        glow:    Math.random() < 0.18,
    };
}

function initStars() {
    stars = [];
    LAYER_CONFIG.forEach((layer, idx) => {
        for (let i = 0; i < layer.count; i++) {
            stars.push(makeStar(layer, idx));
        }
    });
}
initStars();

// ---- Shooting star factory --------------------------------
function makeShootingStar() {
    const angle = (Math.random() * 40 + 15) * Math.PI / 180; // 15°–55° downward
    const speed = 6 + Math.random() * 8;
    const len   = 120 + Math.random() * 180;
    // start from top-right quadrant area
    const startX = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    const startY = Math.random() * canvas.height * 0.3;
    return {
        x: startX, y: startY,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        len, alpha: 0, fadeIn: true,
        life: 0, maxLife: len / speed * 1.6,
        r: 0.8 + Math.random() * 0.8,
    };
}

// Spawn shooting stars periodically
setInterval(() => {
    if (Math.random() < 0.65) shootingStars.push(makeShootingStar());
}, CONFIG.SHOOTING_STAR_INTERVAL);

// ---- Mouse parallax ---------------------------------------
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// ---- Nebula background ------------------------------------
function drawNebula() {
    const cx = canvas.width  * 0.5;
    const cy = canvas.height * 0.4;

    // Large central glow
    const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.55);
    g1.addColorStop(0,   `rgba(37, 60, 120, ${CONFIG.NEBULA_OPACITY})`);
    g1.addColorStop(0.5, `rgba(20, 30, 70,  ${CONFIG.NEBULA_OPACITY * 0.5})`);
    g1.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Secondary subtle glow — bottom left
    const cx2 = canvas.width  * 0.2;
    const cy2 = canvas.height * 0.75;
    const g2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, canvas.width * 0.3);
    g2.addColorStop(0,   `rgba(60, 30, 100, ${CONFIG.NEBULA_OPACITY * 0.7})`);
    g2.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ---- Draw one star ----------------------------------------
function drawStar(star) {
    const px = star.x + (mouseX - canvas.width  / 2) * CONFIG.PARALLAX_STRENGTH * star.parallax;
    const py = star.y + (mouseY - canvas.height / 2) * CONFIG.PARALLAX_STRENGTH * star.parallax;

    star.phase += star.speed;
    const alpha = 0.35 + 0.65 * Math.abs(Math.sin(star.phase));

    const { r, g, b } = star.color;

    // Optional glow halo on bigger stars
    if (star.glow && star.r > 1.2) {
        const grd = ctx.createRadialGradient(px, py, 0, px, py, star.r * 5);
        grd.addColorStop(0,   `rgba(${r},${g},${b},${alpha * 0.4})`);
        grd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, star.r * 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Core
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(px, py, star.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
}

// ---- Draw shooting star -----------------------------------
function drawShootingStar(s) {
    s.life++;
    // fade in / fade out
    if (s.fadeIn) {
        s.alpha = Math.min(1, s.alpha + 0.08);
        if (s.alpha >= 1) s.fadeIn = false;
    } else {
        s.alpha = Math.max(0, 1 - (s.life / s.maxLife));
    }

    const tailX = s.x - s.dx * (s.len / (s.dx * s.maxLife / s.r)) * 8;
    const tailY = s.y - s.dy * (s.len / (s.dy * s.maxLife / s.r)) * 8;

    const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
    grad.addColorStop(0,   'rgba(255,255,255,0)');
    grad.addColorStop(0.7, `rgba(200,220,255,${s.alpha * 0.5})`);
    grad.addColorStop(1,   `rgba(255,255,255,${s.alpha})`);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = grad;
    ctx.lineWidth   = s.r;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();

    // Bright head dot
    ctx.globalAlpha = s.alpha;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    s.x += s.dx;
    s.y += s.dy;
}

// ---- Main loop -------------------------------------------
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawNebula();

    // Randomly reset phase for natural twinkling variation
    for (let star of stars) {
        if (Math.random() < 0.003) star.phase = Math.random() * Math.PI * 2;
        drawStar(star);
    }

    ctx.globalAlpha = 1;

    // Shooting stars
    shootingStars = shootingStars.filter(s => s.life < s.maxLife);
    for (let s of shootingStars) drawShootingStar(s);

    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
}
animate();
