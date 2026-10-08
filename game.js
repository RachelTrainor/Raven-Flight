
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startButton = document.getElementById("startButton");

const soulsDisplay = document.getElementById("souls");
const distanceDisplay = document.getElementById("distance");
const bestDisplay = document.getElementById("best");

const groundY = H - 45;

let state = "menu";
let rising = false;
let frame = 0;
let distance = 0;
let souls = 0;
let speed = 3;
let obstacles = [];
let collectibles = [];
let particles = [];

let best = Number(localStorage.getItem("ravenFlightBest")) || 0;
bestDisplay.textContent = best;

const raven = {
    x: 170,
    y: 220,
    width: 42,
    height: 30,
    velocity: 0,
    flap: 0
};

function resetGame() {
    raven.y = 220;
    raven.velocity = 0;

    frame = 0;
    distance = 0;
    souls = 0;
    speed = 3;

    obstacles = [];
    collectibles = [];
    particles = [];

    rising = false;

    updateHUD();
}

function startGame() {
    resetGame();
    state = "playing";
    overlay.classList.add("hidden");
}

function endGame() {
    state = "gameover";
    rising = false;

    const score = Math.floor(distance);

    if (score > best) {
        best = score;
        localStorage.setItem("ravenFlightBest", best);
    }

    updateHUD();

    overlayTitle.textContent = "THE FOREST CLAIMED YOU";
    overlayText.innerHTML =
        `Distance traveled: ${score}<br>Lost souls gathered: ${souls}<br>Will you fly again?`;

    startButton.textContent = "FLY AGAIN";
    overlay.classList.remove("hidden");
}

function togglePause() {
    if (state === "playing") {
        state = "paused";
        rising = false;
        overlayTitle.textContent = "FLIGHT PAUSED";
        overlayText.textContent = "The forest waits for your return.";
        startButton.textContent = "RESUME FLIGHT";
        overlay.classList.remove("hidden");
    } else if (state === "paused") {
        state = "playing";
        overlay.classList.add("hidden");
    }
}

function updateHUD() {
    soulsDisplay.textContent = souls;
    distanceDisplay.textContent = Math.floor(distance);
    bestDisplay.textContent = best;
}

function spawnObstacle() {
    const gap = 180;
    const topHeight = 75 + Math.random() * 190;

    obstacles.push({
        x: W + 50,
        width: 65,
        top: topHeight,
        bottom: topHeight + gap
    });

    if (Math.random() < 0.85) {
        collectibles.push({
            x: W + 82,
            y: topHeight + gap / 2,
            radius: 10,
            collected: false,
            phase: Math.random() * Math.PI * 2
        });
    }
}

function drawBackground() {
    ctx.fillStyle = "#171b2d";
    ctx.fillRect(0, 0, W, H);

    // Moon
    ctx.fillStyle = "#d5d0dc";
    ctx.beginPath();
    ctx.arc(710, 105, 48, 0, Math.PI * 2);
    ctx.fill();

    // Moon glow
    ctx.fillStyle = "rgba(180,170,210,.08)";
    ctx.beginPath();
    ctx.arc(710, 105, 85, 0, Math.PI * 2);
    ctx.fill();

    // Stars
    for (let i = 0; i < 55; i++) {
        const x = (i * 137 + 39) % W;
        const y = (i * 71 + 23) % 280;

        ctx.fillStyle = i % 3 === 0 ? "#b5a7ce" : "#77778f";
        ctx.fillRect(x, y, 2, 2);
    }

    // Distant forest
    const offset = (frame * speed * 0.12) % 100;

    for (let i = -1; i < 12; i++) {
        const x = i * 100 - offset;

        ctx.fillStyle = "#202538";
        ctx.fillRect(x + 35, 240, 20, 220);

        ctx.fillStyle = "#252b3e";
        ctx.beginPath();
        ctx.moveTo(x - 5, 300);
        ctx.lineTo(x + 45, 130);
        ctx.lineTo(x + 95, 300);
        ctx.fill();
    }

    // Fog
    ctx.fillStyle = "rgba(145,130,175,.08)";
    ctx.fillRect(0, 330, W, 80);

    // Ground
    ctx.fillStyle = "#171b20";
    ctx.fillRect(0, groundY, W, H - groundY);

    ctx.fillStyle = "#35394a";
    ctx.fillRect(0, groundY, W, 5);

    // Grass
    for (let i = 0; i < 60; i++) {
        const x = (i * 31 - frame * speed * 0.6) % W;
        const px = (x + W) % W;

        ctx.fillStyle = "#343f3b";
        ctx.fillRect(px, groundY - 6, 3, 8);
    }
}

function drawRaven() {
    const x = Math.round(raven.x);
    const y = Math.round(raven.y);

    raven.flap += 0.25;

    const wing = Math.sin(raven.flap) * 11;

    // Tail
    ctx.fillStyle = "#080a10";
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 17);
    ctx.lineTo(x - 18, y + 6);
    ctx.lineTo(x - 8, y + 25);
    ctx.fill();

    // Wing
    ctx.fillStyle = "#252334";
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 12);
    ctx.lineTo(x - 5, y - 15 + wing);
    ctx.lineTo(x + 5, y + 23);
    ctx.fill();

    // Body
    ctx.fillStyle = "#101018";
    ctx.fillRect(x, y + 6, 35, 22);

    ctx.fillStyle = "#20202c";
    ctx.fillRect(x + 8, y + 9, 22, 13);

    // Head
    ctx.fillStyle = "#0b0b13";
    ctx.fillRect(x + 25, y, 22, 22);

    // Beak
    ctx.fillStyle = "#756b69";
    ctx.beginPath();
    ctx.moveTo(x + 47, y + 10);
    ctx.lineTo(x + 60, y + 14);
    ctx.lineTo(x + 47, y + 17);
    ctx.fill();

    // Eye
    ctx.fillStyle = "#c8a6f0";
    ctx.fillRect(x + 38, y + 6, 4, 4);
}

function drawTree(x, top, bottom, width) {
    // Upper trunk
    ctx.fillStyle = "#11131a";
    ctx.fillRect(x, 0, width, top);

    ctx.fillStyle = "#292634";
    ctx.fillRect(x + 10, 0, 8, top);

    // Upper branches
    ctx.fillStyle = "#11131a";
    ctx.beginPath();
    ctx.moveTo(x, top - 55);
    ctx.lineTo(x - 28, top - 15);
    ctx.lineTo(x, top - 27);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + width, top - 75);
    ctx.lineTo(x + width + 25, top - 25);
    ctx.lineTo(x + width, top - 35);
    ctx.fill();

    // Lower trunk
    ctx.fillStyle = "#11131a";
    ctx.fillRect(x, bottom, width, groundY - bottom);

    ctx.fillStyle = "#292634";
    ctx.fillRect(x + 10, bottom, 8, groundY - bottom);

    // Lower branches
    ctx.fillStyle = "#11131a";
    ctx.beginPath();
    ctx.moveTo(x, bottom + 45);
    ctx.lineTo(x - 28, bottom + 10);
    ctx.lineTo(x, bottom + 20);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + width, bottom + 65);
    ctx.lineTo(x + width + 30, bottom + 15);
    ctx.lineTo(x + width, bottom + 25);
    ctx.fill();
}

function drawSoul(soul) {
    const y = soul.y + Math.sin(frame * 0.06 + soul.phase) * 5;

    ctx.fillStyle = "rgba(137,220,202,.15)";
    ctx.beginPath();
    ctx.arc(soul.x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8bdcc7";
    ctx.beginPath();
    ctx.arc(soul.x, y, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e3fff3";
    ctx.fillRect(soul.x - 2, y - 3, 4, 4);
}

function createParticles(x, y) {
    for (let i = 0; i < 12; i++) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            life: 25
        });
    }
}

function updateParticles() {
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        ctx.fillStyle = `rgba(145,230,205,${p.life / 25})`;
        ctx.fillRect(p.x, p.y, 4, 4);
    }

    particles = particles.filter(p => p.life > 0);
}

function collision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function updateGame() {
    frame++;

    speed = Math.min(6, 3 + distance / 1500);
    distance += speed * 0.045;

    // Faster free-flight physics
    if (rising) {
        raven.velocity -= 0.75;
    } else {
        raven.velocity += 0.45;
    }

    raven.velocity = Math.max(-15, Math.min(15, raven.velocity));
    raven.y += raven.velocity;

    if (raven.y < 0 || raven.y + raven.height > groundY) {
        endGame();
        return;
    }

    if (frame % 115 === 0) {
        spawnObstacle();
    }

    for (const obstacle of obstacles) {
        obstacle.x -= speed;

        const topBox = {
            x: obstacle.x,
            y: 0,
            width: obstacle.width,
            height: obstacle.top
        };

        const bottomBox = {
            x: obstacle.x,
            y: obstacle.bottom,
            width: obstacle.width,
            height: groundY - obstacle.bottom
        };

        const ravenBox = {
            x: raven.x + 5,
            y: raven.y + 3,
            width: 39,
            height: 25
        };

        if (collision(ravenBox, topBox) || collision(ravenBox, bottomBox)) {
            endGame();
            return;
        }
    }

    for (const soul of collectibles) {
        soul.x -= speed;

        const dx = soul.x - (raven.x + 25);
        const dy = soul.y - (raven.y + 15);

        if (Math.sqrt(dx * dx + dy * dy) < 28) {
            souls++;
            soul.collected = true;
            createParticles(soul.x, soul.y);
        }
    }

    obstacles = obstacles.filter(o => o.x + o.width > -50);
    collectibles = collectibles.filter(s => s.x > -30 && !s.collected);

    updateHUD();
}

function render() {
    drawBackground();

    for (const obstacle of obstacles) {
        drawTree(obstacle.x, obstacle.top, obstacle.bottom, obstacle.width);
    }

    for (const soul of collectibles) {
        drawSoul(soul);
    }

    drawRaven();
    updateParticles();
}

function gameLoop() {
    if (state === "playing") {
        updateGame();
    }

    render();
    requestAnimationFrame(gameLoop);
}

startButton.addEventListener("click", () => {
    if (state === "paused") {
        togglePause();
    } else {
        startGame();
    }
});

document.addEventListener("keydown", e => {
    if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        rising = true;
    }

    if (e.code === "KeyP" && !e.repeat) {
        togglePause();
    }
});

document.addEventListener("keyup", e => {
    if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
        rising = false;
    }
});

canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (state === "playing") rising = true;
});

window.addEventListener("pointerup", () => {
    rising = false;
});

window.addEventListener("blur", () => {
    rising = false;
    if (state === "playing") togglePause();
});

gameLoop();
