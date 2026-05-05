<?php
/**
 * API Avis - Tatavernis
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$produitId = isset($_GET['produit_id']) ? (int)$_GET['produit_id'] : null;

switch ($method) {
    case 'GET':
        getAvis($pdo, $produitId);
        break;
    
    case 'POST':
        createAvis($pdo);
        break;
    
    case 'PUT':
        if ($id) approveAvis($pdo, $id);
        break;
    
    case 'DELETE':
        if ($id) deleteAvis($pdo, $id);
        break;
    
    default:
        jsonResponse(['error' => 'Methode non autorisee'], 405);
}

function getAvis($pdo, $produitId) {
    $isAdmin = isset($_GET['admin']);
    
    if ($produitId) {
        $sql = "SELECT a.*, c.nom_complet as client_nom 
                FROM avis a 
                LEFT JOIN clients c ON a.client_id = c.id 
                WHERE a.produit_id = :produit_id";
        if (!$isAdmin) {
            $sql .= " AND a.approuve = 1";
        }
        $sql .= " ORDER BY a.created_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':produit_id' => $produitId]);
    } else {
        // Admin: tous les avis
        $sql = "SELECT a.*, p.nom as produit_nom, c.nom_complet as client_nom 
                FROM avis a 
                JOIN produits p ON a.produit_id = p.id 
                LEFT JOIN clients c ON a.client_id = c.id 
                ORDER BY a.created_at DESC";
        $stmt = $pdo->query($sql);
    }
    
    jsonResponse($stmt->fetchAll());
}

function createAvis($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['produit_id']) || empty($data['note']) || empty($data['nom_client'])) {
        jsonResponse(['error' => 'Produit, note et nom requis'], 400);
    }
    
    $note = max(1, min(5, (int)$data['note']));
    
    $stmt = $pdo->prepare("INSERT INTO avis (produit_id, nom_client, note, commentaire, approuve) 
                          VALUES (:produit_id, :nom, :note, :commentaire, 0)");
    $stmt->execute([
        ':produit_id' => (int)$data['produit_id'],
        ':nom' => sanitize($data['nom_client']),
        ':note' => $note,
        ':commentaire' => sanitize($data['commentaire'] ?? '')
    ]);
    
    jsonResponse(['success' => true, 'message' => 'Votre avis sera publie apres validation'], 201);
}

function approveAvis($pdo, $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    $approuve = !empty($data['approuve']) ? 1 : 0;
    
    $stmt = $pdo->prepare("UPDATE avis SET approuve = :approuve WHERE id = :id");
    $stmt->execute([':approuve' => $approuve, ':id' => $id]);
    
    // Mettre a jour la note moyenne du produit
    $stmt = $pdo->prepare("SELECT produit_id FROM avis WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $avis = $stmt->fetch();
    
    if ($avis) {
        updateProductRating($pdo, $avis['produit_id']);
    }
    
    jsonResponse(['success' => true]);
}

function deleteAvis($pdo, $id) {
    // Recuperer produit_id avant suppression
    $stmt = $pdo->prepare("SELECT produit_id FROM avis WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $avis = $stmt->fetch();
    
    $stmt = $pdo->prepare("DELETE FROM avis WHERE id = :id");
    $stmt->execute([':id' => $id]);
    
    if ($avis) {
        updateProductRating($pdo, $avis['produit_id']);
    }
    
    jsonResponse(['success' => true]);
}

function updateProductRating($pdo, $produitId) {
    $stmt = $pdo->prepare("SELECT AVG(note) as moyenne, COUNT(*) as total FROM avis WHERE produit_id = :id AND approuve = 1");
    $stmt->execute([':id' => $produitId]);
    $result = $stmt->fetch();
    
    $stmt = $pdo->prepare("UPDATE produits SET note_moyenne = :moyenne, nombre_avis = :total WHERE id = :id");
    $stmt->execute([
        ':moyenne' => $result['moyenne'] ?? 0,
        ':total' => $result['total'] ?? 0,
        ':id' => $produitId
    ]);
}
