describe('Navigation', () => {
    beforeEach(() => {
        // Setup du DOM
        document.body.innerHTML = `
            <div class="navigation">
                <div class="nav-menu">
                    <a href="#" class="nav-link" data-section="accueil">Accueil</a>
                    <a href="#" class="nav-link" data-section="highscores">High Scores</a>
                </div>
            </div>
            <div id="section-accueil" class="content-section"></div>
            <div id="section-highscores" class="content-section"></div>
        `;

        // Réinitialiser localStorage
        localStorage.clear();
    });

    test('showSection affiche la bonne section', () => {
        GamingHub.showSection('highscores');
        
        const highscoresSection = document.getElementById('section-highscores');
        const accueilSection = document.getElementById('section-accueil');
        
        expect(highscoresSection.classList.contains('active')).toBe(true);
        expect(accueilSection.classList.contains('active')).toBe(false);
    });

    test('Les liens de navigation sont correctement mis à jour', () => {
        GamingHub.showSection('highscores');
        
        const links = document.querySelectorAll('.nav-link');
        const activeLink = document.querySelector('[data-section="highscores"]');
        const inactiveLink = document.querySelector('[data-section="accueil"]');
        
        expect(activeLink.classList.contains('active')).toBe(true);
        expect(inactiveLink.classList.contains('active')).toBe(false);
    });

    test('La recherche de jeux fonctionne correctement', () => {
        document.body.innerHTML += `
            <div class="games-grid">
                <div class="game-card" data-game="snake">Snake</div>
                <div class="game-card" data-game="tetris">Tetris</div>
            </div>
        `;

        GamingHub.state.searchQuery = 'snake';
        GamingHub.filterGames();

        const games = document.querySelectorAll('.game-card');
        expect(games[0].style.display).not.toBe('none');
        expect(games[1].style.display).toBe('none');
    });
});

describe('Theme Manager', () => {
    beforeEach(() => {
        // Setup du DOM
        document.documentElement.removeAttribute('data-theme');
        localStorage.clear();
    });

    test('Le thème par défaut est correctement appliqué', () => {
        ThemeManager.init();
        expect(document.documentElement.getAttribute('data-theme')).toBe(ThemeManager.config.defaultTheme);
    });

    test('Le thème est correctement sauvegardé dans localStorage', () => {
        ThemeManager.applyTheme('dark');
        expect(localStorage.getItem(ThemeManager.config.storageKey)).toBe('dark');
    });

    test('toggleTheme bascule correctement entre les thèmes', () => {
        ThemeManager.applyTheme('light');
        ThemeManager.toggleTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
        
        ThemeManager.toggleTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    test('Le thème est restauré depuis localStorage au chargement', () => {
        localStorage.setItem(ThemeManager.config.storageKey, 'dark');
        ThemeManager.init();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
});
