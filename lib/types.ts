// Types pour Tatavernis

export interface Produit {
  id: number
  nom: string
  slug: string
  description: string
  prix: number
  prix_promo: number | null
  image: string
  images_supplementaires?: string[]
  marque_id: number
  categorie_id: number
  marque_nom?: string
  categorie_nom?: string
  stock: number
  en_vedette: boolean
  est_nouveau: boolean
  est_promo: boolean
  note_moyenne: number
  nombre_avis: number
  created_at: string
  avis?: Avis[]
  similaires?: Produit[]
}

export interface Marque {
  id: number
  nom: string
  slug: string
  logo?: string
  description?: string
  nb_produits?: number
}

export interface Categorie {
  id: number
  nom: string
  slug: string
  description?: string
  image?: string
  nb_produits?: number
}

export interface Client {
  id: number
  nom_complet: string
  email?: string
  telephone: string
  adresse?: string
  ville?: string
}

export interface Commande {
  id: number
  code_secret: string
  client_id: number
  montant_total: number
  statut: 'en_attente' | 'paye' | 'valide' | 'en_livraison' | 'livre' | 'annule'
  mode_reception: 'retrait' | 'livraison'
  adresse_livraison?: string
  notes?: string
  transaction_id?: string
  reference_paiement?: string
  created_at: string
  nom_complet?: string
  telephone?: string
  email?: string
  produits?: CommandeProduit[]
}

export interface CommandeProduit {
  id: number
  commande_id: number
  produit_id: number
  quantite: number
  prix_unitaire: number
  nom?: string
  image?: string
}

export interface Avis {
  id: number
  produit_id: number
  client_id?: number
  nom_client: string
  note: number
  commentaire?: string
  approuve: boolean
  created_at: string
}

export interface Article {
  id: number
  titre: string
  slug: string
  contenu: string
  extrait?: string
  image?: string
  video_url?: string
  publie: boolean
  created_at: string
}

export interface CartItem {
  produit: Produit
  quantite: number
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiResponse<T> {
  data: T
  pagination?: PaginationData
}

export interface Stats {
  visiteurs: {
    total_30_jours: number
    aujourdhui: number
  }
  commandes: {
    total: number
    aujourdhui: number
    par_statut: Record<string, number>
  }
  revenus: {
    total: number
    mois: number
  }
  produits: {
    total: number
    populaires: { nom: string; image: string; total_vendu: number }[]
  }
  dernieres_commandes: Commande[]
}
