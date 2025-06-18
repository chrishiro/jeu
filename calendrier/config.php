<?php
// Paramètres de connexion MySQL pour Laragon
$host = 'localhost';     // Hôte MySQL
$dbname = 'calendrier_chris_morgane'; // Nom de la base de données
$username = 'root';      // Nom d'utilisateur par défaut de Laragon
$password = '';         // Mot de passe par défaut de Laragon (vide)
$charset = 'utf8mb4';   // Jeu de caractères

try {
    // Configuration DSN (Data Source Name)
    $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
    
    // Options PDO pour une meilleure gestion des erreurs
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];

    // Création de la connexion PDO
    $conn = new PDO($dsn, $username, $password, $options);
    
} catch (PDOException $e) {
    // En cas d'erreur, afficher un message plus détaillé
    die('Erreur de connexion à la base de données : ' . $e->getMessage());
}
?>
