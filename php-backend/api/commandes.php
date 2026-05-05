<?php
/**
 * API Commandes - Tatavernis
 * Gestion des commandes et paiements
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$action = isset($_GET['action']) ? $_GET['action'] : null;

switch ($method) {
    case 'GET':
        if ($action === 'verify') {
            verifyCode($pdo);
        } elseif ($id) {
            getCommande($pdo, $id);
        } else {
            getCommandes($pdo);
        }
        break;
    
    case 'POST':
        if ($action === 'update-status') {
            updateStatus($pdo);
        } else {
            createCommande($pdo);
        }
        break;
    
    case 'PUT':
        if ($id) {
            updateCommande($pdo, $id);
        }
        break;
    
    default:
        jsonResponse(['error' => 'Methode non autorisee'], 405);
}

/**
 * Creer une nouvelle commande
 */
function createCommande($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validation
    $required = ['nom_complet', 'telephone', 'mode_reception', 'produits'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            jsonResponse(['error' => "Le champ $field est requis"], 400);
        }
    }
    
    if (!is_array($data['produits']) || count($data['produits']) === 0) {
        jsonResponse(['error' => 'Le panier est vide'], 400);
    }
    
    try {
        $pdo->beginTransaction();
        
        // Creer ou trouver le client
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE telephone = :telephone");
        $stmt->execute([':telephone' => $data['telephone']]);
        $client = $stmt->fetch();
        
        if ($client) {
            $clientId = $client['id'];
            // Mettre a jour les infos
            $stmt = $pdo->prepare("UPDATE clients SET nom_complet = :nom, adresse = :adresse, email = :email WHERE id = :id");
            $stmt->execute([
                ':nom' => sanitize($data['nom_complet']),
                ':adresse' => sanitize($data['adresse'] ?? ''),
                ':email' => sanitize($data['email'] ?? ''),
                ':id' => $clientId
            ]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO clients (nom_complet, telephone, email, adresse) VALUES (:nom, :telephone, :email, :adresse)");
            $stmt->execute([
                ':nom' => sanitize($data['nom_complet']),
                ':telephone' => sanitize($data['telephone']),
                ':email' => sanitize($data['email'] ?? ''),
                ':adresse' => sanitize($data['adresse'] ?? '')
            ]);
            $clientId = $pdo->lastInsertId();
        }
        
        // Calculer le montant total et verifier les produits
        $montantTotal = 0;
        $produitsDetails = [];
        
        foreach ($data['produits'] as $item) {
            $stmt = $pdo->prepare("SELECT id, nom, prix, prix_promo, stock FROM produits WHERE id = :id");
            $stmt->execute([':id' => (int)$item['id']]);
            $produit = $stmt->fetch();
            
            if (!$produit) {
                throw new Exception("Produit ID {$item['id']} non trouve");
            }
            
            $quantite = max(1, (int)($item['quantite'] ?? 1));
            $prixUnitaire = $produit['prix_promo'] ?? $produit['prix'];
            $montantTotal += $prixUnitaire * $quantite;
            
            $produitsDetails[] = [
                'id' => $produit['id'],
                'nom' => $produit['nom'],
                'quantite' => $quantite,
                'prix_unitaire' => $prixUnitaire
            ];
        }
        
        // Generer le code secret
        $codeSecret = generateSecretCode();
        
        // Verifier unicite du code
        $stmt = $pdo->prepare("SELECT id FROM commandes WHERE code_secret = :code");
        $stmt->execute([':code' => $codeSecret]);
        while ($stmt->fetch()) {
            $codeSecret = generateSecretCode();
            $stmt->execute([':code' => $codeSecret]);
        }
        
        // Creer la commande
        $stmt = $pdo->prepare("INSERT INTO commandes (code_secret, client_id, montant_total, mode_reception, adresse_livraison, notes) 
                              VALUES (:code, :client_id, :montant, :mode, :adresse, :notes)");
        $stmt->execute([
            ':code' => $codeSecret,
            ':client_id' => $clientId,
            ':montant' => $montantTotal,
            ':mode' => $data['mode_reception'],
            ':adresse' => sanitize($data['adresse_livraison'] ?? $data['adresse'] ?? ''),
            ':notes' => sanitize($data['notes'] ?? '')
        ]);
        $commandeId = $pdo->lastInsertId();
        
        // Ajouter les produits a la commande
        $stmt = $pdo->prepare("INSERT INTO commande_produits (commande_id, produit_id, quantite, prix_unitaire) VALUES (:commande, :produit, :quantite, :prix)");
        foreach ($produitsDetails as $produit) {
            $stmt->execute([
                ':commande' => $commandeId,
                ':produit' => $produit['id'],
                ':quantite' => $produit['quantite'],
                ':prix' => $produit['prix_unitaire']
            ]);
        }
        
        $pdo->commit();
        
        // Envoyer email notification (optionnel)
        sendOrderNotification($data['nom_complet'], $codeSecret, $montantTotal, $produitsDetails);
        
        jsonResponse([
            'success' => true,
            'commande_id' => $commandeId,
            'code_secret' => $codeSecret,
            'montant_total' => $montantTotal,
            'produits' => $produitsDetails
        ], 201);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['error' => $e->getMessage()], 400);
    }
}

/**
 * Recuperer toutes les commandes (Admin)
 */
function getCommandes($pdo) {
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $limit = 20;
    $offset = ($page - 1) * $limit;
    
    $where = ['1=1'];
    $params = [];
    
    // Filtre par statut
    if (!empty($_GET['statut'])) {
        $where[] = 'co.statut = :statut';
        $params[':statut'] = $_GET['statut'];
    }
    
    // Filtre par date
    if (!empty($_GET['date_debut'])) {
        $where[] = 'co.created_at >= :date_debut';
        $params[':date_debut'] = $_GET['date_debut'];
    }
    if (!empty($_GET['date_fin'])) {
        $where[] = 'co.created_at <= :date_fin';
        $params[':date_fin'] = $_GET['date_fin'] . ' 23:59:59';
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Compter
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM commandes co WHERE $whereClause");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
    
    // Recuperer
    $sql = "SELECT co.*, cl.nom_complet, cl.telephone, cl.email
            FROM commandes co
            JOIN clients cl ON co.client_id = cl.id
            WHERE $whereClause
            ORDER BY co.created_at DESC
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    
    $commandes = $stmt->fetchAll();
    
    // Ajouter les produits pour chaque commande
    foreach ($commandes as &$commande) {
        $stmt = $pdo->prepare("SELECT cp.*, p.nom, p.image 
                              FROM commande_produits cp 
                              JOIN produits p ON cp.produit_id = p.id 
                              WHERE cp.commande_id = :id");
        $stmt->execute([':id' => $commande['id']]);
        $commande['produits'] = $stmt->fetchAll();
    }
    
    jsonResponse([
        'data' => $commandes,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Recuperer une commande specifique
 */
function getCommande($pdo, $id) {
    $sql = "SELECT co.*, cl.nom_complet, cl.telephone, cl.email, cl.adresse as client_adresse
            FROM commandes co
            JOIN clients cl ON co.client_id = cl.id
            WHERE co.id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $commande = $stmt->fetch();
    
    if (!$commande) {
        jsonResponse(['error' => 'Commande non trouvee'], 404);
    }
    
    // Produits
    $stmt = $pdo->prepare("SELECT cp.*, p.nom, p.image, p.slug 
                          FROM commande_produits cp 
                          JOIN produits p ON cp.produit_id = p.id 
                          WHERE cp.commande_id = :id");
    $stmt->execute([':id' => $id]);
    $commande['produits'] = $stmt->fetchAll();
    
    jsonResponse($commande);
}

/**
 * Verifier un code secret (pour retrait)
 */
function verifyCode($pdo) {
    $code = isset($_GET['code']) ? sanitize($_GET['code']) : '';
    
    if (empty($code)) {
        jsonResponse(['error' => 'Code requis'], 400);
    }
    
    $sql = "SELECT co.*, cl.nom_complet, cl.telephone
            FROM commandes co
            JOIN clients cl ON co.client_id = cl.id
            WHERE co.code_secret = :code";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':code' => $code]);
    $commande = $stmt->fetch();
    
    if (!$commande) {
        jsonResponse(['error' => 'Code invalide', 'valid' => false], 404);
    }
    
    jsonResponse([
        'valid' => true,
        'commande' => $commande
    ]);
}

/**
 * Mettre a jour le statut d'une commande
 */
function updateStatus($pdo) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['id']) || empty($data['statut'])) {
        jsonResponse(['error' => 'ID et statut requis'], 400);
    }
    
    $validStatuts = ['en_attente', 'paye', 'valide', 'en_livraison', 'livre', 'annule'];
    if (!in_array($data['statut'], $validStatuts)) {
        jsonResponse(['error' => 'Statut invalide'], 400);
    }
    
    $stmt = $pdo->prepare("UPDATE commandes SET statut = :statut WHERE id = :id");
    $stmt->execute([':statut' => $data['statut'], ':id' => (int)$data['id']]);
    
    jsonResponse(['success' => true]);
}

/**
 * Mettre a jour une commande apres paiement
 */
function updateCommande($pdo, $id) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $fields = [];
    $params = [':id' => $id];
    
    if (isset($data['statut'])) {
        $fields[] = 'statut = :statut';
        $params[':statut'] = $data['statut'];
    }
    if (isset($data['transaction_id'])) {
        $fields[] = 'transaction_id = :transaction_id';
        $params[':transaction_id'] = $data['transaction_id'];
    }
    if (isset($data['reference_paiement'])) {
        $fields[] = 'reference_paiement = :reference';
        $params[':reference'] = $data['reference_paiement'];
    }
    
    if (empty($fields)) {
        jsonResponse(['error' => 'Aucun champ a mettre a jour'], 400);
    }
    
    $sql = "UPDATE commandes SET " . implode(', ', $fields) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    jsonResponse(['success' => true]);
}

/**
 * Envoyer notification email pour nouvelle commande
 */
function sendOrderNotification($clientNom, $codeSecret, $montant, $produits) {
    $to = ADMIN_EMAIL;
    $subject = "Nouvelle commande recue - " . $codeSecret;
    
    $produitsListe = "";
    foreach ($produits as $p) {
        $produitsListe .= "- {$p['nom']} x{$p['quantite']} : " . number_format($p['prix_unitaire'] * $p['quantite'], 0, ',', ' ') . " FCFA\n";
    }
    
    $message = "Nouvelle commande sur Tatavernis !\n\n";
    $message .= "Client : $clientNom\n";
    $message .= "Code secret : $codeSecret\n";
    $message .= "Montant total : " . number_format($montant, 0, ',', ' ') . " FCFA\n\n";
    $message .= "Produits :\n$produitsListe\n";
    $message .= "Date : " . date('d/m/Y H:i');
    
    $headers = "From: " . ADMIN_EMAIL . "\r\n";
    $headers .= "Reply-To: " . ADMIN_EMAIL . "\r\n";
    
    // Envoyer l'email (peut echouer silencieusement si mail() n'est pas configure)
    @mail($to, $subject, $message, $headers);
}
