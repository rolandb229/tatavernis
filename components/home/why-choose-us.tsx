import { Truck, Shield, Award, Headphones } from 'lucide-react'

const features = [
  {
    icon: Award,
    title: 'Authenticite garantie',
    description: 'Tous nos parfums sont 100% originaux et proviennent directement des grandes maisons.',
  },
  {
    icon: Truck,
    title: 'Livraison rapide',
    description: 'Livraison partout au Benin. Retrait en boutique disponible a Cotonou.',
  },
  {
    icon: Shield,
    title: 'Paiement securise',
    description: 'Transactions securisees via Fedapay. Paiement a la livraison disponible.',
  },
  {
    icon: Headphones,
    title: 'Service client',
    description: 'Notre equipe est disponible sur WhatsApp pour repondre a toutes vos questions.',
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary tracking-[0.2em] uppercase text-sm mb-2">
            Nos engagements
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">
            Pourquoi nous choisir ?
          </h2>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
