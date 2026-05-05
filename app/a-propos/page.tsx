import Image from 'next/image'
import Link from 'next/link'
import { Award, Heart, Leaf, Star, Users } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'

export default function AProposPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <div className="bg-noir text-cream py-16 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-gold-gradient">À Propos</h1>
          <p className="text-cream/70 max-w-xl mx-auto leading-relaxed">
            Tatavernis — La maison du parfum authentique au Bénin
          </p>
        </div>

        {/* Notre histoire */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold text-foreground mb-5">Notre Histoire</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Née au cœur de Cotonou, Tatavernis est une boutique en ligne dédiée aux amateurs de parfums haut de gamme.
                  Notre mission est de démocratiser l&apos;accès aux fragrances de luxe pour toute l&apos;Afrique.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous sélectionnons rigoureusement chaque parfum en nous assurant de leur authenticité et de leur qualité.
                  Des grandes maisons européennes aux créateurs arabes, notre catalogue reflète la richesse olfactive du monde.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Fidèles à nos valeurs d&apos;authenticité, de service client exceptionnel et de passion pour les parfums,
                  nous sommes fiers de vous offrir la meilleure expérience olfactive possible.
                </p>
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/abc2545e7c4141bcbc0b2fbea495681f-zHwomACKMqTjNW4gaFKHDk07wsUXPm.jpg"
                  alt="Tatavernis boutique de parfums"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Valeurs */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-3">Nos Valeurs</h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
              Ce qui nous guide dans chacune de nos actions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Award, title: 'Authenticité', desc: 'Uniquement des parfums 100% authentiques et originaux' },
                { icon: Star, title: 'Qualité', desc: 'Une sélection rigoureuse des meilleures fragrances' },
                { icon: Heart, title: 'Passion', desc: "L'amour du parfum au cœur de tout ce que nous faisons" },
                { icon: Users, title: 'Service', desc: 'Un accompagnement personnalisé pour chaque client' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Chiffres */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-12">En chiffres</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { value: '200+', label: 'Parfums disponibles' },
                { value: '50+', label: 'Marques représentées' },
                { value: '1000+', label: 'Clients satisfaits' },
                { value: '100%', label: 'Produits authentiques' },
              ].map(({ value, label }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-6">
                  <p className="text-3xl font-serif font-bold text-primary mb-2">{value}</p>
                  <p className="text-muted-foreground text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-noir text-cream text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-4 text-gold-gradient">
              Rejoignez l&apos;aventure Tatavernis
            </h2>
            <p className="text-cream/70 mb-8 leading-relaxed">
              Découvrez notre catalogue et trouvez le parfum qui raconte votre histoire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-gold text-primary-foreground px-8">
                <Link href="/boutique">Découvrir la boutique</Link>
              </Button>
              <Button asChild variant="outline" className="border-cream/30 text-cream hover:bg-cream/10 px-8">
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
