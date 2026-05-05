// Configuration API pour Tatavernis
// Pointez vers votre backend PHP sur XAMPP

export const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
  : 'http://localhost/tatavernis/php-backend'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost/tatavernis/php-backend/api'

export const API_ENDPOINTS = {
  produits:    `${API_BASE_URL}/produits.php`,
  marques:     `${API_BASE_URL}/marques.php`,
  categories:  `${API_BASE_URL}/categories.php`,
  commandes:   `${API_BASE_URL}/commandes.php`,
  articles:    `${API_BASE_URL}/articles.php`,
  avis:        `${API_BASE_URL}/avis.php`,
  admin:       `${API_BASE_URL}/admin.php`,
  upload:      `${API_BASE_URL}/upload.php`,
  parametres:  `${API_BASE_URL}/parametres.php`,
}

// Helper generique pour les requetes API
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include', // sessions PHP (admin)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
    throw new Error(error.error || `Erreur ${response.status}`)
  }

  return response.json()
}

// -------------------------------------------------------
// API Client (boutique)
// -------------------------------------------------------
export const api = {
  // --- Produits ---
  getProduits: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchAPI<{ data: any[]; pagination: any }>(
      `${API_ENDPOINTS.produits}${query}`
    )
  },
  getProduit: (id: number | string) =>
    fetchAPI<any>(`${API_ENDPOINTS.produits}?id=${id}`),
  createProduit: (data: any) =>
    fetchAPI<any>(API_ENDPOINTS.produits, { method: 'POST', body: JSON.stringify(data) }),
  updateProduit: (id: number, data: any) =>
    fetchAPI<any>(`${API_ENDPOINTS.produits}?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduit: (id: number) =>
    fetchAPI<any>(`${API_ENDPOINTS.produits}?id=${id}`, { method: 'DELETE' }),

  // --- Marques ---
  getMarques: () => fetchAPI<any[]>(API_ENDPOINTS.marques),
  createMarque: (data: any) =>
    fetchAPI<any>(API_ENDPOINTS.marques, { method: 'POST', body: JSON.stringify(data) }),
  updateMarque: (id: number, data: any) =>
    fetchAPI<any>(`${API_ENDPOINTS.marques}?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMarque: (id: number) =>
    fetchAPI<any>(`${API_ENDPOINTS.marques}?id=${id}`, { method: 'DELETE' }),

  // --- Categories ---
  getCategories: () => fetchAPI<any[]>(API_ENDPOINTS.categories),
  createCategorie: (data: any) =>
    fetchAPI<any>(API_ENDPOINTS.categories, { method: 'POST', body: JSON.stringify(data) }),
  updateCategorie: (id: number, data: any) =>
    fetchAPI<any>(`${API_ENDPOINTS.categories}?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategorie: (id: number) =>
    fetchAPI<any>(`${API_ENDPOINTS.categories}?id=${id}`, { method: 'DELETE' }),

  // --- Commandes ---
  createCommande: (data: any) =>
    fetchAPI<any>(API_ENDPOINTS.commandes, { method: 'POST', body: JSON.stringify(data) }),
  getCommandes: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchAPI<{ data: any[]; pagination: any }>(`${API_ENDPOINTS.commandes}${query}`)
  },
  getCommande: (id: number) =>
    fetchAPI<any>(`${API_ENDPOINTS.commandes}?id=${id}`),
  updateCommandeStatut: (id: number, statut: string) =>
    fetchAPI<any>(`${API_ENDPOINTS.commandes}?action=update-status`, {
      method: 'POST',
      body: JSON.stringify({ id, statut }),
    }),
  verifierCode: (code: string) =>
    fetchAPI<any>(`${API_ENDPOINTS.commandes}?action=verify&code=${encodeURIComponent(code)}`),

  // --- Articles ---
  getArticles: (admin = false) =>
    fetchAPI<any[]>(`${API_ENDPOINTS.articles}${admin ? '?admin=1' : ''}`),
  getArticle: (id: number) =>
    fetchAPI<any>(`${API_ENDPOINTS.articles}?id=${id}`),
  getArticleBySlug: (slug: string) =>
    fetchAPI<any>(`${API_ENDPOINTS.articles}?slug=${encodeURIComponent(slug)}`),
  createArticle: (data: any) =>
    fetchAPI<any>(API_ENDPOINTS.articles, { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id: number, data: any) =>
    fetchAPI<any>(`${API_ENDPOINTS.articles}?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id: number) =>
    fetchAPI<any>(`${API_ENDPOINTS.articles}?id=${id}`, { method: 'DELETE' }),

  // --- Avis ---
  getAvis: (produitId?: number, admin = false) => {
    const params = new URLSearchParams()
    if (produitId) params.set('produit_id', String(produitId))
    if (admin) params.set('admin', '1')
    return fetchAPI<any[]>(`${API_ENDPOINTS.avis}?${params}`)
  },
  createAvis: (data: any) =>
    fetchAPI<any>(API_ENDPOINTS.avis, { method: 'POST', body: JSON.stringify(data) }),
  approuverAvis: (id: number, approuve: boolean) =>
    fetchAPI<any>(`${API_ENDPOINTS.avis}?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ approuve }),
    }),
  deleteAvis: (id: number) =>
    fetchAPI<any>(`${API_ENDPOINTS.avis}?id=${id}`, { method: 'DELETE' }),

  // --- Admin ---
  adminLogin: (email: string, password: string) =>
    fetchAPI<any>(`${API_ENDPOINTS.admin}?action=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  adminLogout: () =>
    fetchAPI<any>(`${API_ENDPOINTS.admin}?action=logout`),
  adminCheck: () =>
    fetchAPI<any>(`${API_ENDPOINTS.admin}?action=check`),
  getStats: () =>
    fetchAPI<any>(`${API_ENDPOINTS.admin}?action=stats`),

  // --- Parametres ---
  getParametres: () => fetchAPI<Record<string, string>>(API_ENDPOINTS.parametres),
  updateParametres: (data: Record<string, string>) =>
    fetchAPI<any>(API_ENDPOINTS.parametres, { method: 'POST', body: JSON.stringify(data) }),
}

// -------------------------------------------------------
// Utilitaires
// -------------------------------------------------------

// Configuration Fedapay
export const FEDAPAY_CONFIG = {
  publicKey: 'pk_live_C4YdTm-1w4BjEeYt2Wc3fNtj',
}

// WhatsApp
export const WHATSAPP_NUMBER = '229197999990'
export const CONTACT_EMAIL   = 'niressedigital@gmail.com'
export const CONTACT_PHONE   = '0197999990'

// Reseaux sociaux
export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/modconceptbenin',
  tiktok:   'https://www.tiktok.com/@tatavernis229benin',
}

// Lien WhatsApp pour un produit
export function getWhatsAppLink(produit?: { nom: string; prix: number }) {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`
  if (produit) {
    const message = encodeURIComponent(
      `Bonjour, je suis interesse(e) par le parfum *${produit.nom}*.\n\nPrix : *${formatPrice(produit.prix)}*\n\nMerci de me donner plus d'informations.`
    )
    return `${baseUrl}?text=${message}`
  }
  return baseUrl
}

// Formatter le prix en FCFA
export function formatPrice(price: number): string {
  return (
    new Intl.NumberFormat('fr-FR', {
      style:                 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' FCFA'
  )
}

// Labels statuts commandes
export const STATUT_LABELS: Record<string, string> = {
  en_attente:   'En attente',
  paye:         'Payé',
  valide:       'Validé',
  en_livraison: 'En livraison',
  livre:        'Livré',
  annule:       'Annulé',
}

export const STATUT_COLORS: Record<string, string> = {
  en_attente:   'bg-yellow-100 text-yellow-800',
  paye:         'bg-blue-100 text-blue-800',
  valide:       'bg-indigo-100 text-indigo-800',
  en_livraison: 'bg-orange-100 text-orange-800',
  livre:        'bg-green-100 text-green-800',
  annule:       'bg-red-100 text-red-800',
}
