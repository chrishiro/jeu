// Snake Game Implementation

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameRunning = false;
        this.gameSpeed = 150;
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadHighScore();
    }
    
    initializeGame() {
        this.generateFood();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.getElementById('startBtn').addEventListener('click', this.startGame.bind(this));
        document.getElementById('restartBtn').addEventListener('click', this.restartGame.bind(this));
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;
        
        const keyPressed = e.keyCode;
        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingRight = this.dx === 1;
        const goingLeft = this.dx === -1;
        
        if (keyPressed === LEFT_KEY && !goingRight) {
            this.dx = -1;
            this.dy = 0;
        }
        if (keyPressed === UP_KEY && !goingDown) {
            this.dx = 0;
            this.dy = -1;
        }
        if (keyPressed === RIGHT_KEY && !goingLeft) {
            this.dx = 1;
            this.dy = 0;
        }
        if (keyPressed === DOWN_KEY && !goingUp) {
            this.dx = 0;
            this.dy = 1;
        }
    }
    
    startGame() {
        this.gameRunning = true;
        document.getElementById('gameOverlay').style.display = 'none';
        this.gameLoop();
    }
    
    restartGame() {
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.gameSpeed = 150;
        this.generateFood();
        this.updateDisplay();
        this.startGame();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        setTimeout(() => {
            this.clearCanvas();
            this.moveSnake();
            this.drawFood();
            this.drawSnake();
            
            if (this.checkGameEnd()) {
                this.endGame();
                return;
            }
            
            this.gameLoop();
        }, this.gameSpeed);
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    moveSnake() {
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        this.snake.unshift(head);
        
        const didEatFood = this.snake[0].x === this.food.x && this.snake[0].y === this.food.y;
        if (didEatFood) {
            this.score += 10;
            this.updateDisplay();
            this.generateFood();
            
            // Increase speed slightly
            if (this.gameSpeed > 80) {
                this.gameSpeed -= 2;
            }
        } else {
            this.snake.pop();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#4CAF50';
            } else {
                // Body
                this.ctx.fillStyle = '#45a049';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize, 
                segment.y * this.gridSize, 
                this.gridSize - 2, 
                this.gridSize - 2
            );
            
            // Add some styling to the head
            if (index === 0) {
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 2, 
                    segment.y * this.gridSize + 2, 
                    this.gridSize - 6, 
                    this.gridSize - 6
                );
            }
        });
    }
    
    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * this.tileCount),
            y: Math.floor(Math.random() * this.tileCount)
        };
        
        // Make sure food doesn't spawn on snake
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                return;
            }
        }
    }
    
    drawFood() {
        this.ctx.fillStyle = '#FF5722';
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 2, 
            this.gridSize - 2
        );
        
        // Add apple-like appearance
        this.ctx.fillStyle = '#FF8A65';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 4, 
            this.food.y * this.gridSize + 4, 
            this.gridSize - 10, 
            this.gridSize - 10
        );
    }
    
    checkGameEnd() {
        // Check wall collision
        if (this.snake[0].x < 0 || this.snake[0].x >= this.tileCount || 
            this.snake[0].y < 0 || this.snake[0].y >= this.tileCount) {
            return true;
        }
        
        // Check self collision
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[0].x === this.snake[i].x && this.snake[0].y === this.snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    endGame() {
        this.gameRunning = false;
        this.saveHighScore();
        
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn');
        
        title.textContent = 'Game Over!';
        message.textContent = `Score final: ${this.score}`;
        startBtn.style.display = 'none';
        restartBtn.style.display = 'inline-block';
        overlay.style.display = 'flex';
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('length').textContent = this.snake.length;
        document.getElementById('speed').textContent = Math.floor((150 - this.gameSpeed) / 10) + 1;
    }
    
    loadHighScore() {
        const highScore = localStorage.getItem('snakeHighScore') || 0;
        document.getElementById('highScore').textContent = highScore;
    }
    
    saveHighScore() {
        const currentHighScore = parseInt(localStorage.getItem('snakeHighScore') || 0);
        if (this.score > currentHighScore) {
            localStorage.setItem('snakeHighScore', this.score);
            document.getElementById('highScore').textContent = this.score;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
