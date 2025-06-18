// Module de gestion de la navigation et des scores
const GamingHub = {
    config: {
        storageKey: 'highScores',
        maxScores: 10,
        defaultPlayerName: 'Anonyme'
    },
    
    state: {
        currentSection: 'accueil',
        mobileMenuOpen: false,
        searchQuery: ''
    },
    
    init() {
        this.highScores.init();
        this.setupEventListeners();
        this.showSection(this.state.currentSection);
    },
    
    setupEventListeners() {
        // Délégation d'événements pour une meilleure performance
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.matches('.nav-link')) {
                e.preventDefault();
                const section = target.getAttribute('data-section');
                if (section) this.showSection(section);
            }
            
            if (target.matches('.play-btn')) {
                const game = target.closest('.game-card').dataset.game;
                if (game) this.navigateToGame(game);
            }
        });

        // Debounce pour la recherche
        const searchInput = document.getElementById('searchGames');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.state.searchQuery = e.target.value.toLowerCase();
                this.filterGames();
            }, 300));
        }
    },
    
    highScores: {
        data: {},
        
        init() {
            this.load();
            this.display();
        },
        
        load() {
            try {
                this.data = JSON.parse(localStorage.getItem(GamingHub.config.storageKey)) || {};
            } catch (e) {
                console.error('Erreur lors du chargement des scores:', e);
                this.data = {};
            }
        },
        
        add(game, score, playerName = GamingHub.config.defaultPlayerName) {
            if (!this.data[game]) {
                this.data[game] = [];
            }
            
            this.data[game].push({
                player: playerName,
                score: score,
                date: new Date().toISOString()
            });
            
            this.data[game].sort((a, b) => b.score - a.score);
            this.data[game] = this.data[game].slice(0, GamingHub.config.maxScores);
            
            this.save();
            this.display();
        },
        
        save() {
            try {
                localStorage.setItem(GamingHub.config.storageKey, JSON.stringify(this.data));
            } catch (e) {
                console.error('Erreur lors de la sauvegarde des scores:', e);
            }
        }
    },
    
    // Utilitaires
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    showSection(sectionId) {
        const sections = document.querySelectorAll('.content-section');
        const navLinks = document.querySelectorAll('.nav-link');
        
        sections.forEach(section => {
            section.classList.toggle('active', section.id === `section-${sectionId}`);
        });
        
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });
        
        this.state.currentSection = sectionId;
    },
    
    navigateToGame(game) {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
        
        // Simuler un temps de chargement pour une meilleure UX
        setTimeout(() => {
            window.location.href = `games/${game}/index.html`;
        }, 300);
    }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => GamingHub.init());
