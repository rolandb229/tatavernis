'use client'

import { useState, useEffect } from 'react'
import { Tag, Percent } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import ProductCard from '@/components/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Produit } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/api'

export default function PromotionsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.produits}?promo=1`)
        if (res.ok) {
          const data = await res.json()
          const liste = Array.isArray(data) ? data : (data.data ?? [])
          setProduits(liste)
        }
      } catch {
        // Silencieux
      } finally {
        setLoading(false)
      }
    }
    fetchPromos()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <div className="bg-noir text-cream py-12 px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Percent className="h-4 w-4" />
            Offres limitées
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-gold-gradient">Promotions</h1>
          <p className="text-cream/70 max-w-lg mx-auto">
            Des réductions exceptionnelles sur une sélection de parfums haut de gamme
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-14">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : produits.length === 0 ? (
            <div className="text-center py-20">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Aucune promotion en ce moment</p>
              <p className="text-muted-foreground text-sm mt-1">Revenez bientôt pour découvrir nos offres</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground mb-8">
                {produits.length} produit{produits.length > 1 ? 's' : ''} en promotion
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {produits.map(p => (
                  <ProductCard key={p.id} produit={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
