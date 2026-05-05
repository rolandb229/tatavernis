<?php
/**
 * API Produits - Tatavernis
 * Endpoints: GET /produits, GET /produits/{id}, POST /produits, PUT /produits/{id}, DELETE /produits/{id}
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($method) {
    case 'GET':
        if ($id) {
            // Recuperer un produit specifique
            getProduit($pdo, $id);
        } else {
            // Recuperer tous les produits avec filtres
            getProduits($pdo);
        }
        break;
    
    case 'POST':
        createProduit($pdo);
        break;
    
    case 'PUT':
        if ($id) {
            updateProduit($pdo, $id);
        } else {
            jsonResponse(['error' => 'ID requis'], 400);
        }
        break;
    
    case 'DELETE':
        if ($id) {
            deleteProduit($pdo, $id);
        } else {
            jsonResponse(['error' => 'ID requis'], 400);
        }
        break;
    
    default:
        jsonResponse(['error' => 'Methode non autorisee'], 405);
}

/**
 * Recuperer tous les produits avec filtres et pagination
 */
function getProduits($pdo) {
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? min(50, max(1, (int)$_GET['limit'])) : 12;
    $offset = ($page - 1) * $limit;
    
    $where = ['1=1'];
    $params = [];
    
    // Filtre par recherche
    if (!empty($_GET['search'])) {
        $where[] = '(p.nom LIKE :search OR p.description LIKE :search)';
        $params[':search'] = '%' . $_GET['search'] . '%';
    }
    
    // Filtre par marque
    if (!empty($_GET['marque'])) {
        $where[] = 'p.marque_id = :marque';
        $params[':marque'] = (int)$_GET['marque'];
    }
    
    // Filtre par categorie
    if (!empty($_GET['categorie'])) {
        $where[] = 'p.categorie_id = :categorie';
        $params[':categorie'] = (int)$_GET['categorie'];
    }
    
    // Filtre par prix
    if (!empty($_GET['prix_min'])) {
        $where[] = 'p.prix >= :prix_min';
        $params[':prix_min'] = (float)$_GET['prix_min'];
    }
    if (!empty($_GET['prix_max'])) {
        $where[] = 'p.prix <= :prix_max';
        $params[':prix_max'] = (float)$_GET['prix_max'];
    }
    
    // Filtre produits en vedette
    if (isset($_GET['en_vedette']) && $_GET['en_vedette'] === '1') {
        $where[] = 'p.en_vedette = 1';
    }
    
    // Filtre nouveautes
    if (isset($_GET['nouveautes']) && $_GET['nouveautes'] === '1') {
        $where[] = 'p.est_nouveau = 1';
    }
    
    // Filtre promotions
    if (isset($_GET['promos']) && $_GET['promos'] === '1') {
        $where[] = 'p.est_promo = 1';
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Tri
    $orderBy = 'p.created_at DESC';
    if (!empty($_GET['sort'])) {
        switch ($_GET['sort']) {
            case 'prix_asc':
                $orderBy = 'p.prix ASC';
                break;
            case 'prix_desc':
                $orderBy = 'p.prix DESC';
                break;
            case 'nom':
                $orderBy = 'p.nom ASC';
                break;
            case 'populaire':
                $orderBy = 'p.note_moyenne DESC, p.nombre_avis DESC';
                break;
        }
    }
    
    // Compter le total
    $countSql = "SELECT COUNT(*) FROM produits p WHERE $whereClause";
    $stmt = $pdo->prepare($countSql);
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
    
    // Recuperer les produits
    $sql = "SELECT p.*, m.nom as marque_nom, c.nom as categorie_nom
            FROM produits p
            LEFT JOIN marques m ON p.marque_id = m.id
            LEFT JOIN categories c ON p.categorie_id = c.id
            WHERE $whereClause
            ORDER BY $orderBy
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $produits = $stmt->fetchAll();
    
    jsonResponse([
        'data' => $produits,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Recuperer un produit par ID
 */
function getProduit($pdo, $id) {
    $sql = "SELECT p.*, m.nom as marque_nom, m.slug as marque_slug, c.nom as categorie_nom
            FROM produits p
            LEFT JOIN marques m ON p.marque_id = m.id
            LEFT JOIN categories c ON p.categorie_id = c.id
            WHERE p.id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $produit = $stmt->fetch();
    
    if (!$produit) {
        jsonResponse(['error' => 'Produit non trouve'], 404);
    }
    
    // Recuperer les avis approuves
    $sqlAvis = "SELECT a.*, c.nom_complet as client_nom 
                FROM avis a 
                LEFT JOIN clients c ON a.client_id = c.id
                WHERE a.produit_id = :id AND a.approuve = 1 
                ORDER BY a.created_at DESC 
                LIMIT 10";
    $stmtAvis = $pdo->prepare($sqlAvis);
    $stmtAvis->execute([':id' => $id]);
    $produit['avis'] = $stmtAvis->fetchAll();
    
    // Produits similaires
    $sqlSimilaires = "SELECT id, nom, slug, prix, prix_promo, image 
                      FROM produits 
                      WHERE marque_id = :marque_id AND id != :id 
                      LIMIT 4";
    $stmtSimilaires = $pdo->prepare($sqlSimilaires);
    $stmtSimilaires->execute([':marque_id' => $produit['marque_id'], ':id' => $id]);
    $produit['similaires'] = $stmtSimilaires->fetchAll();
    
    jsonResponse($produit);
}

/**
 * Creer un nouveau produit (Admin)
 */
function createProduit($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $required = ['nom', 'prix'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            jsonResponse(['error' => "Le champ $field est requis"], 400);
        }
    }
    
    $slug = createSlug($data['nom']);
    
    // Verifier unicite du slug
    $stmt = $pdo->prepare("SELECT id FROM produits WHERE slug = :slug");
    $stmt->execute([':slug' => $slug]);
    if ($stmt->fetch()) {
        $slug .= '-' . time();
    }
    
    $sql = "INSERT INTO produits (nom, slug, description, prix, prix_promo, image, marque_id, categorie_id, stock, en_vedette, est_nouveau, est_promo)
            VALUES (:nom, :slug, :description, :prix, :prix_promo, :image, :marque_id, :categorie_id, :stock, :en_vedette, :est_nouveau, :est_promo)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nom' => sanitize($data['nom']),
        ':slug' => $slug,
        ':description' => sanitize($data['description'] ?? ''),
        ':prix' => (float)$data['prix'],
        ':prix_promo' => !empty($data['prix_promo']) ? (float)$data['prix_promo'] : null,
        ':image' => sanitize($data['image'] ?? ''),
        ':marque_id' => !empty($data['marque_id']) ? (int)$data['marque_id'] : null,
        ':categorie_id' => !empty($data['categorie_id']) ? (int)$data['categorie_id'] : null,
        ':stock' => (int)($data['stock'] ?? 0),
        ':en_vedette' => !empty($data['en_vedette']) ? 1 : 0,
        ':est_nouveau' => !empty($data['est_nouveau']) ? 1 : 0,
        ':est_promo' => !empty($data['est_promo']) ? 1 : 0
    ]);
    
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()], 201);
}

/**
 * Mettre a jour un produit (Admin)
 */
function updateProduit($pdo, $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $fields = [];
    $params = [':id' => $id];
    
    $allowedFields = ['nom', 'description', 'prix', 'prix_promo', 'image', 'marque_id', 'categorie_id', 'stock', 'en_vedette', 'est_nouveau', 'est_promo'];
    
    foreach ($allowedFields as $field) {
        if (isset($data[$field])) {
            $fields[] = "$field = :$field";
            $params[":$field"] = $data[$field];
        }
    }
    
    if (empty($fields)) {
        jsonResponse(['error' => 'Aucun champ a mettre a jour'], 400);
    }
    
    $sql = "UPDATE produits SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    jsonResponse(['success' => true]);
}

/**
 * Supprimer un produit (Admin)
 */
function deleteProduit($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM produits WHERE id = :id");
    $stmt->execute([':id' => $id]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'Produit non trouve'], 404);
    }
    
    jsonResponse(['success' => true]);
}

/**
 * Creer un slug a partir du nom
 */
function createSlug($text) {
    $text = preg_replace('~[^\pL\d]+~u', '-', $text);
    $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
    $text = preg_replace('~[^-\w]+~', '', $text);
    $text = trim($text, '-');
    $text = preg_replace('~-+~', '-', $text);
    $text = strtolower($text);
    return $text;
}
