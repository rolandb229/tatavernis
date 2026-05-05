<?php
/**
 * API Categories - Tatavernis (CRUD complet)
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) getCategorie($pdo, $id);
        else getCategories($pdo);
        break;
    case 'POST':
        createCategorie($pdo);
        break;
    case 'PUT':
        if ($id) updateCategorie($pdo, $id);
        else jsonResponse(['error' => 'ID requis'], 400);
        break;
    case 'DELETE':
        if ($id) deleteCategorie($pdo, $id);
        else jsonResponse(['error' => 'ID requis'], 400);
        break;
    default:
        jsonResponse(['error' => 'Methode non autorisee'], 405);
}

function getCategories($pdo) {
    $sql = "SELECT c.*, COUNT(p.id) as nb_produits
            FROM categories c
            LEFT JOIN produits p ON c.id = p.categorie_id
            GROUP BY c.id
            ORDER BY c.nom ASC";
    $stmt = $pdo->query($sql);
    jsonResponse($stmt->fetchAll());
}

function getCategorie($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $cat = $stmt->fetch();
    if (!$cat) jsonResponse(['error' => 'Categorie non trouvee'], 404);
    jsonResponse($cat);
}

function createCategorie($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['nom'])) jsonResponse(['error' => 'Nom requis'], 400);

    $slug = createSlugC($data['nom']);
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);
    if ($stmt->fetch()) $slug .= '-' . time();

    $stmt = $pdo->prepare("INSERT INTO categories (nom, slug, description, image) VALUES (:nom, :slug, :desc, :image)");
    $stmt->execute([
        ':nom'   => sanitize($data['nom']),
        ':slug'  => $slug,
        ':desc'  => sanitize($data['description'] ?? ''),
        ':image' => sanitize($data['image'] ?? ''),
    ]);
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()], 201);
}

function updateCategorie($pdo, $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $fields = [];
    $params = [':id' => $id];

    foreach (['nom', 'description', 'image'] as $f) {
        if (isset($data[$f])) {
            $fields[] = "$f = :$f";
            $params[":$f"] = sanitize($data[$f]);
        }
    }
    if (empty($fields)) jsonResponse(['error' => 'Aucun champ'], 400);

    $pdo->prepare("UPDATE categories SET " . implode(', ', $fields) . " WHERE id = :id")->execute($params);
    jsonResponse(['success' => true]);
}

function deleteCategorie($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if ($stmt->rowCount() === 0) jsonResponse(['error' => 'Categorie non trouvee'], 404);
    jsonResponse(['success' => true]);
}

function createSlugC($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    return strtolower(trim(preg_replace('~-+~', '-', $text), '-'));
}
