<?php
require_once 'config.php';

// API endpoints
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action'])) {
    header('Content-Type: application/json');
    
    switch ($_GET['action']) {
        case 'events':
            // Récupérer les événements pour la période demandée
            $start = isset($_GET['start']) ? $_GET['start'] : null;
            $end = isset($_GET['end']) ? $_GET['end'] : null;
            echo json_encode(getEvents($conn, $start, $end));
            break;
            
        case 'categories':
            // Récupérer toutes les catégories
            echo json_encode(getCategories($conn));
            break;
    }
    exit;
}

// API POST endpoints pour la gestion des événements
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    
    switch ($data['action']) {
        case 'create':
            $result = createEvent($conn, $data);
            echo json_encode(['success' => true, 'id' => $result]);
            break;
            
        case 'update':
            updateEvent($conn, $data);
            echo json_encode(['success' => true]);
            break;
            
        case 'delete':
            deleteEvent($conn, $data['id']);
            echo json_encode(['success' => true]);
            break;
    }
    exit;
}

// Fonctions API
function getEvents($conn, $start, $end) {
    $query = "
        SELECT e.*, GROUP_CONCAT(c.nom) as categories, GROUP_CONCAT(c.couleur) as category_colors
        FROM evenements e
        LEFT JOIN evenement_categories ec ON e.id = ec.evenement_id
        LEFT JOIN categories c ON ec.categorie_id = c.id
        WHERE (date_debut BETWEEN :start AND :end OR date_fin BETWEEN :start AND :end)
        GROUP BY e.id
    ";
    
    try {
        $stmt = $conn->prepare($query);
        $stmt->execute([':start' => $start, ':end' => $end]);
        return array_map(function($event) {
            return [
                'id' => $event['id'],
                'title' => $event['titre'],
                'start' => $event['date_debut'],
                'end' => $event['date_fin'],
                'description' => $event['description'],
                'backgroundColor' => $event['couleur'],
                'personne' => $event['personne'],
                'categories' => $event['categories'] ? explode(',', $event['categories']) : [],
                'reminder' => (bool)$event['rappel']
            ];
        }, $stmt->fetchAll());
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

function createEvent($conn, $data) {
    try {
        $conn->beginTransaction();
        
        $query = "INSERT INTO evenements (titre, description, date_debut, date_fin, personne, couleur, rappel) 
                  VALUES (:titre, :description, :date_debut, :date_fin, :personne, :couleur, :rappel)";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':titre' => $data['title'],
            ':description' => $data['description'],
            ':date_debut' => $data['start'],
            ':date_fin' => $data['end'],
            ':personne' => $data['personne'],
            ':couleur' => $data['backgroundColor'],
            ':rappel' => $data['reminder'] ? 1 : 0
        ]);
        
        $eventId = $conn->lastInsertId();
        
        if (!empty($data['categories'])) {
            $stmt = $conn->prepare("INSERT INTO evenement_categories (evenement_id, categorie_id) VALUES (:event_id, :categorie_id)");
            foreach ($data['categories'] as $categoryId) {
                $stmt->execute([
                    ':event_id' => $eventId,
                    ':categorie_id' => $categoryId
                ]);
            }
        }
        
        $conn->commit();
        return $eventId;
    } catch (PDOException $e) {
        $conn->rollBack();
        return ['error' => $e->getMessage()];
    }
}

function updateEvent($conn, $data) {
    try {
        $conn->beginTransaction();
        
        $query = "UPDATE evenements SET 
                  titre = :titre,
                  description = :description,
                  date_debut = :date_debut,
                  date_fin = :date_fin,
                  personne = :personne,
                  couleur = :couleur,
                  rappel = :rappel
                  WHERE id = :id";
        
        $stmt = $conn->prepare($query);
        $stmt->execute([
            ':id' => $data['id'],
            ':titre' => $data['title'],
            ':description' => $data['description'],
            ':date_debut' => $data['start'],
            ':date_fin' => $data['end'],
            ':personne' => $data['personne'],
            ':couleur' => $data['backgroundColor'],
            ':rappel' => $data['reminder'] ? 1 : 0
        ]);
        
        // Mise à jour des catégories
        $stmt = $conn->prepare("DELETE FROM evenement_categories WHERE evenement_id = :event_id");
        $stmt->execute([':event_id' => $data['id']]);
        
        if (!empty($data['categories'])) {
            $stmt = $conn->prepare("INSERT INTO evenement_categories (evenement_id, categorie_id) VALUES (:event_id, :categorie_id)");
            foreach ($data['categories'] as $categoryId) {
                $stmt->execute([
                    ':event_id' => $data['id'],
                    ':categorie_id' => $categoryId
                ]);
            }
        }
        
        $conn->commit();
    } catch (PDOException $e) {
        $conn->rollBack();
        throw $e;
    }
}

function deleteEvent($conn, $id) {
    try {
        $conn->beginTransaction();
        
        $stmt = $conn->prepare("DELETE FROM evenement_categories WHERE evenement_id = :id");
        $stmt->execute([':id' => $id]);
        
        $stmt = $conn->prepare("DELETE FROM evenements WHERE id = :id");
        $stmt->execute([':id' => $id]);
        
        $conn->commit();
    } catch (PDOException $e) {
        $conn->rollBack();
        throw $e;
    }
}

function getCategories($conn) {
    try {
        $stmt = $conn->query("SELECT * FROM categories ORDER BY nom");
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        return ['error' => $e->getMessage()];
    }
}

// Interface utilisateur
?>
<!DOCTYPE html>
<html lang="fr">
<head>    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendrier</title>
    <link href='https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.css' rel='stylesheet' />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" rel="stylesheet">
    <!-- Ajout du support tactile -->
    <link href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css' rel='stylesheet' />    <style>
        body {
            margin: 0;
            padding: 10px;
            font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
            background-color: #f5f5f5;
        }
        #calendar {
            max-width: 1200px;
            margin: 0 auto;
            padding: 15px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border-radius: 8px;
        }
        .fc {
            max-width: 100%;
        }
        .fc .fc-toolbar {
            flex-wrap: wrap;
            gap: 10px;
        }
        .fc-event {
            cursor: pointer;
            padding: 5px;
            margin: 2px 0;
            border-radius: 3px;
        }
        @media (max-width: 768px) {
            body {
                padding: 5px;
            }
            #calendar {
                padding: 10px;
                font-size: 14px;
            }
            .fc .fc-toolbar {
                display: flex;
                flex-direction: column;
                align-items: stretch;
            }
            .fc .fc-toolbar-title {
                font-size: 1.2em;
                text-align: center;
            }
            .fc .fc-toolbar-chunk {
                display: flex;
                justify-content: center;
                margin: 5px 0;
            }
            .fc .fc-button {
                padding: 6px 12px;
            }
        }
        /* Style pour les formulaires mobiles */
        .custom-form {
            padding: 15px;
        }
        .custom-form .form-control {
            margin-bottom: 15px;
        }
        /* Style pour les boutons d'action */
        .action-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background-color: #007bff;
            color: white;
            display: none;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1000;
        }
        @media (max-width: 768px) {
            .action-button {
                display: flex;
            }
        }
    </style>
</head>
<body>    <div id="calendar"></div>
    <button class="action-button" id="addEventButton">
        <i class="fas fa-plus"></i>
    </button>

    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/main.min.js'></script>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@5.11.3/locales/fr.js'></script>
    <script src="https://cdn.jsdelivr.net/npm/@fullcalendar/interaction@5.11.3/main.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/fr.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {            let calendar;

            // Initialiser le calendrier
            var calendarEl = document.getElementById('calendar');
            calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
                },
                locale: 'fr',                timeZone: 'local',
                editable: true,
                selectable: true,
                selectMirror: true,
                dayMaxEvents: true,
                height: 'auto',
                firstDay: 1, // 1 = Lundi
                locale: 'fr',
                buttonText: {
                    today: 'Aujourd\'hui',
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    list: 'Liste'
                },events: function(info, successCallback, failureCallback) {
                    fetch(`calendirer.php?action=events&start=${info.startStr}&end=${info.endStr}`)
                        .then(response => response.json())
                        .then(data => {
                            successCallback(data);
                        })
                        .catch(error => failureCallback(error));
                },
                select: function(info) {
                    showEventDialog('create', {
                        start: info.startStr,
                        end: info.endStr
                    });
                },
                eventClick: function(info) {
                    showEventDialog('edit', info.event);
                },
                eventDrop: function(info) {
                    updateEvent(info.event);
                },
                eventResize: function(info) {
                    updateEvent(info.event);
                }
            });

            calendar.render();

            // Fonctions utilitaires
            function renderCategoryFilters() {
                const container = document.getElementById('category-buttons');
                categories.forEach(category => {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-outline-secondary m-1';
                    btn.textContent = category.nom;
                    btn.onclick = () => toggleCategory(category.nom);
                    container.appendChild(btn);
                });
            }

            function toggleCategory(categoryName) {
                if (activeCategories.has(categoryName)) {
                    activeCategories.delete(categoryName);
                } else {
                    activeCategories.add(categoryName);
                }
                calendar.refetchEvents();
                updateCategoryButtonStyles();
            }

            function updateCategoryButtonStyles() {
                const buttons = document.querySelectorAll('#category-buttons button');
                buttons.forEach(btn => {
                    if (activeCategories.has(btn.textContent)) {
                        btn.classList.remove('btn-outline-secondary');
                        btn.classList.add('btn-secondary');
                    } else {
                        btn.classList.add('btn-outline-secondary');
                        btn.classList.remove('btn-secondary');
                    }
                });
            }

            function showEventDialog(mode, eventData) {
                Swal.fire({
                    title: mode === 'create' ? 'Nouvel événement' : 'Modifier l\'événement',
                    html: `
                        <form id="eventForm">
                            <div class="mb-3">
                                <label class="form-label">Titre</label>
                                <input type="text" class="form-control" id="eventTitle" required value="${eventData.title || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" id="eventDescription">${eventData.extendedProps?.description || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Début</label>
                                <input type="datetime-local" class="form-control" id="eventStart" required value="${formatDateTime(eventData.start)}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Fin</label>
                                <input type="datetime-local" class="form-control" id="eventEnd" required value="${formatDateTime(eventData.end)}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Personne</label>
                                <input type="text" class="form-control" id="eventPerson" value="${eventData.extendedProps?.personne || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Couleur</label>
                                <input type="color" class="form-control" id="eventColor" value="${eventData.backgroundColor || '#3788d8'}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Catégories</label>
                                <select class="form-select" id="eventCategories" multiple>
                                    ${categories.map(cat => `
                                        <option value="${cat.id}" ${eventData.extendedProps?.categories?.includes(cat.nom) ? 'selected' : ''}>
                                            ${cat.nom}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="mb-3 form-check">
                                <input type="checkbox" class="form-check-input" id="eventReminder" ${eventData.extendedProps?.reminder ? 'checked' : ''}>
                                <label class="form-check-label">Rappel</label>
                            </div>
                        </form>
                    `,
                    showCancelButton: true,
                    confirmButtonText: mode === 'create' ? 'Créer' : 'Modifier',
                    cancelButtonText: 'Annuler',
                    showDenyButton: mode === 'edit',
                    denyButtonText: 'Supprimer'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const eventDetails = {
                            action: mode === 'create' ? 'create' : 'update',
                            id: eventData.id,
                            title: document.getElementById('eventTitle').value,
                            description: document.getElementById('eventDescription').value,
                            start: document.getElementById('eventStart').value,
                            end: document.getElementById('eventEnd').value,
                            personne: document.getElementById('eventPerson').value,
                            backgroundColor: document.getElementById('eventColor').value,
                            categories: Array.from(document.getElementById('eventCategories').selectedOptions).map(opt => opt.value),
                            reminder: document.getElementById('eventReminder').checked
                        };

                        fetch('calendirer.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(eventDetails)
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                calendar.refetchEvents();
                                Swal.fire('Succès!', 'L\'événement a été ' + (mode === 'create' ? 'créé' : 'modifié'), 'success');
                            }
                        });
                    } else if (result.isDenied && mode === 'edit') {
                        deleteEvent(eventData);
                    }
                });
            }

            function deleteEvent(eventData) {
                Swal.fire({
                    title: 'Êtes-vous sûr?',
                    text: "Cette action ne peut pas être annulée!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Oui, supprimer',
                    cancelButtonText: 'Annuler'
                }).then((result) => {
                    if (result.isConfirmed) {
                        fetch('calendirer.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                action: 'delete',
                                id: eventData.id
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                calendar.refetchEvents();
                                Swal.fire('Supprimé!', 'L\'événement a été supprimé.', 'success');
                            }
                        });
                    }
                });
            }

            function updateEvent(event) {
                fetch('calendrier.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'update',
                        id: event.id,
                        start: event.startStr,
                        end: event.endStr
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) {
                        calendar.refetchEvents();
                    }
                });
            }

            function formatDateTime(date) {
                if (!date) return '';
                const d = new Date(date);
                return d.toISOString().slice(0, 16);
            }
        });
    </script>
</body>
</html>