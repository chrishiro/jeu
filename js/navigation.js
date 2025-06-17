// Navigation system for the gaming website

function navigateToGame(gameName) {
    // Add loading animation
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Chargement...';
    button.disabled = true;
    
    // Handle special case for calendar
    if (gameName === 'calendar') {
        setTimeout(() => {
            window.location.href = 'calendrier/calendirer.php';
        }, 500);
        return;
    }
    
    // Simulate loading delay for regular games
    setTimeout(() => {
        window.location.href = `games/${gameName}/index.html`;
    }, 500);
}

function goHome() {
    window.location.href = '../../index.html';
}

function showSection(sectionName) {
    // Si c'est la section calendrier, rediriger vers calendrier.php
    if (sectionName === 'calendrier') {
        window.location.href = 'calendrier/calendirer.php';
        return;
    }
    
    // Pour les autres sections, afficher/masquer comme d'habitude
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    document.getElementById(`section-${sectionName}`).classList.add('active');
    
    // Mettre à jour la navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Add smooth scroll behavior for better UX
document.addEventListener('DOMContentLoaded', function() {
    // Add entrance animations
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // If we're in a game, go back to home
            if (window.location.pathname.includes('/games/')) {
                goHome();
            }
        }
    });
});

// Utility function to get game data
function getGameData() {
    return {
        snake: {
            name: 'Snake',
            description: 'Le classique jeu du serpent',
            difficulty: 'Facile',
            players: '1 joueur'
        },
        tictactoe: {
            name: 'Tic-Tac-Toe',
            description: 'Le jeu de morpion classique',
            difficulty: 'Facile',
            players: '1-2 joueurs'
        },
        memory: {
            name: 'Memory',
            description: 'Testez votre mémoire',
            difficulty: 'Moyen',
            players: '1 joueur'
        },
        tetris: {
            name: 'Tetris',
            description: 'Empilez les blocs',
            difficulty: 'Difficile',
            players: '1 joueur'
        }
    };
}
