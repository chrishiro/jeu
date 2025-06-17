<?php
// Configuration de la base de données
$servername = "localhost";
$username = "root";  // À modifier selon votre configuration
$password = "";      // À modifier selon votre configuration
$dbname = "calendrier_chris_morgane";

// Création de la connexion
try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Erreur de connexion : " . $e->getMessage();
}

// Traitement du formulaire d'ajout d'événement
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['ajouter'])) {
    $titre = $_POST['titre'];
    $description = $_POST['description'];
    $date = $_POST['date'];
    $personne = $_POST['personne'];
    
    try {
        $sql = "INSERT INTO evenements (titre, description, date, personne) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$titre, $description, $date, $personne]);
        echo "<p class='success'>Événement ajouté avec succès!</p>";
    } catch(PDOException $e) {
        echo "<p class='error'>Erreur : " . $e->getMessage() . "</p>";
    }
}

// Suppression d'un événement
if (isset($_GET['supprimer'])) {
    $id = $_GET['supprimer'];
    try {
        $sql = "DELETE FROM evenements WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([$id]);
        echo "<p class='success'>Événement supprimé!</p>";
    } catch(PDOException $e) {
        echo "<p class='error'>Erreur : " . $e->getMessage() . "</p>";
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendrier Chris & Morgane</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .form-container {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .calendar {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 10px;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .day {
            border: 1px solid #ddd;
            padding: 10px;
            min-height: 100px;
        }
        .event {
            background-color: #e3f2fd;
            padding: 5px;
            margin: 2px 0;
            border-radius: 4px;
            font-size: 0.9em;
        }
        .event.chris { background-color: #c8e6c9; }
        .event.morgane { background-color: #f8bbd0; }
        .success { color: green; }
        .error { color: red; }
        form input, form textarea, form select {
            width: 100%;
            padding: 8px;
            margin: 5px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        form button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        form button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <h1>Calendrier Chris & Morgane</h1>

    <div class="form-container">
        <h2>Ajouter un événement</h2>
        <form method="POST">
            <input type="text" name="titre" placeholder="Titre de l'événement" required>
            <textarea name="description" placeholder="Description" rows="3"></textarea>
            <input type="date" name="date" required>
            <select name="personne" required>
                <option value="chris">Chris</option>
                <option value="morgane">Morgane</option>
                <option value="both">Les deux</option>
            </select>
            <button type="submit" name="ajouter">Ajouter</button>
        </form>
    </div>

    <div class="calendar">
        <?php
        // Affichage du calendrier
        $mois = isset($_GET['mois']) ? $_GET['mois'] : date('m');
        $annee = isset($_GET['annee']) ? $_GET['annee'] : date('Y');
        
        $premier_jour = mktime(0, 0, 0, $mois, 1, $annee);
        $nombre_jours = date('t', $premier_jour);
        $jour_semaine = date('N', $premier_jour);
        
        // Afficher les jours de la semaine
        $jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        foreach ($jours as $jour) {
            echo "<div class='day'><strong>$jour</strong></div>";
        }
        
        // Ajouter les cases vides pour le début du mois
        for ($i = 1; $i < $jour_semaine; $i++) {
            echo "<div class='day'></div>";
        }
        
        // Afficher les jours du mois
        for ($jour = 1; $jour <= $nombre_jours; $jour++) {
            echo "<div class='day'>";
            echo "<strong>$jour</strong><br>";
            
            // Récupérer les événements du jour
            $date = date('Y-m-d', mktime(0, 0, 0, $mois, $jour, $annee));
            $sql = "SELECT * FROM evenements WHERE date = ? ORDER BY personne";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$date]);
            
            while ($event = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo "<div class='event {$event['personne']}'>";
                echo htmlspecialchars($event['titre']);
                echo "<br><small>" . htmlspecialchars($event['description']) . "</small>";
                echo "<a href='?supprimer={$event['id']}' onclick='return confirm(\"Supprimer cet événement?\")'>❌</a>";
                echo "</div>";
            }
            
            echo "</div>";
        }
        ?>
    </div>

    <div style="margin-top: 20px;">
        <form method="GET" style="display: inline-block;">
            <select name="mois">
                <?php
                for ($m = 1; $m <= 12; $m++) {
                    $selected = $m == $mois ? 'selected' : '';
                    echo "<option value='$m' $selected>" . date('F', mktime(0, 0, 0, $m, 1)) . "</option>";
                }
                ?>
            </select>
            <select name="annee">
                <?php
                $annee_courante = date('Y');
                for ($a = $annee_courante - 1; $a <= $annee_courante + 5; $a++) {
                    $selected = $a == $annee ? 'selected' : '';
                    echo "<option value='$a' $selected>$a</option>";
                }
                ?>
            </select>
            <button type="submit">Afficher</button>
        </form>
    </div>
</body>
</html>