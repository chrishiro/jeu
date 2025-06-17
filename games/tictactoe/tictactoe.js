// Tic-Tac-Toe Game Implementation

class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'pvp'; // 'pvp' or 'ai'
        this.aiDifficulty = 'medium';
        this.scores = { X: 0, O: 0, draws: 0, gamesPlayed: 0 };
        
        this.winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        this.initializeGame();
        this.setupEventListeners();
        this.loadStats();
    }
    
    initializeGame() {
        this.updateDisplay();
        this.updateGameStatus('Choisissez une case');
    }
    
    setupEventListeners() {
        // Cell clicks
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        // Game controls
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('clearScoreBtn').addEventListener('click', () => this.clearStats());
        
        // Game mode selection
        document.querySelectorAll('input[name="gameMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.changeGameMode(e.target.value));
        });
        
        // AI difficulty
        document.getElementById('aiDifficulty').addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
        });
    }
    
    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '') return;
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.gameActive && this.gameMode === 'ai' && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.updateCellDisplay(index, player);
        
        if (this.checkWinner()) {
            this.endGame(`${player} gagne!`);
            this.scores[player]++;
        } else if (this.board.every(cell => cell !== '')) {
            this.endGame('Égalité!');
            this.scores.draws++;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateCurrentPlayerDisplay();
            this.updateGameStatus(`Tour de ${this.currentPlayer}`);
        }
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        switch (this.aiDifficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        
        if (move !== -1) {
            this.makeMove(move, 'O');
        }
    }
    
    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : -1;
    }
    
    getMediumMove() {
        // 50% chance to play optimally, 50% random
        return Math.random() < 0.5 ? this.getBestMove() : this.getRandomMove();
    }
    
    getBestMove() {
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Check for blocking move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available
        if (this.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available move
        return this.getRandomMove();
    }

    checkWinner() {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.highlightWinningCells(condition);
                return true;
            }
        }
        return false;
    }

    highlightWinningCells(winningCondition) {
        winningCondition.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winning');
        });
    }

    endGame(message) {
        this.gameActive = false;
        this.scores.gamesPlayed++;
        this.updateGameStatus(message);
        this.saveStats();
        this.updateDisplay();
    }

    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;

        // Clear board display
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });

        this.updateCurrentPlayerDisplay();
        this.updateGameStatus('Choisissez une case');
    }

    changeGameMode(mode) {
        this.gameMode = mode;
        const difficultySelector = document.getElementById('difficultySelector');

        if (mode === 'ai') {
            difficultySelector.style.display = 'block';
        } else {
            difficultySelector.style.display = 'none';
        }

        this.resetGame();
    }

    updateCellDisplay(index, player) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }

    updateCurrentPlayerDisplay() {
        const currentPlayerElement = document.getElementById('currentPlayer');
        currentPlayerElement.textContent = this.currentPlayer;
        currentPlayerElement.className = this.currentPlayer === 'X' ? 'player-x' : 'player-o';
    }

    updateGameStatus(message) {
        document.getElementById('gameStatus').textContent = message;
    }

    updateDisplay() {
        document.getElementById('scoreX').textContent = this.scores.X;
        document.getElementById('scoreO').textContent = this.scores.O;
        document.getElementById('gamesPlayed').textContent = this.scores.gamesPlayed;
        document.getElementById('draws').textContent = this.scores.draws;
    }

    loadStats() {
        const savedStats = localStorage.getItem('tictactoeStats');
        if (savedStats) {
            this.scores = JSON.parse(savedStats);
            this.updateDisplay();
        }
    }

    saveStats() {
        localStorage.setItem('tictactoeStats', JSON.stringify(this.scores));
    }

    clearStats() {
        this.scores = { X: 0, O: 0, draws: 0, gamesPlayed: 0 };
        localStorage.removeItem('tictactoeStats');
        this.updateDisplay();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});
