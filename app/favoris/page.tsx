'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import ProductCard from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { useFavoritesStore } from '@/lib/cart-store'
import { API_ENDPOINTS } from '@/lib/api'
import type { Produit } from '@/lib/types'

export default function FavorisPage() {
  const { favorites, removeFavorite } = useFavoritesStore()
  const [produits, setProduits] = useState<Produit[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (favorites.length === 0) return
    const fetchFavoris = async () => {
      setLoading(true)
      try {
        const res = await fetch(API_ENDPOINTS.produits)
        if (res.ok) {
          const data = await res.json()
          const all: Produit[] = Array.isArray(data) ? data : (data.data ?? [])
          setProduits(all.filter(p => favorites.includes(p.id)))
        }
      } catch {
        // Silencieux
      } finally {
        setLoading(false)
      }
    }
    fetchFavoris()
  }, [favorites])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <div className="bg-noir text-cream py-12 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-gold-gradient">Mes Favoris</h1>
          <p className="text-cream/70">Vos parfums préférés sauvegardés</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-14">
          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
                Aucun favori pour l&apos;instant
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Explorez notre boutique et cliquez sur le ♡ pour sauvegarder vos parfums préférés.
              </p>
              <Button asChild className="btn-gold text-primary-foreground px-8">
                <Link href="/boutique">Découvrir la boutique</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-muted-foreground">
                  {favorites.length} favori{favorites.length > 1 ? 's' : ''}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => favorites.forEach(id => removeFavorite(id))}
                  className="text-destructive hover:text-destructive"
                >
                  Tout effacer
                </Button>
              </div>

              {loading ? (
                <p className="text-muted-foreground text-center py-12">Chargement…</p>
              ) : produits.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {produits.map(produit => (
                    <ProductCard key={produit.id} produit={produit} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Impossible de charger les produits. Vérifiez que XAMPP est actif.</p>
                  <Button asChild variant="outline">
                    <Link href="/boutique">Aller à la boutique</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
