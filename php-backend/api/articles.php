<?php
/**
 * API Articles/Blog - Tatavernis
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

$slug = isset($_GET['slug']) ? sanitize($_GET['slug']) : null;

switch ($method) {
    case 'GET':
        if ($slug) {
            getArticleBySlug($pdo, $slug);
        } elseif ($id) {
            getArticle($pdo, $id);
        } else {
            getArticles($pdo);
        }
        break;
    
    case 'POST':
        createArticle($pdo);
        break;
    
    case 'PUT':
        if ($id) updateArticle($pdo, $id);
        break;
    
    case 'DELETE':
        if ($id) deleteArticle($pdo, $id);
        break;
    
    default:
        jsonResponse(['error' => 'Methode non autorisee'], 405);
}

function getArticles($pdo) {
    $onlyPublished = !isset($_GET['admin']);
    
    // date_publication alias pour compatibilite frontend
    $sql = "SELECT *, created_at AS date_publication FROM articles";
    if ($onlyPublished) {
        $sql .= " WHERE publie = 1";
    }
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $pdo->query($sql);
    jsonResponse($stmt->fetchAll());
}

function getArticle($pdo, $id) {
    $stmt = $pdo->prepare("SELECT *, created_at AS date_publication FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $article = $stmt->fetch();
    
    if (!$article) {
        jsonResponse(['error' => 'Article non trouve'], 404);
    }
    
    jsonResponse($article);
}

function createArticle($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['titre']) || empty($data['contenu'])) {
        jsonResponse(['error' => 'Titre et contenu requis'], 400);
    }
    
    $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $data['titre']));
    
    $stmt = $pdo->prepare("INSERT INTO articles (titre, slug, contenu, extrait, image, video_url, publie) 
                          VALUES (:titre, :slug, :contenu, :extrait, :image, :video, :publie)");
    $stmt->execute([
        ':titre' => sanitize($data['titre']),
        ':slug' => $slug,
        ':contenu' => $data['contenu'], // Pas de sanitize pour le HTML
        ':extrait' => sanitize($data['extrait'] ?? ''),
        ':image' => sanitize($data['image'] ?? ''),
        ':video' => sanitize($data['video_url'] ?? ''),
        ':publie' => !empty($data['publie']) ? 1 : 0
    ]);
    
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()], 201);
}

function updateArticle($pdo, $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $fields = [];
    $params = [':id' => $id];
    
    $allowedFields = ['titre', 'contenu', 'extrait', 'image', 'video_url', 'publie'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = :$field";
            $params[":$field"] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        jsonResponse(['error' => 'Aucun champ a mettre a jour'], 400);
    }
    
    $sql = "UPDATE articles SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    jsonResponse(['success' => true]);
}

function getArticleBySlug($pdo, $slug) {
    $stmt = $pdo->prepare("SELECT *, created_at AS date_publication FROM articles WHERE slug = :slug AND publie = 1");
    $stmt->execute([':slug' => $slug]);
    $article = $stmt->fetch();
    if (!$article) jsonResponse(['error' => 'Article non trouve'], 404);
    jsonResponse($article);
}

function deleteArticle($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM articles WHERE id = :id");
    $stmt->execute([':id' => $id]);
    
    jsonResponse(['success' => $stmt->rowCount() > 0]);
}
