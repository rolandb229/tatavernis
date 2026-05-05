'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/lib/api'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="w-full sm:max-w-lg bg-background flex flex-col">
        <SheetHeader className="border-b border-border pb-4">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Votre Panier ({items.length} {items.length > 1 ? 'articles' : 'article'})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 opacity-50" />
            <p className="text-lg">Votre panier est vide</p>
            <Button asChild onClick={closeCart} className="btn-gold text-primary-foreground">
              <Link href="/boutique">Decouvrir nos parfums</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const prix = item.produit.prix_promo || item.produit.prix
                return (
                  <div key={item.produit.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={item.produit.image}
                        alt={item.produit.nom}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">
                          {item.produit.nom}
                        </h3>
                        {item.produit.marque_nom && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.produit.marque_nom}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-background rounded-md border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.produit.id, item.quantite - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantite}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.produit.id, item.quantite + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">
                            {formatPrice(prix * item.quantite)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/80"
                            onClick={() => removeItem(item.produit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(getTotal())}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                  onClick={clearCart}
                >
                  Vider le panier
                </Button>
                <Button asChild className="flex-1 btn-gold text-primary-foreground">
                  <Link href="/panier" onClick={closeCart}>
                    Commander
                  </Link>
                </Button>
              </div>
              <Button asChild variant="ghost" className="w-full" onClick={closeCart}>
                <Link href="/boutique">Continuer mes achats</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
