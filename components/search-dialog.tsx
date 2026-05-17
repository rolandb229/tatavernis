'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { api, formatPrice } from '@/lib/api'

interface SearchResult {
  produits: Array<{
    id: number
    nom: string
    slug: string
    prix: number
    prix_promo?: number | null
    image: string
    marque_nom?: string
  }>
  categories: Array<{
    id: number
    nom: string
    slug: string
  }>
  marques: Array<{
    id: number
    nom: string
    slug: string
  }>
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult>({ produits: [], categories: [], marques: [] })
  const [loading, setLoading] = useState(false)

  const searchDebounced = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults({ produits: [], categories: [], marques: [] })
      return
    }

    setLoading(true)
    try {
      const data = await api.search(searchQuery, 8)
      setResults(data)
    } catch (error) {
      console.error('[v0] Search error:', error)
      setResults({ produits: [], categories: [], marques: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchDebounced(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchDebounced])

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults({ produits: [], categories: [], marques: [] })
    }
  }, [open])

  const hasResults = results.produits.length > 0 || results.categories.length > 0 || results.marques.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif">Rechercher</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit, une marque..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tapez au moins 2 caractères pour rechercher</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun résultat pour &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Products */}
              {results.produits.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Produits ({results.produits.length})
                  </h3>
                  <div className="space-y-2">
                    {results.produits.map((produit) => (
                      <Link
                        key={produit.id}
                        href={`/produit/${produit.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={produit.image || '/placeholder.jpg'}
                            alt={produit.nom}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{produit.nom}</p>
                          {produit.marque_nom && (
                            <p className="text-xs text-muted-foreground">{produit.marque_nom}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {produit.prix_promo ? (
                            <>
                              <p className="font-bold text-primary">{formatPrice(produit.prix_promo)}</p>
                              <p className="text-xs text-muted-foreground line-through">{formatPrice(produit.prix)}</p>
                            </>
                          ) : (
                            <p className="font-bold text-foreground">{formatPrice(produit.prix)}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {results.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Catégories ({results.categories.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/boutique?categorie=${cat.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {cat.nom}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands */}
              {results.marques.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Marques ({results.marques.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {results.marques.map((marque) => (
                      <Link
                        key={marque.id}
                        href={`/boutique?marque=${marque.slug}`}
                        onClick={() => onOpenChange(false)}
                        className="px-3 py-1.5 bg-muted rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {marque.nom}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
