-- Supprimer la base de données si elle existe déjà (optionnel)
DROP DATABASE IF EXISTS calendrier_chris_morgane;

-- Créer la base de données avec le bon encodage
CREATE DATABASE calendrier_chris_morgane
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE calendrier_chris_morgane;

-- Création de la table des événements
CREATE TABLE evenements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME,
    personne ENUM('chris', 'morgane', 'both') NOT NULL,
    couleur VARCHAR(7) DEFAULT '#4CAF50',
    rappel BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Création de la table des rappels
CREATE TABLE rappels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evenement_id INT,
    temps_rappel INT NOT NULL,
    notifie BOOLEAN DEFAULT false,
    FOREIGN KEY (evenement_id) REFERENCES evenements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Création de la table des catégories
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    couleur VARCHAR(7) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de liaison entre événements et catégories
CREATE TABLE evenement_categories (
    evenement_id INT,
    categorie_id INT,
    PRIMARY KEY (evenement_id, categorie_id),
    FOREIGN KEY (evenement_id) REFERENCES evenements(id) ON DELETE CASCADE,
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des catégories par défaut
INSERT INTO categories (nom, couleur) VALUES 
('Rendez-vous', '#4CAF50'),
('Anniversaire', '#FF4081'),
('Travail', '#2196F3'),
('Personnel', '#9C27B0'),
('Vacances', '#FF9800');
