# 🎮 Gaming Hub

Une collection de jeux classiques développés en HTML, CSS et JavaScript vanilla, optimisée pour le déploiement sur Netlify.

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)

## 🎯 Jeux disponibles

- **🐍 Snake** : Le classique jeu du serpent - Mangez les pommes et grandissez !
- **⭕ Tic-Tac-Toe** : Le jeu de morpion classique - Alignez trois symboles pour gagner !
- **🧠 Memory** : Jeu de mémoire avec des cartes - Testez votre mémoire !
- **🧩 Tetris** : Le puzzle de blocs emblématique - Empilez et complétez des lignes !

## 🚀 Démo en ligne

Visitez le site : [https://votre-site.netlify.app](https://votre-site.netlify.app)

## 🛠️ Technologies utilisées

- **Frontend** : HTML5, CSS3, JavaScript vanilla (ES6+)
- **Fonts** : Google Fonts (Orbitron & Roboto)
- **Déploiement** : Netlify
- **PWA** : Progressive Web App ready

## 📁 Structure du projet

```
/
├── index.html              # Page d'accueil
├── manifest.json           # PWA manifest
├── netlify.toml           # Configuration Netlify
├── _headers               # Headers HTTP
├── _redirects             # Redirections
├── robots.txt             # SEO
├── package.json           # Métadonnées du projet
├── styles/
│   └── main.css          # Styles principaux
├── js/
│   └── navigation.js     # Logique de navigation
└── games/
    ├── snake/            # Jeu Snake
    ├── tictactoe/        # Jeu Tic-Tac-Toe
    ├── memory/           # Jeu Memory
    └── tetris/           # Jeu Tetris
```

## 🚀 Déploiement sur Netlify

### Méthode 1 : Drag & Drop
1. Zippez votre dossier de projet
2. Allez sur [netlify.com](https://netlify.com)
3. Glissez-déposez votre zip dans la zone de déploiement

### Méthode 2 : Git (Recommandé)
1. Poussez votre code sur GitHub/GitLab
2. Connectez votre repository à Netlify
3. Le déploiement se fera automatiquement

### Configuration automatique
Le fichier `netlify.toml` configure automatiquement :
- ✅ Build settings
- ✅ Redirections pour les jeux
- ✅ Headers de sécurité
- ✅ Cache optimization
- ✅ Gestion des erreurs 404

## 💻 Installation locale

```bash
# Clonez le repository
git clone https://github.com/votre-username/gaming-hub.git
cd gaming-hub

# Installez les dépendances (optionnel)
npm install

# Lancez un serveur local
npm run dev
# ou
npx http-server . -p 3000 -o
```

## ✨ Fonctionnalités

- 📱 **Responsive Design** : Optimisé pour tous les appareils
- 🎨 **Animations fluides** : Transitions CSS modernes
- ⌨️ **Navigation clavier** : Échap pour revenir à l'accueil
- 🌙 **Thème sombre** : Design moderne et élégant
- 🚀 **PWA Ready** : Installable comme application
- 🔒 **Sécurisé** : Headers de sécurité configurés
- ⚡ **Optimisé** : Cache et compression automatiques

## 🔧 Optimisations Netlify incluses

- **Headers de sécurité** : XSS Protection, Content Security Policy
- **Cache intelligent** : CSS/JS cachés 1 an, HTML 1 heure
- **Compression** : Gzip automatique
- **Redirections** : Gestion propre des routes
- **PWA** : Manifest et service worker ready
- **SEO** : Meta tags optimisés

## 📝 Licence

MIT License - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

---

Fait avec ❤️ pour les passionnés de jeux rétro