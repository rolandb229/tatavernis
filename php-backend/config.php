<?php
/**
 * Configuration de la base de donnees Tatavernis
 * A modifier selon votre configuration XAMPP
 */

// Configuration de la base de donnees
define('DB_HOST', 'localhost');
define('DB_NAME', 'tatavernis');
define('DB_USER', 'root');
define('DB_PASS', ''); // Mot de passe vide par defaut sur XAMPP

// Configuration du site
define('SITE_NAME', 'Tatavernis');
define('SITE_URL', 'http://localhost/tatavernis');
define('API_URL', 'http://localhost/tatavernis/php-backend/api');

// Configuration Fedapay
define('FEDAPAY_PUBLIC_KEY', 'pk_live_C4YdTm-1w4BjEeYt2Wc3fNtj');

// Configuration email
define('ADMIN_EMAIL', 'niressedigital@gmail.com');
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'niressedigital@gmail.com');
define('SMTP_PASS', ''); // A configurer

// Configuration WhatsApp
define('WHATSAPP_NUMBER', '229197999990');

// Fuseau horaire
date_default_timezone_set('Africa/Porto-Novo');

// Connexion PDO
function getConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Erreur de connexion a la base de donnees']);
        exit;
    }
}

// Headers CORS pour l'API
function setCorsHeaders() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Generer un code secret unique pour les commandes
function generateSecretCode() {
    return 'TV-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
}

// Valider et nettoyer les entrees
function sanitize($input) {
    if (is_array($input)) {
        return array_map('sanitize', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Reponse JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// Verifier l'authentification admin
function checkAdminAuth() {
    session_start();
    if (!isset($_SESSION['admin_id'])) {
        jsonResponse(['error' => 'Non autorise'], 401);
    }
}
