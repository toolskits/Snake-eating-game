const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

let food = { x: Math.floor(Math.random() * 20) * box, y: Math.floor(Math.random() * 20) * box };
let bonusFood = null;
let score = 0;
let level = 1;
let speed = 200;
let direction = null;
let gameInterval;

document.addEventListener("keydown", setDirection);
canvas.addEventListener("touchstart", handleTouchStart, false);
canvas.addEventListener("touchmove", handleTouchMove, false);

let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
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
}

function setDirection(event) {
    if (event.keyCode === 37 && direction !== "RIGHT") direction = "LEFT";
    else if (event.keyCode === 38 && direction !== "DOWN") direction = "UP";
    else if (event.keyCode === 39 && direction !== "LEFT") direction = "RIGHT";
    else if (event.keyCode === 40 && direction !== "UP") direction = "DOWN";
}

function draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#4caf50" : "#8bc34a";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "#111";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Draw bonus food occasionally
    if (bonusFood) {
        ctx.fillStyle = "gold";
        ctx.fillRect(bonusFood.x, bonusFood.y, box, box);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "UP") snakeY -= box;
    if (direction === "DOWN") snakeY += box;

    // Check collision with walls
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(snakeX, snakeY, snake)) {
        clearInterval(gameInterval);
        alert(`Game Over! Your Score: ${score}`);
        location.reload();
    }

    let newHead = { x: snakeX, y: snakeY };

    // Eating food
    if (snakeX === food.x && snakeY === food.y) {
        score++;
        if (score % 5 === 0) levelUp();
        food = {
            x: Math.floor(Math.random() * 20) * box,
            y: Math.floor(Math.random() * 20) * box
        };

        // Bonus food chance
        if (Math.random() < 0.2) {
            bonusFood = {
                x: Math.floor(Math.random() * 20) * box,
                y: Math.floor(Math.random() * 20) * box
            };
        }
    } else if (bonusFood && snakeX === bonusFood.x && snakeY === bonusFood.y) {
        score += 5;
        bonusFood = null;
    } else {
        snake.pop();
    }

    snake.unshift(newHead);

    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
}

function collision(x, y, array) {
    for (let i = 0; i < array.length; i++) {
        if (x === array[i].x && y === array[i].y) return true;
    }
    return false;
}

function levelUp() {
    level++;
    speed = speed > 50 ? speed - 15 : speed; // Increase speed
    clearInterval(gameInterval);
    gameInterval = setInterval(draw, speed);
}

// Start the game
gameInterval = setInterval(draw, speed);