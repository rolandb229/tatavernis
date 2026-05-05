<?php
/**
 * API Marques - Tatavernis (CRUD complet)
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            getMarque($pdo, $id);
        } else {
            getMarques($pdo);
        }
        break;
    case 'POST':
        createMarque($pdo);
        break;
    case 'PUT':
        if ($id) updateMarque($pdo, $id);
        else jsonResponse(['error' => 'ID requis'], 400);
        break;
    case 'DELETE':
        if ($id) deleteMarque($pdo, $id);
        else jsonResponse(['error' => 'ID requis'], 400);
        break;
    default:
        jsonResponse(['error' => 'Methode non autorisee'], 405);
}

function getMarques($pdo) {
    $sql = "SELECT m.*, COUNT(p.id) as nb_produits
            FROM marques m
            LEFT JOIN produits p ON m.id = p.marque_id
            GROUP BY m.id
            ORDER BY m.nom ASC";
    $stmt = $pdo->query($sql);
    jsonResponse($stmt->fetchAll());
}

function getMarque($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM marques WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $marque = $stmt->fetch();
    if (!$marque) jsonResponse(['error' => 'Marque non trouvee'], 404);
    jsonResponse($marque);
}

function createMarque($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['nom'])) jsonResponse(['error' => 'Nom requis'], 400);

    $slug = createSlugM($data['nom']);
    // unicite slug
    $stmt = $pdo->prepare("SELECT id FROM marques WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);
    if ($stmt->fetch()) $slug .= '-' . time();

    $stmt = $pdo->prepare("INSERT INTO marques (nom, slug, description, logo) VALUES (:nom, :slug, :desc, :logo)");
    $stmt->execute([
        ':nom'  => sanitize($data['nom']),
        ':slug' => $slug,
        ':desc' => sanitize($data['description'] ?? ''),
        ':logo' => sanitize($data['logo'] ?? ''),
    ]);
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()], 201);
}

function updateMarque($pdo, $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $fields = [];
    $params = [':id' => $id];

    foreach (['nom', 'description', 'logo'] as $f) {
        if (isset($data[$f])) {
            $fields[] = "$f = :$f";
            $params[":$f"] = sanitize($data[$f]);
        }
    }
    if (empty($fields)) jsonResponse(['error' => 'Aucun champ'], 400);

    $pdo->prepare("UPDATE marques SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);
    jsonResponse(['success' => true]);
}

function deleteMarque($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM marques WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) jsonResponse(['error' => 'Marque non trouvee'], 404);
    jsonResponse(['success' => true]);
}

function createSlugM($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    return strtolower(trim(preg_replace('~-+~', '-', $text), '-'));
}
