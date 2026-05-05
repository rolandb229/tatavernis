-- =====================================================
-- BASE DE DONNEES TATAVERNIS
-- Parfumerie haut de gamme en ligne
-- =====================================================

-- Creer la base de donnees
CREATE DATABASE IF NOT EXISTS tatavernis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tatavernis;

-- =====================================================
-- TABLE: categories
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: marques (Maisons de parfum)
-- =====================================================
CREATE TABLE IF NOT EXISTS marques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: produits (Parfums)
-- =====================================================
CREATE TABLE IF NOT EXISTS produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL,
    prix_promo DECIMAL(10, 2) DEFAULT NULL,
    image VARCHAR(255),
    images_supplementaires JSON,
    marque_id INT,
    categorie_id INT,
    stock INT DEFAULT 0,
    en_vedette BOOLEAN DEFAULT FALSE,
    est_nouveau BOOLEAN DEFAULT FALSE,
    est_promo BOOLEAN DEFAULT FALSE,
    note_moyenne DECIMAL(2, 1) DEFAULT 0,
    nombre_avis INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (marque_id) REFERENCES marques(id) ON DELETE SET NULL,
    FOREIGN KEY (categorie_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_nom (nom),
    INDEX idx_prix (prix),
    INDEX idx_en_vedette (en_vedette),
    INDEX idx_est_promo (est_promo)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: clients
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_complet VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telephone VARCHAR(20) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_telephone (telephone)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: commandes
-- =====================================================
CREATE TABLE IF NOT EXISTS commandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_secret VARCHAR(20) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    montant_total DECIMAL(10, 2) NOT NULL,
    statut ENUM('en_attente', 'paye', 'valide', 'en_livraison', 'livre', 'annule') DEFAULT 'en_attente',
    mode_reception ENUM('retrait', 'livraison') NOT NULL,
    adresse_livraison TEXT,
    notes TEXT,
    transaction_id VARCHAR(100),
    reference_paiement VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_code_secret (code_secret),
    INDEX idx_statut (statut)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: commande_produits (Produits dans une commande)
-- =====================================================
CREATE TABLE IF NOT EXISTS commande_produits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commande_id INT NOT NULL,
    produit_id INT NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (commande_id) REFERENCES commandes(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: favoris
-- =====================================================
CREATE TABLE IF NOT EXISTS favoris (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    produit_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favori (client_id, produit_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: avis
-- =====================================================
CREATE TABLE IF NOT EXISTS avis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produit_id INT NOT NULL,
    client_id INT,
    nom_client VARCHAR(100) NOT NULL,
    note INT NOT NULL CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    approuve BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
    INDEX idx_produit_approuve (produit_id, approuve)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: articles (Blog)
-- =====================================================
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    contenu TEXT NOT NULL,
    extrait VARCHAR(500),
    image VARCHAR(255),
    video_url VARCHAR(255),
    publie BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_publie (publie)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: administrateurs
-- =====================================================
CREATE TABLE IF NOT EXISTS administrateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: visiteurs (Statistiques)
-- =====================================================
CREATE TABLE IF NOT EXISTS visiteurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    user_agent TEXT,
    page_visitee VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- TABLE: parametres
-- =====================================================
CREATE TABLE IF NOT EXISTS parametres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cle VARCHAR(100) NOT NULL UNIQUE,
    valeur TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- DONNEES INITIALES
-- =====================================================

-- Administrateur par defaut (mot de passe: admin123)
INSERT INTO administrateurs (nom, email, mot_de_passe) VALUES 
('Admin Tatavernis', 'niressedigital@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Categories
INSERT INTO categories (nom, slug, description) VALUES
('Homme', 'homme', 'Parfums pour homme'),
('Femme', 'femme', 'Parfums pour femme'),
('Unisexe', 'unisexe', 'Parfums mixtes'),
('Coffrets', 'coffrets', 'Coffrets cadeaux');

-- Marques
INSERT INTO marques (nom, slug, description) VALUES
('Guerlain', 'guerlain', 'Maison de parfum francaise fondee en 1828'),
('Cartier', 'cartier', 'Joaillier et parfumeur de luxe'),
('Burberry', 'burberry', 'Maison britannique de mode et parfums'),
('Jean Paul Gaultier', 'jean-paul-gaultier', 'Createur francais iconique'),
('Maison Francis Kurkdjian', 'maison-francis-kurkdjian', 'Parfumeur de luxe parisien'),
('Ex Nihilo', 'ex-nihilo', 'Parfumerie de niche parisienne'),
('Calvin Klein', 'calvin-klein', 'Marque americaine de mode'),
('Yves Saint Laurent', 'yves-saint-laurent', 'Maison de haute couture francaise'),
('Dior', 'dior', 'Maison de luxe francaise'),
('Fomowa Paris', 'fomowa-paris', 'Parfumerie africaine de luxe');

-- Produits exemples
INSERT INTO produits (nom, slug, description, prix, prix_promo, image, marque_id, categorie_id, stock, en_vedette, est_nouveau, est_promo) VALUES
('Santal Royal', 'santal-royal', 'Un parfum boise et oriental, melange de santal et de notes epices. Une fragrance majestueuse qui evoque les palais orientaux.', 85000, NULL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/af8a8cb572b14d6a977dfeacc2edc4e6-KN2nbPkr6fVz5NTDLh9Fvf0q0CBbUw.jpg', 1, 3, 15, TRUE, FALSE, FALSE),
('Pasha Edition Noire', 'pasha-edition-noire', 'Une eau de toilette masculine intense et raffinee. Notes de bois precieux et de cuir pour un homme elegant.', 65000, 55000, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19e1b43670244fb0ab03ea785067c22c-KDIlZVavMiR6PCHa94jTEWQPsr4dUp.jpg', 2, 1, 20, TRUE, FALSE, TRUE),
('Burberry Hero', 'burberry-hero', 'Un parfum masculin puissant et moderne. Notes de cedre et de pin pour un homme audacieux.', 72000, NULL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ee517ab523154da59ad8e954dd1080e8-GuzKyvVKdeUdpEnXmiCoAbr53IKCJt.jpg', 3, 1, 18, TRUE, FALSE, FALSE),
('Le Male Le Parfum', 'le-male-le-parfum', 'Une version intense du celebre Le Male. Vanille, lavande et notes orientales sensuelles.', 78000, NULL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d44862b49c8647ea8fb54392986922b3-UBefUhiM2ZFOWAVcIJ71rOGCwp3fSg.jpg', 4, 1, 12, TRUE, TRUE, FALSE),
('Baccarat Rouge 540', 'baccarat-rouge-540', 'Un extrait de parfum legendaire. Notes de safran, ambre et cedre pour une signature olfactive unique.', 150000, 135000, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/49208ac133d5448789a5e132f6835933-gAIdnbHGlfd8Aam7jAxV9k0i17GzEF.jpg', 5, 3, 8, TRUE, FALSE, TRUE),
('Fleur Narcotique', 'fleur-narcotique', 'Une eau de parfum florale et addictive. Peche, tubereuse et musc blanc pour une feminite enivrante.', 95000, NULL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f2f18f47693e49ce8789c9f5a9789ede-z0vWRe6QbaVgErMI100VcNdkwBSqft.jpg', 6, 2, 10, FALSE, TRUE, FALSE),
('Defy Parfum', 'defy-parfum', 'Un parfum audacieux et moderne pour homme. Notes aromatiques et boisees.', 58000, NULL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d391ab85bd7e4fe8b1a7820e5cbc3945-UaUlYDbIGxOe0d31wkWxFJLRDxlopH.jpg', 7, 1, 25, FALSE, TRUE, FALSE),
('Kouros Body', 'kouros-body', 'Un classique reinvente. Notes fraiches et sensuelles pour un homme charismatique.', 62000, 52000, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/65248ac1b8954c368fa3ccd3ebab36a9-P2FrcdfZjI4HSv8XQsl8AoKsZFX5Qr.jpg', 8, 1, 14, FALSE, FALSE, TRUE),
('Bois d''Argent', 'bois-dargent', 'Un parfum rare et precieux de la collection privee. Notes de bois et d''encens mystiques.', 180000, NULL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c366796e43f2410198c33fc2a78c796d-07mwh0rwLq3FfL6S2l9Fc39yatFD7U.jpg', 9, 3, 5, TRUE, FALSE, FALSE),
('Epices Exquises', 'epices-exquises', 'Une fragrance orientale gourmande. Melange d''epices chaudes et de notes sucrees.', 88000, NULL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/87265b3f0f06480e8c8a6f970d5a62e8-kGO2X5PfluQ5epxJxEDvThKRv96CRA.jpg', 1, 3, 16, FALSE, TRUE, FALSE),
('Curd Mango Mahachanok', 'curd-mango-mahachanok', 'Un extrait de parfum fruité et exotique. Notes de mangue, vanille et bois précieux.', 120000, 99000, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/973a019144b44920800d930eda4f5f01-HxQe0ElwBbZaQzXxdXm9ABAcmYI7zF.jpg', 10, 3, 7, TRUE, TRUE, TRUE),
('Monaco Tahaa', 'monaco-tahaa', 'Une fragrance tropicale luxueuse. Notes de fruits exotiques et de vanille de Tahiti.', 110000, NULL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f4089867ad94a4bbcbd04e3b3bd655e-aDJZswWz9zHJJLcXGgciuUyKyU9lBE.jpg', 10, 3, 9, FALSE, FALSE, FALSE);

-- Parametres du site
INSERT INTO parametres (cle, valeur) VALUES
('nom_site', 'Tatavernis'),
('telephone', '0197999990'),
('email', 'niressedigital@gmail.com'),
('facebook', 'https://www.facebook.com/modconceptbenin'),
('tiktok', 'tatavernis229benin'),
('adresse', 'Cotonou, Benin'),
('promo_popup_actif', '1'),
('promo_popup_texte', '-20% sur les parfums aujourd''hui !'),
('fedapay_public_key', 'pk_live_C4YdTm-1w4BjEeYt2Wc3fNtj');

-- Articles de blog exemples
INSERT INTO articles (titre, slug, contenu, extrait, image, publie) VALUES
('Comment choisir son parfum ?', 'comment-choisir-son-parfum', 'Le choix d''un parfum est une decision personnelle qui depend de nombreux facteurs. Voici nos conseils pour trouver votre signature olfactive...', 'Decouvrez nos conseils pour trouver le parfum qui vous correspond parfaitement.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/abc2545e7c4141bcbc0b2fbea495681f-zHwomACKMqTjNW4gaFKHDk07wsUXPm.jpg', TRUE),
('Les tendances parfums 2024', 'tendances-parfums-2024', 'Cette annee, les parfums orientaux et les notes gourmandes sont a l''honneur. Decouvrez les fragrances qui marqueront l''annee...', 'Les fragrances incontournables de cette annee.', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f1ce449530b14fc8913f9c96bd3af121-b8TMbBnsZ5oForhDQtpniEWhC8tlhj.jpg', TRUE);
