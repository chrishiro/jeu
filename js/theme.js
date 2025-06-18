// Gestion du thème clair/sombre
const theme = {
    current: localStorage.getItem('theme') || 'light',
    
    init() {
        document.documentElement.setAttribute('data-theme', this.current);
        this.updateUI();
    },
    
    toggle() {
        this.current = this.current === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.current);
        document.documentElement.setAttribute('data-theme', this.current);
        this.updateUI();
    },
    
    updateUI() {
        const themeLink = document.querySelector('.nav-link[onclick="toggleTheme()"]');
        if (themeLink) {
            themeLink.textContent = `Thème ${this.current === 'light' ? '🌙' : '☀️'}`;
        }
    }
};

// Initialisation du thème
theme.init();

function toggleTheme() {
    theme.toggle();
}
