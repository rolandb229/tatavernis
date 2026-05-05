import Link from 'next/link'

const brands = [
  { name: 'Guerlain', slug: 'guerlain' },
  { name: 'Cartier', slug: 'cartier' },
  { name: 'Dior', slug: 'dior' },
  { name: 'Jean Paul Gaultier', slug: 'jean-paul-gaultier' },
  { name: 'Maison Francis Kurkdjian', slug: 'maison-francis-kurkdjian' },
  { name: 'Burberry', slug: 'burberry' },
  { name: 'Calvin Klein', slug: 'calvin-klein' },
  { name: 'Yves Saint Laurent', slug: 'yves-saint-laurent' },
  { name: 'Ex Nihilo', slug: 'ex-nihilo' },
  { name: 'Fomowa Paris', slug: 'fomowa-paris' },
]

export function BrandsSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-primary tracking-[0.2em] uppercase text-sm mb-2">
            Les plus grandes maisons
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground">
            Nos marques
          </h2>
        </div>

        {/* Brands grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/boutique?marque=${brand.slug}`}
              className="group flex items-center justify-center p-6 bg-background rounded-lg border border-border hover:border-primary/50 transition-all duration-300"
            >
              <span className="text-center font-serif text-lg text-foreground/80 group-hover:text-primary transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
