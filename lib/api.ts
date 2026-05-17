// Configuration API pour Tatavernis - Next.js API Routes

// Helper generique pour les requetes API
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
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
    return fetchAPI<{ data: any[]; pagination: any }>(`/api/produits${query}`)
  },
  getProduit: (id: number | string) =>
    fetchAPI<any>(`/api/produits?id=${id}`),
  getProduitBySlug: (slug: string) =>
    fetchAPI<any>(`/api/produits?slug=${encodeURIComponent(slug)}`),
  createProduit: (data: any) =>
    fetchAPI<any>('/api/produits', { method: 'POST', body: JSON.stringify(data) }),
  updateProduit: (id: number, data: any) =>
    fetchAPI<any>(`/api/produits?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduit: (id: number) =>
    fetchAPI<any>(`/api/produits?id=${id}`, { method: 'DELETE' }),

  // --- Marques ---
  getMarques: () => fetchAPI<any[]>('/api/marques'),
  createMarque: (data: any) =>
    fetchAPI<any>('/api/marques', { method: 'POST', body: JSON.stringify(data) }),
  updateMarque: (id: number, data: any) =>
    fetchAPI<any>(`/api/marques?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMarque: (id: number) =>
    fetchAPI<any>(`/api/marques?id=${id}`, { method: 'DELETE' }),

  // --- Categories ---
  getCategories: () => fetchAPI<any[]>('/api/categories'),
  createCategorie: (data: any) =>
    fetchAPI<any>('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategorie: (id: number, data: any) =>
    fetchAPI<any>(`/api/categories?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategorie: (id: number) =>
    fetchAPI<any>(`/api/categories?id=${id}`, { method: 'DELETE' }),

  // --- Commandes ---
  createCommande: (data: any) =>
    fetchAPI<any>('/api/commandes', { method: 'POST', body: JSON.stringify(data) }),
  getCommandes: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchAPI<{ data: any[]; pagination: any }>(`/api/commandes${query}`)
  },
  getCommande: (id: number) =>
    fetchAPI<any>(`/api/commandes?id=${id}`),
  updateCommandeStatut: (id: number, statut: string) =>
    fetchAPI<any>(`/api/commandes?action=update-status`, {
      method: 'POST',
      body: JSON.stringify({ id, statut }),
    }),
  verifierCode: (code: string) =>
    fetchAPI<any>(`/api/commandes?action=verify&code=${encodeURIComponent(code)}`),
  deleteCommande: (id: number) =>
    fetchAPI<any>(`/api/commandes?id=${id}`, { method: 'DELETE' }),

  // --- Articles ---
  getArticles: (admin = false) =>
    fetchAPI<any[]>(`/api/articles${admin ? '?admin=1' : ''}`),
  getArticle: (id: number) =>
    fetchAPI<any>(`/api/articles?id=${id}`),
  getArticleBySlug: (slug: string) =>
    fetchAPI<any>(`/api/articles?slug=${encodeURIComponent(slug)}`),
  createArticle: (data: any) =>
    fetchAPI<any>('/api/articles', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id: number, data: any) =>
    fetchAPI<any>(`/api/articles?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle: (id: number) =>
    fetchAPI<any>(`/api/articles?id=${id}`, { method: 'DELETE' }),

  // --- Avis ---
  getAvis: (produitId?: number, admin = false) => {
    const params = new URLSearchParams()
    if (produitId) params.set('produit_id', String(produitId))
    if (admin) params.set('admin', '1')
    return fetchAPI<any[]>(`/api/avis?${params}`)
  },
  createAvis: (data: any) =>
    fetchAPI<any>('/api/avis', { method: 'POST', body: JSON.stringify(data) }),
  approuverAvis: (id: number, approuve: boolean) =>
    fetchAPI<any>(`/api/avis?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify({ approuve }),
    }),
  deleteAvis: (id: number) =>
    fetchAPI<any>(`/api/avis?id=${id}`, { method: 'DELETE' }),

  // --- Admin ---
  adminLogin: (email: string, password: string) =>
    fetchAPI<any>(`/api/admin?action=login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  adminLogout: () =>
    fetchAPI<any>(`/api/admin?action=logout`, { method: 'POST' }),
  adminCheck: () =>
    fetchAPI<any>(`/api/admin?action=check`),
  getStats: () =>
    fetchAPI<any>(`/api/admin?action=stats`),

  // --- Search ---
  search: (query: string, limit?: number) => {
    const params = new URLSearchParams({ q: query })
    if (limit) params.set('limit', String(limit))
    return fetchAPI<{ produits: any[]; categories: any[]; marques: any[] }>(`/api/search?${params}`)
  },

  // --- FedaPay ---
  createPayment: (data: {
    amount: number;
    description?: string;
    customer: { email: string; phone: string; firstname?: string; lastname?: string; nom?: string };
    callback_url?: string;
    order_id?: string;
  }) =>
    fetchAPI<{ success: boolean; transaction_id: string; payment_url: string; token: string }>(
      '/api/fedapay?action=create-transaction',
      { method: 'POST', body: JSON.stringify(data) }
    ),
  verifyPayment: (transactionId: string) =>
    fetchAPI<any>('/api/fedapay?action=verify', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId }),
    }),
}

// -------------------------------------------------------
// Utilitaires
// -------------------------------------------------------

// Configuration Fedapay
export const FEDAPAY_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_FEDAPAY_PUBLIC_KEY || 'pk_live_C4YdTm-1w4BjEeYt2Wc3fNtj',
}

// WhatsApp
export const WHATSAPP_NUMBER = '229197999990'
export const CONTACT_EMAIL = 'niressedigital@gmail.com'
export const CONTACT_PHONE = '0197999990'

// Reseaux sociaux
export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/modconceptbenin',
  tiktok: 'https://www.tiktok.com/@tatavernis229benin',
}

// Lien WhatsApp pour un produit
export function getWhatsAppLink(produit?: { nom: string; prix: number }) {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`
  if (produit) {
    const message = encodeURIComponent(
      `Bonjour, je suis interessé(e) par le produit *${produit.nom}*.\n\nPrix : *${formatPrice(produit.prix)}*\n\nMerci de me donner plus d'informations.`
    )
    return `${baseUrl}?text=${message}`
  }
  return baseUrl
}

// Formatter le prix en FCFA
export function formatPrice(price: number): string {
  return (
    new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' FCFA'
  )
}

// Labels statuts commandes
export const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  paye: 'Payé',
  valide: 'Validé',
  en_livraison: 'En livraison',
  livre: 'Livré',
  annule: 'Annulé',
}

export const STATUT_COLORS: Record<string, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  paye: 'bg-blue-100 text-blue-800',
  valide: 'bg-indigo-100 text-indigo-800',
  en_livraison: 'bg-orange-100 text-orange-800',
  livre: 'bg-green-100 text-green-800',
  annule: 'bg-red-100 text-red-800',
}

// Get status badge class
export function getStatutBadgeClass(statut: string): string {
  return STATUT_COLORS[statut] || 'bg-gray-100 text-gray-800'
}
