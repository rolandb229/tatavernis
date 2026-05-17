'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import ProductCard from '@/components/product-card'
import { Produit, Marque } from '@/lib/types'
import { api, formatPrice } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'

const SAMPLE_PRODUCTS: Produit[] = [
  { id: 1, nom: 'Santal Royal', slug: 'santal-royal', description: 'Un parfum boisé et chaleureux avec des notes de santal précieux.', prix: 85000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/af8a8cb572b14d6a977dfeacc2edc4e6-KN2nbPkr6fVz5NTDLh9Fvf0q0CBbUw.jpg', marque_id: 1, marque_nom: 'Guerlain', categorie_id: 1, categorie_nom: 'Eau de Parfum', stock: 10, en_vedette: true, est_nouveau: false, est_promo: false, note_moyenne: 4.8, nombre_avis: 24, created_at: '2024-01-01' },
  { id: 2, nom: 'Baccarat Rouge 540', slug: 'baccarat-rouge-540', description: 'Un chef-d\'oeuvre olfactif aux notes florales et ambrées.', prix: 125000, prix_promo: 99000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/49208ac133d5448789a5e132f6835933-gAIdnbHGlfd8Aam7jAxV9k0i17GzEF.jpg', marque_id: 2, marque_nom: 'Maison Francis Kurkdjian', categorie_id: 1, categorie_nom: 'Extrait de Parfum', stock: 5, en_vedette: true, est_nouveau: true, est_promo: true, note_moyenne: 5.0, nombre_avis: 48, created_at: '2024-02-01' },
  { id: 3, nom: 'Pasha de Cartier Edition Noire', slug: 'pasha-cartier-edition-noire', description: 'Masculine et audacieux, ce parfum incarne la force avec élégance.', prix: 72000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19e1b43670244fb0ab03ea785067c22c-KDIlZVavMiR6PCHa94jTEWQPsr4dUp.jpg', marque_id: 3, marque_nom: 'Cartier', categorie_id: 2, categorie_nom: 'Eau de Toilette', stock: 8, en_vedette: false, est_nouveau: false, est_promo: false, note_moyenne: 4.5, nombre_avis: 18, created_at: '2024-01-15' },
  { id: 4, nom: 'Burberry Hero', slug: 'burberry-hero', description: 'Un parfum moderne et épicé inspiré de la nature et de l\'aventure.', prix: 58000, prix_promo: 45000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ee517ab523154da59ad8e954dd1080e8-GuzKyvVKdeUdpEnXmiCoAbr53IKCJt.jpg', marque_id: 4, marque_nom: 'Burberry', categorie_id: 1, categorie_nom: 'Parfum', stock: 12, en_vedette: true, est_nouveau: true, est_promo: true, note_moyenne: 4.3, nombre_avis: 31, created_at: '2024-03-01' },
  { id: 5, nom: 'Pannaco Tahaa Mango', slug: 'pannaco-tahaa-mango', description: 'Un extrait de parfum exotique aux notes de mangue et de vanille.', prix: 95000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6d16b40a852f42cea2f0c22c2424b863-ViWss7F8BZz7oAqRYfMeu46C6SgW23.jpg', marque_id: 5, marque_nom: 'Fomowa Paris', categorie_id: 1, categorie_nom: 'Extrait de Parfum', stock: 6, en_vedette: true, est_nouveau: true, est_promo: false, note_moyenne: 4.7, nombre_avis: 15, created_at: '2024-03-15' },
  { id: 6, nom: 'Jean Paul Gaultier Le Male', slug: 'jp-gaultier-le-male', description: 'Une fragrance iconique et séductrice pour l\'homme moderne.', prix: 68000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d44862b49c8647ea8fb54392986922b3-UBefUhiM2ZFOWAVcIJ71rOGCwp3fSg.jpg', marque_id: 6, marque_nom: 'Jean Paul Gaultier', categorie_id: 1, categorie_nom: 'Le Parfum', stock: 9, en_vedette: false, est_nouveau: false, est_promo: false, note_moyenne: 4.6, nombre_avis: 42, created_at: '2024-01-10' },
  { id: 7, nom: 'Bois d\'Argent Dior', slug: 'bois-argent-dior', description: 'Un parfum boisé et iris qui incarne l\'élégance parisienne.', prix: 110000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c366796e43f2410198c33fc2a78c796d-07mwh0rwLq3FfL6S2l9Fc39yatFD7U.jpg', marque_id: 7, marque_nom: 'Christian Dior', categorie_id: 1, categorie_nom: 'Esprit de Parfum', stock: 4, en_vedette: false, est_nouveau: false, est_promo: false, note_moyenne: 4.9, nombre_avis: 27, created_at: '2024-02-15' },
  { id: 8, nom: 'Calvin Klein Defy', slug: 'calvin-klein-defy', description: 'Un parfum frais et énergique pour l\'homme d\'aujourd\'hui.', prix: 55000, prix_promo: 42000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d391ab85bd7e4fe8b1a7820e5cbc3945-UaUlYDbIGxOe0d31wkWxFJLRDxlopH.jpg', marque_id: 8, marque_nom: 'Calvin Klein', categorie_id: 2, categorie_nom: 'Parfum', stock: 15, en_vedette: false, est_nouveau: true, est_promo: true, note_moyenne: 4.1, nombre_avis: 19, created_at: '2024-03-20' },
  { id: 9, nom: 'Fleur Narcotique Ex Nihilo', slug: 'fleur-narcotique-ex-nihilo', description: 'Une fleur majestueuse aux notes blanches et musquées.', prix: 130000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f2f18f47693e49ce8789c9f5a9789ede-z0vWRe6QbaVgErMI100VcNdkwBSqft.jpg', marque_id: 9, marque_nom: 'Ex Nihilo Paris', categorie_id: 1, categorie_nom: 'Eau de Parfum', stock: 3, en_vedette: true, est_nouveau: false, est_promo: false, note_moyenne: 4.8, nombre_avis: 11, created_at: '2024-02-20' },
  { id: 10, nom: 'Epices Exquises Guerlain', slug: 'epices-exquises-guerlain', description: 'Un voyage olfactif aux épices rares et précieuses d\'Orient.', prix: 92000, prix_promo: 78000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/87265b3f0f06480e8c8a6f970d5a62e8-kGO2X5PfluQ5epxJxEDvThKRv96CRA.jpg', marque_id: 1, marque_nom: 'Guerlain', categorie_id: 1, categorie_nom: 'Eau de Parfum', stock: 7, en_vedette: false, est_nouveau: false, est_promo: true, note_moyenne: 4.4, nombre_avis: 22, created_at: '2024-01-25' },
  { id: 11, nom: 'YSL Kouros Body', slug: 'ysl-kouros-body', description: 'La puissance et la séduction dans un flacon iconique.', prix: 62000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/65248ac1b8954c368fa3ccd3ebab36a9-P2FrcdfZjI4HSv8XQsl8AoKsZFX5Qr.jpg', marque_id: 10, marque_nom: 'Yves Saint Laurent', categorie_id: 2, categorie_nom: 'Eau de Toilette', stock: 11, en_vedette: false, est_nouveau: false, est_promo: false, note_moyenne: 4.2, nombre_avis: 35, created_at: '2024-01-05' },
  { id: 12, nom: 'Fomowa Pannaco Extrait', slug: 'fomowa-pannaco-extrait', description: 'L\'extrait de parfum Pannaco dans son écrin blanc élégant.', prix: 105000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/973a019144b44920800d930eda4f5f01-HxQe0ElwBbZaQzXxdXm9ABAcmYI7zF.jpg', marque_id: 5, marque_nom: 'Fomowa Paris', categorie_id: 1, categorie_nom: 'Extrait de Parfum', stock: 5, en_vedette: true, est_nouveau: false, est_promo: false, note_moyenne: 4.9, nombre_avis: 8, created_at: '2024-03-10' },
]

const SAMPLE_MARQUES: Marque[] = [
  { id: 1, nom: 'Guerlain', slug: 'guerlain' },
  { id: 2, nom: 'Maison Francis Kurkdjian', slug: 'mfk' },
  { id: 3, nom: 'Cartier', slug: 'cartier' },
  { id: 4, nom: 'Burberry', slug: 'burberry' },
  { id: 5, nom: 'Fomowa Paris', slug: 'fomowa' },
  { id: 6, nom: 'Jean Paul Gaultier', slug: 'jpgaultier' },
  { id: 7, nom: 'Christian Dior', slug: 'dior' },
  { id: 8, nom: 'Calvin Klein', slug: 'ck' },
  { id: 9, nom: 'Ex Nihilo Paris', slug: 'exnihilo' },
  { id: 10, nom: 'Yves Saint Laurent', slug: 'ysl' },
]

export default function BoutiquePage() {
  const [produits, setProduits] = useState<Produit[]>(SAMPLE_PRODUCTS)
  const [marques, setMarques] = useState<Marque[]>(SAMPLE_MARQUES)
  const [loading, setLoading] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [filtresMarques, setFiltresMarques] = useState<number[]>([])
  const [prixMin, setPrixMin] = useState(0)
  const [prixMax, setPrixMax] = useState(200000)
  const [tri, setTri] = useState('populaire')
  const [filtreMobileOpen, setFiltreMobileOpen] = useState(false)

  // Chargement depuis l'API Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [pRes, mRes] = await Promise.all([
          api.getProduits(),
          api.getMarques(),
        ])
        if (pRes?.data && Array.isArray(pRes.data) && pRes.data.length > 0) {
          setProduits(pRes.data)
        }
        if (Array.isArray(mRes) && mRes.length > 0) {
          setMarques(mRes)
        }
      } catch (error) {
        console.error('[v0] Error loading boutique data:', error)
        // Keep sample data as fallback
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const produitsFiltres = useMemo(() => {
    let result = produits.filter(p => {
      const prix = p.prix_promo || p.prix
      const matchRecherche = p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        (p.marque_nom || '').toLowerCase().includes(recherche.toLowerCase())
      const matchMarque = filtresMarques.length === 0 || filtresMarques.includes(p.marque_id)
      const matchPrix = prix >= prixMin && prix <= prixMax
      return matchRecherche && matchMarque && matchPrix
    })

    switch (tri) {
      case 'prix-croissant': result.sort((a, b) => (a.prix_promo || a.prix) - (b.prix_promo || b.prix)); break
      case 'prix-decroissant': result.sort((a, b) => (b.prix_promo || b.prix) - (a.prix_promo || a.prix)); break
      case 'nouveau': result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break
      case 'populaire': default: result.sort((a, b) => b.note_moyenne - a.note_moyenne); break
    }
    return result
  }, [produits, recherche, filtresMarques, prixMin, prixMax, tri])

  const toggleMarque = (id: number) => {
    setFiltresMarques(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    )
  }

  const resetFiltres = () => {
    setFiltresMarques([])
    setPrixMin(0)
    setPrixMax(200000)
    setTri('populaire')
    setRecherche('')
  }

  const FiltresContent = () => (
    <div className="space-y-6">
      {/* Tri */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Trier par</h3>
        <select
          value={tri}
          onChange={e => setTri(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="populaire">Popularité</option>
          <option value="nouveau">Plus récent</option>
          <option value="prix-croissant">Prix croissant</option>
          <option value="prix-decroissant">Prix décroissant</option>
        </select>
      </div>

      <Separator />

      {/* Prix */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Prix (FCFA)</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Min</Label>
              <Input
                type="number"
                value={prixMin}
                onChange={e => setPrixMin(Number(e.target.value))}
                className="text-sm bg-background"
                min={0}
                step={5000}
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Max</Label>
              <Input
                type="number"
                value={prixMax}
                onChange={e => setPrixMax(Number(e.target.value))}
                className="text-sm bg-background"
                min={0}
                step={5000}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatPrice(prixMin)} — {formatPrice(prixMax)}
          </p>
        </div>
      </div>

      <Separator />

      {/* Marques */}
      <div>
        <h3 className="font-semibold text-foreground mb-3">Marques</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {marques.map(marque => (
            <div key={marque.id} className="flex items-center gap-2">
              <Checkbox
                id={`marque-${marque.id}`}
                checked={filtresMarques.includes(marque.id)}
                onCheckedChange={() => toggleMarque(marque.id)}
              />
              <Label htmlFor={`marque-${marque.id}`} className="text-sm text-foreground cursor-pointer">
                {marque.nom}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {(filtresMarques.length > 0 || prixMin > 0 || prixMax < 200000) && (
        <Button variant="outline" size="sm" onClick={resetFiltres} className="w-full">
          <X className="h-3 w-3 mr-2" />
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero boutique */}
        <div className="bg-noir text-cream py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-gold-gradient">Notre Boutique</h1>
            <p className="text-cream/70 max-w-xl mx-auto">Découvrez notre collection exclusive de parfums haut de gamme</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Barre de recherche + filtres mobile */}
          <div className="flex gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tapez le nom du parfum..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>

            {/* Filtres mobile */}
            <Sheet open={filtreMobileOpen} onOpenChange={setFiltreMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtres
                  {filtresMarques.length > 0 && (
                    <span className="ml-1 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                      {filtresMarques.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-background">
                <SheetHeader>
                  <SheetTitle className="text-foreground">Filtres</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FiltresContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex gap-8">
            {/* Filtres desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                <h2 className="font-serif font-bold text-lg text-foreground mb-5">Filtres</h2>
                <FiltresContent />
              </div>
            </aside>

            {/* Grille produits */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground text-sm">
                  <span className="font-semibold text-foreground">{produitsFiltres.length}</span> produit{produitsFiltres.length !== 1 ? 's' : ''} trouvé{produitsFiltres.length !== 1 ? 's' : ''}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-64 w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : produitsFiltres.length === 0 ? (
                <div className="text-center py-20">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Aucun résultat</h3>
                  <p className="text-muted-foreground mb-4">Modifiez vos filtres ou votre recherche</p>
                  <Button variant="outline" onClick={resetFiltres}>Réinitialiser</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {produitsFiltres.map(produit => (
                    <ProductCard key={produit.id} produit={produit} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
