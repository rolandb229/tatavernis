<?php
/**
 * API Upload - Tatavernis
 * Gestion des uploads d'images et videos
 */

require_once __DIR__ . '/../config.php';
setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Methode non autorisee'], 405);
}

// Verifier qu'un fichier a ete envoye
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $errorMessages = [
        UPLOAD_ERR_INI_SIZE => 'Fichier trop volumineux (limite serveur)',
        UPLOAD_ERR_FORM_SIZE => 'Fichier trop volumineux',
        UPLOAD_ERR_PARTIAL => 'Fichier partiellement telecharge',
        UPLOAD_ERR_NO_FILE => 'Aucun fichier selectionne',
        UPLOAD_ERR_NO_TMP_DIR => 'Dossier temporaire manquant',
        UPLOAD_ERR_CANT_WRITE => 'Impossible d\'ecrire le fichier',
    ];
    $error = $errorMessages[$_FILES['file']['error']] ?? 'Erreur d\'upload';
    jsonResponse(['error' => $error], 400);
}

$file = $_FILES['file'];
$type = isset($_POST['type']) ? $_POST['type'] : 'image';

// Configuration
$uploadDir = __DIR__ . '/../uploads/';
$maxSize = 10 * 1024 * 1024; // 10 MB

$allowedTypes = [
    'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    'video' => ['video/mp4', 'video/webm', 'video/ogg']
];

// Verifier le type de fichier
$mimeType = mime_content_type($file['tmp_name']);
if (!in_array($mimeType, $allowedTypes[$type] ?? $allowedTypes['image'])) {
    jsonResponse(['error' => 'Type de fichier non autorise'], 400);
}

// Verifier la taille
if ($file['size'] > $maxSize) {
    jsonResponse(['error' => 'Fichier trop volumineux (max 10 MB)'], 400);
}

// Creer le dossier si necessaire
$subDir = $type === 'video' ? 'videos/' : 'images/';
$targetDir = $uploadDir . $subDir;
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

// Generer un nom unique
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$newName = uniqid('tatavernis_') . '_' . time() . '.' . $extension;
$targetPath = $targetDir . $newName;

// Deplacer le fichier
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // URL relative pour l'acces
    $url = '/uploads/' . $subDir . $newName;
    
    jsonResponse([
        'success' => true,
        'url' => $url,
        'filename' => $newName,
        'size' => $file['size'],
        'type' => $mimeType
    ]);
} else {
    jsonResponse(['error' => 'Erreur lors de l\'enregistrement du fichier'], 500);
}
