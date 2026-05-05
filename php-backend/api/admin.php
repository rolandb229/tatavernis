<?php
/**
 * API Admin - Tatavernis
 * Authentification et statistiques
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($action) {
    case 'login':
        login($pdo);
        break;
    
    case 'logout':
        logout();
        break;
    
    case 'stats':
        getStats($pdo);
        break;
    
    case 'check':
        checkSession();
        break;
    
    default:
        jsonResponse(['error' => 'Action non reconnue'], 400);
}

function login($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['email']) || empty($data['password'])) {
        jsonResponse(['error' => 'Email et mot de passe requis'], 400);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM administrateurs WHERE email = :email");
    $stmt->execute([':email' => $data['email']]);
    $admin = $stmt->fetch();
    
    if (!$admin || !password_verify($data['password'], $admin['mot_de_passe'])) {
        jsonResponse(['error' => 'Identifiants incorrects'], 401);
    }
    
    session_start();
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_nom'] = $admin['nom'];
    $_SESSION['admin_email'] = $admin['email'];
    
    jsonResponse([
        'success' => true,
        'admin' => [
            'id' => $admin['id'],
            'nom' => $admin['nom'],
            'email' => $admin['email']
        ]
    ]);
}

function logout() {
    session_start();
    session_destroy();
    jsonResponse(['success' => true]);
}

function checkSession() {
    session_start();
    if (isset($_SESSION['admin_id'])) {
        jsonResponse([
            'authenticated' => true,
            'admin' => [
                'id' => $_SESSION['admin_id'],
                'nom' => $_SESSION['admin_nom'],
                'email' => $_SESSION['admin_email']
            ]
        ]);
    } else {
        jsonResponse(['authenticated' => false]);
    }
}

function getStats($pdo) {
    // Nombre de visiteurs (30 derniers jours)
    $stmt = $pdo->query("SELECT COUNT(*) FROM visiteurs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $visiteurs = $stmt->fetchColumn();
    
    // Visiteurs aujourd'hui
    $stmt = $pdo->query("SELECT COUNT(*) FROM visiteurs WHERE DATE(created_at) = CURDATE()");
    $visiteursAujourdhui = $stmt->fetchColumn();
    
    // Nombre total de commandes
    $stmt = $pdo->query("SELECT COUNT(*) FROM commandes");
    $totalCommandes = $stmt->fetchColumn();
    
    // Commandes par statut
    $stmt = $pdo->query("SELECT statut, COUNT(*) as count FROM commandes GROUP BY statut");
    $commandesParStatut = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    // Commandes du jour
    $stmt = $pdo->query("SELECT COUNT(*) FROM commandes WHERE DATE(created_at) = CURDATE()");
    $commandesAujourdhui = $stmt->fetchColumn();
    
    // Revenus total
    $stmt = $pdo->query("SELECT COALESCE(SUM(montant_total), 0) FROM commandes WHERE statut IN ('paye', 'valide', 'livre')");
    $revenuTotal = $stmt->fetchColumn();
    
    // Revenus du mois
    $stmt = $pdo->query("SELECT COALESCE(SUM(montant_total), 0) FROM commandes WHERE statut IN ('paye', 'valide', 'livre') AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())");
    $revenuMois = $stmt->fetchColumn();
    
    // Nombre de produits
    $stmt = $pdo->query("SELECT COUNT(*) FROM produits");
    $totalProduits = $stmt->fetchColumn();
    
    // Produits les plus vendus
    $stmt = $pdo->query("SELECT p.nom, p.image, SUM(cp.quantite) as total_vendu 
                        FROM commande_produits cp 
                        JOIN produits p ON cp.produit_id = p.id 
                        JOIN commandes c ON cp.commande_id = c.id 
                        WHERE c.statut IN ('paye', 'valide', 'livre')
                        GROUP BY p.id 
                        ORDER BY total_vendu DESC 
                        LIMIT 5");
    $produitsPopulaires = $stmt->fetchAll();
    
    // Dernieres commandes
    $stmt = $pdo->query("SELECT co.id, co.code_secret, co.montant_total, co.statut, co.created_at, cl.nom_complet 
                        FROM commandes co 
                        JOIN clients cl ON co.client_id = cl.id 
                        ORDER BY co.created_at DESC 
                        LIMIT 10");
    $dernieresCommandes = $stmt->fetchAll();
    
    jsonResponse([
        'visiteurs' => [
            'total_30_jours' => (int)$visiteurs,
            'aujourdhui' => (int)$visiteursAujourdhui
        ],
        'commandes' => [
            'total' => (int)$totalCommandes,
            'aujourdhui' => (int)$commandesAujourdhui,
            'par_statut' => $commandesParStatut
        ],
        'revenus' => [
            'total' => (float)$revenuTotal,
            'mois' => (float)$revenuMois
        ],
        'produits' => [
            'total' => (int)$totalProduits,
            'populaires' => $produitsPopulaires
        ],
        'dernieres_commandes' => $dernieresCommandes
    ]);
}
