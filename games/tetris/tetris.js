// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Créer une instance du jeu
    const game = new Tetris();
    // Attacher l'événement au bouton de démarrage
    document.getElementById('start-btn').addEventListener('click', () => {
        game.init();
    });
});

class Tetris {
    constructor() {
        this.initializeCanvas();
        this.initializeGame();
        this.bindControls();
    }

    initializeCanvas() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.BLOCK_SIZE = 20;
        this.BOARD_WIDTH = 12;
        this.BOARD_HEIGHT = 20;
    }

    initializeGame() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameOver = false;
        this.paused = false;
        
        this.SHAPES = {
            I: [[1, 1, 1, 1]],
            L: [[1, 0], [1, 0], [1, 1]],
            J: [[0, 1], [0, 1], [1, 1]],
            O: [[1, 1], [1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            T: [[0, 1, 0], [1, 1, 1]],
            Z: [[1, 1, 0], [0, 1, 1]]
        };
        
        this.COLORS = {
            I: '#00f0f0',
            L: '#f0a000',
            J: '#0000f0',
            O: '#f0f000',
            S: '#00f000',
            T: '#a000f0',
            Z: '#f00000'
        };
        
        this.currentPiece = null;
        this.nextPiece = this.getRandomPiece();
    }

    init() {
        this.gameOver = false;
        this.paused = false;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.updateScore();
        this.spawnPiece();
        this.drawBoard();
        this.gameLoop();
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver || this.paused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
                case ' ':
                    this.hardDrop();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
            }
        });
    }

    getRandomPiece() {
        const pieces = Object.keys(this.SHAPES);
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        const shape = this.SHAPES[type].map(row => [...row]);
        return {
            type,
            shape,
            x: Math.floor((this.BOARD_WIDTH - shape[0].length) / 2),
            y: 0
        };
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        
        if (this.isCollision(this.currentPiece)) {
            this.gameOver = true;
        }
        
        this.drawNextPiece();
        this.drawBoard();
    }

    isCollision(piece) {
        return piece.shape.some((row, dy) => 
            row.some((value, dx) => {
                if (!value) return false;
                const newX = piece.x + dx;
                const newY = piece.y + dy;
                return (
                    newX < 0 ||
                    newX >= this.BOARD_WIDTH ||
                    newY >= this.BOARD_HEIGHT ||
                    (newY >= 0 && this.board[newY][newX])
                );
            })
        );
    }

    movePiece(dx, dy) {
        if (!this.currentPiece) return false;

        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        const movedPiece = {
            ...this.currentPiece,
            x: newX,
            y: newY
        };
        
        if (!this.isCollision(movedPiece)) {
            this.currentPiece = movedPiece;
            this.drawBoard();
            return true;
        }
        
        if (dy > 0) {
            this.lockPiece();
            this.clearLines();
            this.spawnPiece();
        }
        
        return false;
    }

    rotatePiece() {
        if (!this.currentPiece) return;

        const rotated = {
            ...this.currentPiece,
            shape: this.currentPiece.shape[0].map((_, i) =>
                this.currentPiece.shape.map(row => row[i]).reverse()
            )
        };
        
        if (!this.isCollision(rotated)) {
            this.currentPiece = rotated;
            this.drawBoard();
        }
    }

    hardDrop() {
        if (!this.currentPiece) return;
        while (this.movePiece(0, 1)) {}
        this.drawBoard();
    }

    lockPiece() {
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const y = this.currentPiece.y + dy;
                    const x = this.currentPiece.x + dx;
                    if (y >= 0) {
                        this.board[y][x] = this.currentPiece.type;
                    }
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Check the same row again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.level = Math.floor(this.lines / 10) + 1;
            this.updateScore();
        }
    }

    calculateScore(linesCleared) {
        const points = [0, 40, 100, 300, 1200];
        return points[linesCleared] * this.level;
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    drawBoard() {
        if (!this.ctx) return;  // Sécurité si le canvas n'est pas encore initialisé

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.board.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    this.ctx.fillStyle = this.COLORS[cell];
                    this.ctx.fillRect(
                        x * this.BLOCK_SIZE,
                        y * this.BLOCK_SIZE,
                        this.BLOCK_SIZE - 1,
                        this.BLOCK_SIZE - 1
                    );
                }
            });
        });
        
        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.COLORS[this.currentPiece.type];
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.BLOCK_SIZE,
                            (this.currentPiece.y + y) * this.BLOCK_SIZE,
                            this.BLOCK_SIZE - 1,
                            this.BLOCK_SIZE - 1
                        );
                    }
                });
            });
        }
        
        // Draw grid
        this.ctx.strokeStyle = '#333';
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.ctx.strokeRect(
                    x * this.BLOCK_SIZE,
                    y * this.BLOCK_SIZE,
                    this.BLOCK_SIZE,
                    this.BLOCK_SIZE
                );
            }
        }
        
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        if (this.paused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Paused', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    drawNextPiece() {
        if (!this.nextCtx) return;  // Sécurité si le canvas n'est pas encore initialisé

        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        this.nextCtx.fillStyle = this.COLORS[this.nextPiece.type];
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            });
        });
    }

    togglePause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.gameLoop();
        }
    }

    gameLoop() {
        if (this.gameOver || this.paused) return;
        
        this.movePiece(0, 1);
        this.drawBoard();
        
        setTimeout(() => this.gameLoop(), Math.max(100, 1000 - (this.level * 100)));
    }
}
