'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Verifier si le popup a deja ete affiche cette session
    const hasSeenPopup = sessionStorage.getItem('tatavernis-promo-seen')
    
    if (!hasSeenPopup) {
      // Afficher apres 3 secondes
      const timer = setTimeout(() => {
        setIsOpen(true)
        sessionStorage.setItem('tatavernis-promo-seen', 'true')
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-noir text-cream border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Sparkles className="h-6 w-6" />
              <span className="text-2xl font-serif">Offre Speciale</span>
              <Sparkles className="h-6 w-6" />
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Offre promotionnelle exclusive Tatavernis
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center py-6 space-y-4">
          <p className="text-4xl font-bold text-gold-gradient">
            -20%
          </p>
          <p className="text-lg text-cream/90">
            sur les parfums aujourd&apos;hui !
          </p>
          <p className="text-sm text-cream/60">
            Profitez de nos promotions exclusives sur une selection de fragrances haut de gamme.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            asChild 
            className="btn-gold text-primary-foreground w-full"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/promotions">
              Voir les promotions
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="text-cream/60 hover:text-cream"
            onClick={() => setIsOpen(false)}
          >
            Continuer ma visite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
