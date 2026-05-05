'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProductCard from '@/components/product-card'
import type { Produit } from '@/lib/types'

// Produits en vedette (donnees statiques pour le frontend)
const featuredProducts: Produit[] = [
  {
    id: 1,
    nom: 'Santal Royal',
    slug: 'santal-royal',
    description: 'Un parfum boise et oriental, melange de santal et de notes epices.',
    prix: 85000,
    prix_promo: null,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/af8a8cb572b14d6a977dfeacc2edc4e6-KN2nbPkr6fVz5NTDLh9Fvf0q0CBbUw.jpg',
    marque_id: 1,
    categorie_id: 3,
    marque_nom: 'Guerlain',
    stock: 15,
    en_vedette: true,
    est_nouveau: false,
    est_promo: false,
    note_moyenne: 4.8,
    nombre_avis: 12,
    created_at: '',
  },
  {
    id: 5,
    nom: 'Baccarat Rouge 540',
    slug: 'baccarat-rouge-540',
    description: 'Un extrait de parfum legendaire. Notes de safran, ambre et cedre.',
    prix: 150000,
    prix_promo: 135000,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/49208ac133d5448789a5e132f6835933-gAIdnbHGlfd8Aam7jAxV9k0i17GzEF.jpg',
    marque_id: 5,
    categorie_id: 3,
    marque_nom: 'Maison Francis Kurkdjian',
    stock: 8,
    en_vedette: true,
    est_nouveau: false,
    est_promo: true,
    note_moyenne: 5.0,
    nombre_avis: 25,
    created_at: '',
  },
  {
    id: 4,
    nom: 'Le Male Le Parfum',
    slug: 'le-male-le-parfum',
    description: 'Une version intense du celebre Le Male. Vanille et lavande.',
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
    id: 9,
    nom: "Bois d'Argent",
    slug: 'bois-dargent',
    description: 'Un parfum rare et precieux de la collection privee Dior.',
    prix: 180000,
    prix_promo: null,
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c366796e43f2410198c33fc2a78c796d-07mwh0rwLq3FfL6S2l9Fc39yatFD7U.jpg',
    marque_id: 9,
    categorie_id: 3,
    marque_nom: 'Dior',
    stock: 5,
    en_vedette: true,
    est_nouveau: false,
    est_promo: false,
    note_moyenne: 4.9,
    nombre_avis: 8,
    created_at: '',
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-primary tracking-[0.2em] uppercase text-sm mb-2">
              Notre selection
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">
              Produits populaires
            </h2>
          </div>
          <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
            <Link href="/boutique">
              Voir tout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((produit) => (
            <ProductCard key={produit.id} produit={produit} />
          ))}
        </div>
      </div>
    </section>
  )
}
