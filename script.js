const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    const size = Math.min(window.innerWidth - 20, 400);
    canvas.width = size;
    canvas.height = size;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const box = 20;
let snake = [{ x: 5 * box, y: 5 * box }];
let food = randomPosition();
let bonusItems = [];
let obstacles = [];
let score = 0;
let level = 1;
let speed = 200;
let direction = null;
let gameInterval;

// Setup controls
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Touch buttons
document.getElementById("up").addEventListener("click", () => { if (direction !== "DOWN") direction = "UP"; });
document.getElementById("down").addEventListener("click", () => { if (direction !== "UP") direction = "DOWN"; });
document.getElementById("left").addEventListener("click", () => { if (direction !== "RIGHT") direction = "LEFT"; });
document.getElementById("right").addEventListener("click", () => { if (direction !== "LEFT") direction = "RIGHT"; });

// Swipe detection
let xDown = null;
let yDown = null;
canvas.addEventListener("touchstart", evt => {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}, false);

canvas.addEventListener("touchmove", evt => {
    if (!xDown || !yDown) return;
    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;
    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0 && direction !== "RIGHT") direction = "LEFT";
        else if (xDiff < 0 && direction !== "LEFT") direction = "RIGHT";
    } else {
        if (yDiff > 0 && direction !== "DOWN") direction = "UP";
        else if (yDiff < 0 && direction !== "UP") direction = "DOWN";
    }

    xDown = null;
    yDown = null;
}, false);

function randomPosition() {
    const cols = Math.floor(canvas.width / box);
    const rows = Math.floor(canvas.height / box);
    return { x: Math.floor(Math.random() * cols) * box, y: Math.floor(Math.random() * rows) * box };
}

function draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw obstacles
    ctx.fillStyle = "#555";
    obstacles.forEach(ob => ctx.fillRect(ob.x, ob.y, box, box));

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#4caf50" : "#8bc34a";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw bonus items
    bonusItems.forEach(item => {
        ctx.fillStyle = item.type === "gold" ? "gold" : "cyan";
        ctx.fillRect(item.x, item.y, box, box);
    });

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "UP") headY -= box;
    if (direction === "DOWN") headY += box;

    // Collision detection
    if (headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height || collision(headX, headY, snake) || collision(headX, headY, obstacles)) {
        clearInterval(gameInterval);
        saveLeaderboard(score);
        alert(`Game Over! Score: ${score}`);
        location.reload();
    }

    let newHead = { x: headX, y: headY };

    // Eating food
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

    // Bonus items
    bonusItems.forEach((item, index) => {
        if (headX === item.x && headY === item.y) {
            if (item.type === "gold") score += 5;
            if (item.type === "cyan") {
                if (snake.length > 1) snake.pop();
            }
            bonusItems.splice(index, 1);
        }
    });

    snake.unshift(newHead);

    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
    updateLeaderboardDisplay();
}

function collision(x, y, array) {
    for (let i = 0; i < array.length; i++) {
        if (x === array[i].x && y === array[i].y) return true;
    }
    return false;
}

function levelUp() {
    level++;
    speed = speed > 50 ? speed - 15 : speed;
    obstacles.push(randomPosition());
    clearInterval(gameInterval);
    gameInterval = setInterval(draw, speed);
}

// Leaderboard
function saveLeaderboard(score) {
    let leaders = JSON.parse(localStorage.getItem("snakeLeaderboard")) || [];
    leaders.push(score);
    leaders.sort((a, b) => b - a);
    leaders = leaders.slice(0, 5);
    localStorage.setItem("snakeLeaderboard", JSON.stringify(leaders));
}

function updateLeaderboardDisplay() {
    let leaders = JSON.parse(localStorage.getItem("snakeLeaderboard")) || [];
    const ol = document.getElementById("leaders");
    ol.innerHTML = "";
    leaders.forEach(score => {
        const li = document.createElement("li");
        li.textContent = score;
        ol.appendChild(li);
    });
}

gameInterval = setInterval(draw, speed);
