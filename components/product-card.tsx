'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore, useFavoritesStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/api'
import type { Produit } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  produit: Produit
  className?: string
}

export default function ProductCard({ produit, className }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { toggleFavorite, isFavorite } = useFavoritesStore()
  const favorite = isFavorite(produit.id)

  const hasPromo = produit.prix_promo && produit.prix_promo < produit.prix
  const prixActuel = hasPromo ? produit.prix_promo : produit.prix
  const reduction = hasPromo 
    ? Math.round(((produit.prix - produit.prix_promo!) / produit.prix) * 100)
    : 0

  return (
    <div className={cn("group product-card bg-card rounded-lg overflow-hidden border border-border", className)}>
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/produit/${produit.slug || produit.id}`}>
          <Image
            src={produit.image}
            alt={produit.nom}
            fill
            className="object-cover image-zoom"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {produit.est_nouveau && (
            <Badge className="bg-noir text-cream">Nouveau</Badge>
          )}
          {hasPromo && (
            <Badge className="bg-destructive text-destructive-foreground">-{reduction}%</Badge>
          )}
        </div>

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute top-2 right-2 h-9 w-9 rounded-full bg-background/80 backdrop-blur-sm",
            favorite && "text-red-500"
          )}
          onClick={() => toggleFavorite(produit.id)}
        >
          <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
        </Button>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-noir/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 btn-gold text-primary-foreground"
              onClick={() => addItem(produit)}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-background/80 border-0"
              asChild
            >
              <Link href={`/produit/${produit.slug || produit.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Brand */}
        {produit.marque_nom && (
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {produit.marque_nom}
          </p>
        )}

        {/* Name */}
        <Link href={`/produit/${produit.slug || produit.id}`}>
          <h3 className="font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
            {produit.nom}
          </h3>
        </Link>

        {/* Rating */}
        {produit.note_moyenne > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.round(produit.note_moyenne)
                      ? "text-primary fill-primary"
                      : "text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({produit.nombre_avis})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-bold text-primary">
            {formatPrice(prixActuel!)}
          </span>
          {hasPromo && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(produit.prix)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
