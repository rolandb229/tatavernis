import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PromoBanner() {
  return (
    <section className="relative py-20 overflow-hidden bg-noir">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Offre limitee</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-cream mb-6">
              <span className="text-gold-gradient">-20%</span> sur une selection
            </h2>
            
            <p className="text-cream/70 text-lg mb-8 max-w-lg mx-auto lg:mx-0">
              Profitez de remises exceptionnelles sur nos parfums les plus prisés. 
              Une occasion unique de vous offrir le luxe a prix reduit.
            </p>

            <Button
              asChild
              size="lg"
              className="btn-gold text-primary-foreground text-lg px-8"
            >
              <Link href="/promotions">
                Voir les promotions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Image collage */}
          <div className="relative h-[400px] lg:h-[500px]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 w-48 h-64 rounded-lg overflow-hidden shadow-2xl transform rotate-3">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19e1b43670244fb0ab03ea785067c22c-KDIlZVavMiR6PCHa94jTEWQPsr4dUp.jpg"
                alt="Pasha de Cartier"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute top-20 right-0 lg:right-10 w-52 h-72 rounded-lg overflow-hidden shadow-2xl transform -rotate-3">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/49208ac133d5448789a5e132f6835933-gAIdnbHGlfd8Aam7jAxV9k0i17GzEF.jpg"
                alt="Baccarat Rouge 540"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-1/4 w-44 h-60 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/65248ac1b8954c368fa3ccd3ebab36a9-P2FrcdfZjI4HSv8XQsl8AoKsZFX5Qr.jpg"
                alt="Kouros Body"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
