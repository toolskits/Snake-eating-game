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

    // --- START OF FIX ---
    // Only move and check collisions if a direction has been set
    if (direction) {
        let headX = snake[0].x;
        let headY = snake[0].y;

        if (direction === "LEFT") headX -= box;
        if (direction === "RIGHT") headX += box;
        if (direction === "UP") headY -= box;
        if (direction === "DOWN") headY += box;

        // Collision detection
        if (headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height || 
            collision(headX, headY, snake) || collision(headX, headY, obstacles)) {
            clearInterval(gameInterval);
            saveLeaderboard(score);
            alert(`Game Over! Score: ${score}`);
            location.reload();
            return; // Stop the rest of the function
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
    }
    // --- END OF FIX ---

    document.getElementById("score").innerText = score;
    document.getElementById("level").innerText = level;
    updateLeaderboardDisplay();
}
