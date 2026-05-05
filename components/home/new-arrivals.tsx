'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/product-card'
import type { Produit } from '@/lib/types'

// Nouveautes (donnees statiques)
const newProducts: Produit[] = [
  {
    id: 4,
    nom: 'Le Male Le Parfum',
    slug: 'le-male-le-parfum',
    description: 'Une version intense du celebre Le Male.',
    prix: 78000,
    prix_promo: null,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d44862b49c8647ea8fb54392986922b3-UBefUhiM2ZFOWAVcIJ71rOGCwp3fSg.jpg',
    marque_id: 4,
    categorie_id: 1,
    marque_nom: 'Jean Paul Gaultier',
    stock: 12,
    en_vedette: true,
    est_nouveau: true,
    est_promo: false,
    note_moyenne: 4.5,
    nombre_avis: 18,
    created_at: '',
  },
  {
    id: 6,
    nom: 'Fleur Narcotique',
    slug: 'fleur-narcotique',
    description: 'Une eau de parfum florale et addictive.',
    prix: 95000,
    prix_promo: null,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f2f18f47693e49ce8789c9f5a9789ede-z0vWRe6QbaVgErMI100VcNdkwBSqft.jpg',
    marque_id: 6,
    categorie_id: 2,
    marque_nom: 'Ex Nihilo',
    stock: 10,
    en_vedette: false,
    est_nouveau: true,
    est_promo: false,
    note_moyenne: 4.7,
    nombre_avis: 9,
    created_at: '',
  },
  {
    id: 7,
    nom: 'Defy Parfum',
    slug: 'defy-parfum',
    description: 'Un parfum audacieux et moderne pour homme.',
    prix: 58000,
    prix_promo: null,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/d391ab85bd7e4fe8b1a7820e5cbc3945-UaUlYDbIGxOe0d31wkWxFJLRDxlopH.jpg',
    marque_id: 7,
    categorie_id: 1,
    marque_nom: 'Calvin Klein',
    stock: 25,
    en_vedette: false,
    est_nouveau: true,
    est_promo: false,
    note_moyenne: 4.3,
    nombre_avis: 15,
    created_at: '',
  },
  {
    id: 10,
    nom: 'Epices Exquises',
    slug: 'epices-exquises',
    description: 'Une fragrance orientale gourmande.',
    prix: 88000,
    prix_promo: null,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/87265b3f0f06480e8c8a6f970d5a62e8-kGO2X5PfluQ5epxJxEDvThKRv96CRA.jpg',
    marque_id: 1,
    categorie_id: 3,
    marque_nom: 'Guerlain',
    stock: 16,
    en_vedette: false,
    est_nouveau: true,
    est_promo: false,
    note_moyenne: 4.6,
    nombre_avis: 7,
    created_at: '',
  },
]

export function NewArrivals() {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-primary tracking-[0.2em] uppercase text-sm mb-2">
              Fraichement arrives
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">
              Nouveautes
            </h2>
          </div>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
            <Link href="/boutique?nouveautes=1">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newProducts.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      </div>
    </section>
  )
}
