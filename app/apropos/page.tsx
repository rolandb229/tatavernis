'use client'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-8">À Propos de Tatavernis</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-accent mb-4">Notre Histoire</h2>
            <p className="text-foreground leading-relaxed">
              Tatavernis est née de la passion pour les parfums haut de gamme et de la volonté de démocratiser l'accès aux fragrances prestigieuses en Afrique. Fondée en 2024, notre entreprise s'engage à offrir une sélection exclusive de parfums provenant des plus grandes maisons mondiales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-accent mb-4">Notre Vision</h2>
            <p className="text-foreground leading-relaxed">
              Devenir le premier e-commerce de référence pour les parfums premium en Afrique, en offrant une expérience d'achat exceptionnelle et des produits authentiques.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-accent mb-4">Nos Valeurs</h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start">
                <span className="text-accent mr-3">●</span>
                <span><strong>Authenticité</strong> - Tous nos produits sont garantis authentiques</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3">●</span>
                <span><strong>Excellence</strong> - Nous sélectionnons les meilleures fragrances</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3">●</span>
                <span><strong>Service Client</strong> - Votre satisfaction est notre priorité</span>
              </li>
              <li className="flex items-start">
                <span className="text-accent mr-3">●</span>
                <span><strong>Accessibilité</strong> - Des prix justes pour la qualité</span>
              </li>
            </ul>
          </section>

          <section className="bg-secondary rounded-lg p-8">
            <h2 className="text-2xl font-bold text-accent mb-4">Contactez-Nous</h2>
            <div className="space-y-3 text-foreground">
              <p><strong>Téléphone :</strong> 01 97 99 99 90</p>
              <p><strong>Email :</strong> niressedigital@gmail.com</p>
              <p><strong>Facebook :</strong> <a href="https://www.facebook.com/modconceptbenin" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">facebook.com/modconceptbenin</a></p>
              <p><strong>TikTok :</strong> @tatavernis229benin</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
