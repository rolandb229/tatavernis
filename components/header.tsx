'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ShoppingBag, Heart, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore, useFavoritesStore } from '@/lib/cart-store'
import { CartDrawer } from './cart-drawer'

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Boutique', href: '/boutique' },
  { name: 'Promotions', href: '/promotions' },
  { name: 'Blog', href: '/blog' },
  { name: 'A propos', href: '/a-propos' },
  { name: 'Contact', href: '/contact' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { getItemCount, openCart } = useCartStore()
  const { favorites } = useFavoritesStore()
  const itemCount = getItemCount()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nouveau%20logo%20tata%20vernis%20copie-yiLw2DUuF21Ws2mr1cAWUFWHxGOwsn.png"
            alt="Tatavernis"
            width={180}
            height={60}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/80 underline-animation hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <Link href="/boutique" className="hidden sm:block">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Search className="h-5 w-5" />
              <span className="sr-only">Rechercher</span>
            </Button>
          </Link>

          {/* Favorites */}
          <Link href="/favoris" className="hidden sm:block relative">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Heart className="h-5 w-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                  {favorites.length}
                </span>
              )}
              <span className="sr-only">Favoris</span>
            </Button>
          </Link>

          {/* Cart */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-primary/10"
            onClick={openCart}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                {itemCount}
              </span>
            )}
            <span className="sr-only">Panier</span>
          </Button>

          {/* Admin Link */}
          <Link href="/admin" className="hidden lg:block">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <User className="h-5 w-5" />
              <span className="sr-only">Administration</span>
            </Button>
          </Link>

          {/* Mobile menu button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-background">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="flex justify-center mb-4">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nouveau%20logo%20tata%20vernis%20copie-yiLw2DUuF21Ws2mr1cAWUFWHxGOwsn.png"
                    alt="Tatavernis"
                    width={150}
                    height={50}
                    className="h-10 w-auto"
                  />
                </Link>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors text-center py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                <hr className="border-border" />
                <Link
                  href="/favoris"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 text-foreground hover:text-primary"
                >
                  <Heart className="h-5 w-5" />
                  <span>Favoris ({favorites.length})</span>
                </Link>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 text-foreground hover:text-primary"
                >
                  <User className="h-5 w-5" />
                  <span>Administration</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer />
    </header>
  )
}
