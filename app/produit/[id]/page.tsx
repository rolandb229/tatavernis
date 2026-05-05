'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Star, ShoppingBag, MessageCircle, Heart, Minus, Plus, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCartStore, useFavoritesStore } from '@/lib/cart-store'
import { formatPrice, getWhatsAppLink, API_ENDPOINTS } from '@/lib/api'
import type { Produit } from '@/lib/types'
import { cn } from '@/lib/utils'
import ProductCard from '@/components/product-card'

const ALL_PRODUCTS: Produit[] = [
  { id: 1, nom: 'Santal Royal', slug: 'santal-royal', description: 'Un parfum boisé et chaleureux avec des notes de santal précieux, de rose et d\'ambre. Ce joyau olfactif de Guerlain capture l\'essence même du luxe oriental avec une profondeur remarquable.', prix: 85000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/af8a8cb572b14d6a977dfeacc2edc4e6-KN2nbPkr6fVz5NTDLh9Fvf0q0CBbUw.jpg', marque_id: 1, marque_nom: 'Guerlain', categorie_id: 1, categorie_nom: 'Eau de Parfum', stock: 10, en_vedette: true, est_nouveau: false, est_promo: false, note_moyenne: 4.8, nombre_avis: 24, created_at: '2024-01-01' },
  { id: 2, nom: 'Baccarat Rouge 540', slug: 'baccarat-rouge-540', description: 'Un chef-d\'oeuvre olfactif aux notes florales et ambrées créé par Maison Francis Kurkdjian. Ce parfum iconique séduit par sa sillage inoubliable mêlant jasmin, safran et cèdre.', prix: 125000, prix_promo: 99000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/49208ac133d5448789a5e132f6835933-gAIdnbHGlfd8Aam7jAxV9k0i17GzEF.jpg', marque_id: 2, marque_nom: 'Maison Francis Kurkdjian', categorie_id: 1, categorie_nom: 'Extrait de Parfum', stock: 5, en_vedette: true, est_nouveau: true, est_promo: true, note_moyenne: 5.0, nombre_avis: 48, created_at: '2024-02-01' },
  { id: 3, nom: 'Pasha de Cartier Edition Noire', slug: 'pasha-cartier-edition-noire', description: 'Masculine et audacieux, ce parfum incarne la force avec élégance. Des notes fraîches de gingembre, de poivre noir et de vétiver composent cette fragrance puissante et raffinée.', prix: 72000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19e1b43670244fb0ab03ea785067c22c-KDIlZVavMiR6PCHa94jTEWQPsr4dUp.jpg', marque_id: 3, marque_nom: 'Cartier', categorie_id: 2, categorie_nom: 'Eau de Toilette', stock: 8, en_vedette: false, est_nouveau: false, est_promo: false, note_moyenne: 4.5, nombre_avis: 18, created_at: '2024-01-15' },
  { id: 4, nom: 'Burberry Hero', slug: 'burberry-hero', description: 'Un parfum moderne et épicé inspiré de la nature et de l\'aventure. Cèdre américain, vétiver et cardamome se mêlent pour créer une fragrance virile et contemporaine.', prix: 58000, prix_promo: 45000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ee517ab523154da59ad8e954dd1080e8-GuzKyvVKdeUdpEnXmiCoAbr53IKCJt.jpg', marque_id: 4, marque_nom: 'Burberry', categorie_id: 1, categorie_nom: 'Parfum', stock: 12, en_vedette: true, est_nouveau: true, est_promo: true, note_moyenne: 4.3, nombre_avis: 31, created_at: '2024-03-01' },
  { id: 5, nom: 'Pannaco Tahaa Mango', slug: 'pannaco-tahaa-mango', description: 'Un extrait de parfum exotique aux notes de mangue et de vanille de Tahaa. Un voyage sensoriel unique entre les tropiques et la sophistication parisienne de la maison Fomowa.', prix: 95000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6d16b40a852f42cea2f0c22c2424b863-ViWss7F8BZz7oAqRYfMeu46C6SgW23.jpg', marque_id: 5, marque_nom: 'Fomowa Paris', categorie_id: 1, categorie_nom: 'Extrait de Parfum', stock: 6, en_vedette: true, est_nouveau: true, est_promo: false, note_moyenne: 4.7, nombre_avis: 15, created_at: '2024-03-15' },
  { id: 6, nom: 'Jean Paul Gaultier Le Male', slug: 'jp-gaultier-le-male', description: 'Une fragrance iconique et séductrice pour l\'homme moderne. L\'accord lavande-vanille signature de Gaultier dans un flacon en forme de buste masculin mythique.', prix: 68000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d44862b49c8647ea8fb54392986922b3-UBefUhiM2ZFOWAVcIJ71rOGCwp3fSg.jpg', marque_id: 6, marque_nom: 'Jean Paul Gaultier', categorie_id: 1, categorie_nom: 'Le Parfum', stock: 9, en_vedette: false, est_nouveau: false, est_promo: false, note_moyenne: 4.6, nombre_avis: 42, created_at: '2024-01-10' },
  { id: 7, nom: 'Bois d\'Argent Dior', slug: 'bois-argent-dior', description: 'Un parfum boisé et iris qui incarne l\'élégance parisienne. L\'iris et le cèdre se conjuguent dans une harmonie rare pour créer cette pièce maîtresse de la Collection Privée Christian Dior.', prix: 110000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c366796e43f2410198c33fc2a78c796d-07mwh0rwLq3FfL6S2l9Fc39yatFD7U.jpg', marque_id: 7, marque_nom: 'Christian Dior', categorie_id: 1, categorie_nom: 'Esprit de Parfum', stock: 4, en_vedette: false, est_nouveau: false, est_promo: false, note_moyenne: 4.9, nombre_avis: 27, created_at: '2024-02-15' },
  { id: 8, nom: 'Calvin Klein Defy', slug: 'calvin-klein-defy', description: 'Un parfum frais et énergique pour l\'homme d\'aujourd\'hui. Les notes de gingembre pétillant, de vétiver et de cèdre créent une fragrance audacieuse et contemporaine.', prix: 55000, prix_promo: 42000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d391ab85bd7e4fe8b1a7820e5cbc3945-UaUlYDbIGxOe0d31wkWxFJLRDxlopH.jpg', marque_id: 8, marque_nom: 'Calvin Klein', categorie_id: 2, categorie_nom: 'Parfum', stock: 15, en_vedette: false, est_nouveau: true, est_promo: true, note_moyenne: 4.1, nombre_avis: 19, created_at: '2024-03-20' },
  { id: 9, nom: 'Fleur Narcotique Ex Nihilo', slug: 'fleur-narcotique-ex-nihilo', description: 'Une fleur majestueuse aux notes blanches et musquées. Ce bijou olfactif de la maison parisienne Ex Nihilo allie le jasmin délicat aux notes de cèdre et d\'ambrette.', prix: 130000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f2f18f47693e49ce8789c9f5a9789ede-z0vWRe6QbaVgErMI100VcNdkwBSqft.jpg', marque_id: 9, marque_nom: 'Ex Nihilo Paris', categorie_id: 1, categorie_nom: 'Eau de Parfum', stock: 3, en_vedette: true, est_nouveau: false, est_promo: false, note_moyenne: 4.8, nombre_avis: 11, created_at: '2024-02-20' },
  { id: 10, nom: 'Epices Exquises Guerlain', slug: 'epices-exquises-guerlain', description: 'Un voyage olfactif aux épices rares et précieuses d\'Orient. Cardamome, poivre rose et encens se mêlent dans cette fragrance unique de la maison Guerlain.', prix: 92000, prix_promo: 78000, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/87265b3f0f06480e8c8a6f970d5a62e8-kGO2X5PfluQ5epxJxEDvThKRv96CRA.jpg', marque_id: 1, marque_nom: 'Guerlain', categorie_id: 1, categorie_nom: 'Eau de Parfum', stock: 7, en_vedette: false, est_nouveau: false, est_promo: true, note_moyenne: 4.4, nombre_avis: 22, created_at: '2024-01-25' },
  { id: 11, nom: 'YSL Kouros Body', slug: 'ysl-kouros-body', description: 'La puissance et la séduction dans un flacon iconique. Ce parfum d\'Yves Saint Laurent mêle lavande, romarin et bois de santal dans une harmonie virile et élégante.', prix: 62000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/65248ac1b8954c368fa3ccd3ebab36a9-P2FrcdfZjI4HSv8XQsl8AoKsZFX5Qr.jpg', marque_id: 10, marque_nom: 'Yves Saint Laurent', categorie_id: 2, categorie_nom: 'Eau de Toilette', stock: 11, en_vedette: false, est_nouveau: false, est_promo: false, note_moyenne: 4.2, nombre_avis: 35, created_at: '2024-01-05' },
  { id: 12, nom: 'Fomowa Pannaco Extrait', slug: 'fomowa-pannaco-extrait', description: 'L\'extrait de parfum Pannaco dans son écrin blanc élégant. Une version encore plus concentrée et envoûtante de la fragrance phare de la maison Fomowa Paris.', prix: 105000, prix_promo: null, image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/973a019144b44920800d930eda4f5f01-HxQe0ElwBbZaQzXxdXm9ABAcmYI7zF.jpg', marque_id: 5, marque_nom: 'Fomowa Paris', categorie_id: 1, categorie_nom: 'Extrait de Parfum', stock: 5, en_vedette: true, est_nouveau: false, est_promo: false, note_moyenne: 4.9, nombre_avis: 8, created_at: '2024-03-10' },
]

export default function ProduitPage() {
  const params = useParams()
  const id = params.id as string
  const [produit, setProduit] = useState<Produit | null>(null)
  const [quantite, setQuantite] = useState(1)
  const [loading, setLoading] = useState(true)

  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()

  useEffect(() => {
    const loadProduit = async () => {
      // Cherche d'abord dans les données locales
      const found = ALL_PRODUCTS.find(p => p.slug === id || p.id.toString() === id)
      if (found) {
        setProduit(found)
        setLoading(false)
        return
      }
      // Essaie le backend PHP
      try {
        const res = await fetch(`${API_ENDPOINTS.produits}?id=${id}`)
        if (res.ok) {
          const data = await res.json()
          setProduit(data.data || data)
        }
      } catch {
        // Silencieux : XAMPP peut être hors ligne
      }
      setLoading(false)
    }
    loadProduit()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!produit) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Produit introuvable</h1>
            <Button asChild className="btn-gold text-primary-foreground">
              <Link href="/boutique">Retour à la boutique</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const hasPromo = produit.prix_promo && produit.prix_promo < produit.prix
  const prixActuel = hasPromo ? produit.prix_promo! : produit.prix
  const reduction = hasPromo ? Math.round(((produit.prix - produit.prix_promo!) / produit.prix) * 100) : 0
  const favorite = isFavorite(produit.id)
  const whatsappLink = getWhatsAppLink({ nom: produit.nom, prix: prixActuel })

  const produitsSimilaires = ALL_PRODUCTS
    .filter(p => p.id !== produit.id && p.marque_id === produit.marque_id)
    .slice(0, 4)
  const autresProduits = ALL_PRODUCTS
    .filter(p => p.id !== produit.id)
    .slice(0, 4)
  const suggestion = produitsSimilaires.length > 0 ? produitsSimilaires : autresProduits

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Fil d'Ariane */}
        <div className="border-b border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/boutique" className="hover:text-primary transition-colors">Boutique</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate">{produit.nom}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Bouton retour */}
          <Link href="/boutique" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </Link>

          {/* Fiche produit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-lg">
              <Image
                src={produit.image}
                alt={produit.nom}
                fill
                className="object-cover image-zoom"
                priority
              />
              {hasPromo && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm px-3 py-1.5">
                  -{reduction}%
                </Badge>
              )}
              {produit.est_nouveau && (
                <Badge className="absolute top-4 right-4 bg-noir text-cream text-sm px-3 py-1.5">
                  Nouveau
                </Badge>
              )}
            </div>

            {/* Informations */}
            <div className="flex flex-col gap-5">
              {produit.marque_nom && (
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium">{produit.marque_nom}</p>
              )}

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-balance leading-tight">
                {produit.nom}
              </h1>

              {produit.categorie_nom && (
                <p className="text-muted-foreground -mt-2">{produit.categorie_nom}</p>
              )}

              {/* Note */}
              {produit.note_moyenne > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-4 w-4',
                          i < Math.round(produit.note_moyenne)
                            ? 'text-primary fill-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{produit.note_moyenne}</span>
                  <span className="text-sm text-muted-foreground">({produit.nombre_avis} avis)</span>
                </div>
              )}

              {/* Prix */}
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-primary">{formatPrice(prixActuel)}</span>
                {hasPromo && (
                  <span className="text-lg text-muted-foreground line-through mb-0.5">
                    {formatPrice(produit.prix)}
                  </span>
                )}
              </div>

              <Separator />

              {/* Description */}
              <p className="text-foreground leading-relaxed">{produit.description}</p>

              {/* Disponibilité */}
              <div className="flex items-center gap-2">
                <div className={cn('w-2.5 h-2.5 rounded-full', produit.stock > 0 ? 'bg-green-500' : 'bg-destructive')} />
                <span className="text-sm text-muted-foreground">
                  {produit.stock > 0 ? `En stock (${produit.stock} disponibles)` : 'Rupture de stock'}
                </span>
              </div>

              {/* Quantité */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-foreground">Quantité :</span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none hover:bg-muted"
                    onClick={() => setQuantite(Math.max(1, quantite - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-foreground border-x border-border py-2">
                    {quantite}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none hover:bg-muted"
                    onClick={() => setQuantite(Math.min(produit.stock, quantite + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 btn-gold text-primary-foreground py-6 text-base font-semibold"
                  onClick={() => addItem(produit, quantite)}
                  disabled={produit.stock === 0}
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Ajouter au panier
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-14 w-14 shrink-0 border-2',
                    favorite ? 'border-red-300 text-red-500 bg-red-50' : 'border-border'
                  )}
                  onClick={() => toggleFavorite(produit.id)}
                  aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart className={cn('h-5 w-5', favorite && 'fill-current')} />
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full py-6 border-2 border-green-500 text-green-700 hover:bg-green-50 font-semibold text-base gap-2"
                asChild
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5" />
                  Contacter via WhatsApp
                </a>
              </Button>

              {/* Infos livraison */}
              <div className="bg-muted/40 rounded-xl p-5 space-y-2 text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">Livraison</span>
                  <span className="text-muted-foreground ml-2">disponible au Bénin et en Afrique</span>
                </p>
                <p className="text-foreground">
                  <span className="font-semibold">Retrait</span>
                  <span className="text-muted-foreground ml-2">en boutique disponible</span>
                </p>
                <p className="text-foreground">
                  <span className="font-semibold">Authenticité</span>
                  <span className="text-muted-foreground ml-2">garantie sur tous nos produits</span>
                </p>
              </div>
            </div>
          </div>

          {/* Produits suggérés */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
              {produitsSimilaires.length > 0 ? 'De la même marque' : 'Vous pourriez aussi aimer'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestion.map(p => (
                <ProductCard key={p.id} produit={p} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
