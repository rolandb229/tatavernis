'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-noir">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f4089867ad94a4bbcbd04e3b3bd655e-aDJZswWz9zHJJLcXGgciuUyKyU9lBE.jpg"
          alt="Parfum de luxe"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 lg:px-8">
        <div className="max-w-2xl">
          {/* Subtitle */}
          <p className="text-primary tracking-[0.3em] uppercase text-sm mb-4 animate-fade-in">
            Parfumerie haut de gamme
          </p>

          {/* Main title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-cream leading-tight mb-6">
            Le parfum est une{' '}
            <span className="text-gold-gradient">signature invisible</span>{' '}
            mais inoubliable
          </h1>

          {/* Description */}
          <p className="text-cream/70 text-lg md:text-xl mb-8 leading-relaxed">
            Decouvrez notre collection exclusive de fragrances des plus grandes 
            maisons de parfumerie. Trouvez la signature olfactive qui vous correspond.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="btn-gold text-primary-foreground text-lg px-8"
            >
              <Link href="/boutique">
                Decouvrir maintenant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cream/30 text-cream hover:bg-cream/10 text-lg px-8"
            >
              <Link href="/promotions">
                Voir les promotions
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-cream/10">
            <div>
              <p className="text-3xl md:text-4xl font-serif text-primary">50+</p>
              <p className="text-cream/60 text-sm mt-1">Parfums de luxe</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-serif text-primary">10+</p>
              <p className="text-cream/60 text-sm mt-1">Grandes marques</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-serif text-primary">500+</p>
              <p className="text-cream/60 text-sm mt-1">Clients satisfaits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative perfume bottle */}
      <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-[80vh]">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/973a019144b44920800d930eda4f5f01-HxQe0ElwBbZaQzXxdXm9ABAcmYI7zF.jpg"
          alt="Parfum Fomowa"
          fill
          className="object-contain object-right"
        />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-cream/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary rounded-full animate-scroll" />
        </div>
      </div>
    </section>
  )
}
