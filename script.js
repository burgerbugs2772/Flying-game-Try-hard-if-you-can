document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const player = document.getElementById('player');
    const scoreElement = document.getElementById('score');
    const gameOverElement = document.getElementById('game-over');
    
    let playerY = 300;
    let gravity = 0.5;
    let velocity = 0;
    let gameSpeed = 2;
    let score = 0;
    let gameRunning = true;
    let obstacles = [];
    let obstacleFrequency = 1500; // milliseconds
    let lastObstacleTime = 0;
    
    // Initialize player position
    player.style.top = playerY + 'px';
    
    // Game loop
    function gameLoop(timestamp) {
        if (!gameRunning) return;
        
        // Apply gravity
        velocity += gravity;
        playerY += velocity;
        player.style.top = playerY + 'px';
        
        // Check for collisions with top/bottom
        if (playerY <= 0 || playerY >= gameContainer.offsetHeight - player.offsetHeight) {
            endGame();
        }
        
        // Generate obstacles
        if (timestamp - lastObstacleTime > obstacleFrequency) {
            createObstacle();
            lastObstacleTime = timestamp;
        }
        
        // Move obstacles
        moveObstacles();
        
        // Check for collisions with obstacles
        checkCollisions();
        
        requestAnimationFrame(gameLoop);
    }
    
    function createObstacle() {
        const obstacleTop = document.createElement('div');
        const obstacleBottom = document.createElement('div');
        
        obstacleTop.className = 'obstacle';
        obstacleBottom.className = 'obstacle';
        
        // Random gap position
        const gapPosition = Math.random() * (gameContainer.offsetHeight - 200) + 50;
        const gapHeight = 150; // Space between top and bottom obstacles
        
        // Top obstacle
        obstacleTop.style.height = gapPosition + 'px';
        obstacleTop.style.top = '0';
        
        // Bottom obstacle
        obstacleBottom.style.height = (gameContainer.offsetHeight - gapPosition - gapHeight) + 'px';
        obstacleBottom.style.bottom = '0';
        
        gameContainer.appendChild(obstacleTop);
        gameContainer.appendChild(obstacleBottom);
        
        obstacles.push({
            element: obstacleTop,
            x: gameContainer.offsetWidth,
            width: 60,
            height: gapPosition,
            passed: false
        });
        
        obstacles.push({
            element: obstacleBottom,
            x: gameContainer.offsetWidth,
            width: 60,
            height: gameContainer.offsetHeight - gapPosition - gapHeight,
            passed: false
        });
    }
    
    function moveObstacles() {
        obstacles.forEach(obstacle => {
            obstacle.x -= gameSpeed;
            obstacle.element.style.left = obstacle.x + 'px';
            
            // Remove obstacles that are off screen
            if (obstacle.x + obstacle.width < 0) {
                obstacle.element.remove();
                obstacles = obstacles.filter(o => o !== obstacle);
            }
            
            // Score when player passes an obstacle pair
            if (!obstacle.passed && obstacle.x + obstacle.width < player.offsetLeft) {
                obstacle.passed = true;
                score++;
                scoreElement.textContent = 'Score: ' + score;
                
                // Increase difficulty
                if (score % 5 === 0) {
                    gameSpeed += 0.5;
                    obstacleFrequency = Math.max(800, obstacleFrequency - 100);
                }
            }
        });
    }
    
    function checkCollisions() {
        const playerRect = player.getBoundingClientRect();
        
        obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.element.getBoundingClientRect();
            
            if (
                playerRect.right > obstacleRect.left &&
                playerRect.left < obstacleRect.right &&
                playerRect.bottom > obstacleRect.top &&
                playerRect.top < obstacleRect.bottom
            ) {
                endGame();
            }
        });
    }
    
    function endGame() {
        gameRunning = false;
        gameOverElement.style.display = 'block';
    }
    
    function restartGame() {
        // Clear obstacles
        obstacles.forEach(obstacle => obstacle.element.remove());
        obstacles = [];
        
        // Reset player
        playerY = 300;
        velocity = 0;
        player.style.top = playerY + 'px';
        
        // Reset game state
        score = 0;
        gameSpeed = 2;
        obstacleFrequency = 1500;
        scoreElement.textContent = 'Score: 0';
        gameOverElement.style.display = 'none';
        gameRunning = true;
        
        // Restart game loop
        lastObstacleTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
    
    // Controls
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameRunning) {
                restartGame();
            } else {
                velocity = -10; // Jump/flap
            }
        }
    });
    
    // Touch controls for mobile
    gameContainer.addEventListener('click', () => {
        if (!gameRunning) {
            restartGame();
        } else {
            velocity = -10;
        }
    });
    
    // Start the game
    lastObstacleTime = performance.now();
    requestAnimationFrame(gameLoop);
});