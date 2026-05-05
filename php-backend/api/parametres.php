<?php
/**
 * API Parametres - Tatavernis
 * Gestion des parametres du site
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getParametres($pdo);
        break;
    case 'POST':
    case 'PUT':
        updateParametre($pdo);
        break;
    default:
        jsonResponse(['error' => 'Methode non autorisee'], 405);
}

function getParametres($pdo) {
    $stmt = $pdo->query("SELECT cle, valeur FROM parametres ORDER BY cle ASC");
    $rows = $stmt->fetchAll();
    // Transformer en objet cle => valeur
    $result = [];
    foreach ($rows as $row) {
        $result[$row['cle']] = $row['valeur'];
    }
    jsonResponse($result);
}

function updateParametre($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (empty($data) || !is_array($data)) {
        jsonResponse(['error' => 'Donnees invalides'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO parametres (cle, valeur) VALUES (:cle, :valeur) ON DUPLICATE KEY UPDATE valeur = :valeur2");

    foreach ($data as $cle => $valeur) {
        $stmt->execute([
            ':cle'    => sanitize($cle),
            ':valeur' => $valeur,
            ':valeur2' => $valeur,
        ]);
    }

    jsonResponse(['success' => true]);
}
