const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startMenu = document.getElementById("start-menu");
const startBtn = document.getElementById("start-btn");
const menuTitle = document.getElementById("menu-title");

const box = 20;
let snake, food, bonusItems, obstacles, score, level, speed, direction, gameInterval;

function resizeCanvas() {
    const rawSize = Math.min(window.innerWidth - 40, 400);
    const size = Math.floor(rawSize / box) * box; // Grid snapping fix
    canvas.width = size;
    canvas.height = size;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function init() {
    snake = [{ x: 5 * box, y: 5 * box }];
    food = randomPosition();
    bonusItems = [];
    obstacles = [];
    score = 0;
    level = 1;
    speed = 200;
    direction = null; // Game won't move until a key is pressed
    
    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
    updateLeaderboardDisplay();
}

function startGame() {
    init();
    startMenu.style.display = "none";
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(draw, speed);
}

startBtn.addEventListener("click", startGame);

// Controls
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Touch Buttons
document.getElementById("up").onclick = () => { if (direction !== "DOWN") direction = "UP"; };
document.getElementById("down").onclick = () => { if (direction !== "UP") direction = "DOWN"; };
document.getElementById("left").onclick = () => { if (direction !== "RIGHT") direction = "LEFT"; };
document.getElementById("right").onclick = () => { if (direction !== "LEFT") direction = "RIGHT"; };

function randomPosition() {
    const cols = Math.floor(canvas.width / box);
    const rows = Math.floor(canvas.height / box);
    return { 
        x: Math.floor(Math.random() * cols) * box, 
        y: Math.floor(Math.random() * rows) * box 
    };
}

function collision(x, y, array) {
    return array.some(segment => x === segment.x && y === segment.y);
}

function levelUp() {
    level++;
    speed = Math.max(50, speed - 15);
    obstacles.push(randomPosition());
    clearInterval(gameInterval);
    gameInterval = setInterval(draw, speed);
}

function draw() {
    // Clear Background
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Obstacles
    ctx.fillStyle = "#555";
    obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, box, box));

    // Draw Food
    ctx.fillStyle = "#ff4444";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw Bonus
    bonusItems.forEach(item => {
        ctx.fillStyle = item.type === "gold" ? "gold" : "cyan";
        ctx.fillRect(item.x, item.y, box, box);
    });

    // Draw Snake
    snake.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? "#4caf50" : "#8bc34a";
        ctx.fillRect(part.x, part.y, box, box);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(part.x, part.y, box, box);
    });

    // --- MOVEMENT & COLLISION ---
    if (direction) {
        let headX = snake[0].x;
        let headY = snake[0].y;

        if (direction === "LEFT") headX -= box;
        if (direction === "RIGHT") headX += box;
        if (direction === "UP") headY -= box;
        if (direction === "DOWN") headY += box;

        // Check Death
        if (headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height || 
            collision(headX, headY, snake) || collision(headX, headY, obstacles)) {
            
            clearInterval(gameInterval);
            saveLeaderboard(score);
            menuTitle.innerText = `Game Over! Score: ${score}`;
            startBtn.innerText = "RETRY";
            startMenu.style.display = "flex";
            return;
        }

        let newHead = { x: headX, y: headY };

        // Eat Food
        if (headX === food.x && headY === food.y) {
            score++;
            if (score % 5 === 0) levelUp();
            food = randomPosition();
            if (Math.random() < 0.3) {
                bonusItems.push({ ...randomPosition(), type: Math.random() < 0.5 ? "gold" : "cyan" });
            }
        } else {
            snake.pop();
        }

        // Bonus logic
        bonusItems.forEach((item, index) => {
            if (headX === item.x && headY === item.y) {
                if (item.type === "gold") score += 5;
                if (item.type === "cyan" && snake.length > 1) snake.pop();
                bonusItems.splice(index, 1);
            }
        });

        snake.unshift(newHead);
    }

    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
}

// Leaderboard Logic
function saveLeaderboard(s) {
    let leaders = JSON.parse(localStorage.getItem("snakeLeaders")) || [];
    leaders.push(s);
    leaders.sort((a, b) => b - a);
    localStorage.setItem("snakeLeaders", JSON.stringify(leaders.slice(0, 5)));
    updateLeaderboardDisplay();
}

function updateLeaderboardDisplay() {
    let leaders = JSON.parse(localStorage.getItem("snakeLeaders")) || [];
    const ol = document.getElementById("leaders");
    ol.innerHTML = leaders.map(s => `<li>${s}</li>`).join("");
}

// Initialize UI but don't start loop yet
init();
