import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Phone, Mail, MapPin } from 'lucide-react'
import { SOCIAL_LINKS, CONTACT_EMAIL, CONTACT_PHONE } from '@/lib/api'

const navigation = {
  boutique: [
    { name: 'Tous les parfums', href: '/boutique' },
    { name: 'Nouveautes', href: '/boutique?nouveautes=1' },
    { name: 'Promotions', href: '/promotions' },
    { name: 'Pour Homme', href: '/boutique?categorie=1' },
    { name: 'Pour Femme', href: '/boutique?categorie=2' },
  ],
  informations: [
    { name: 'A propos', href: '/a-propos' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Livraison', href: '/contact#livraison' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-noir text-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and description */}
          <div className="space-y-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nouveau%20logo%20tata%20vernis%20copie-yiLw2DUuF21Ws2mr1cAWUFWHxGOwsn.png"
              alt="Tatavernis"
              width={150}
              height={50}
              className="h-10 w-auto brightness-110"
            />
            <p className="text-sm text-cream/70 leading-relaxed">
              Le parfum est une signature invisible mais inoubliable. 
              Decouvrez notre collection exclusive de fragrances haut de gamme.
            </p>
            <div className="flex gap-4">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/70 hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/70 hover:text-primary transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="sr-only">TikTok</span>
              </a>
            </div>
          </div>

          {/* Boutique links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Boutique
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.boutique.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream/70 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Informations
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.informations.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream/70 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-2 text-sm text-cream/70">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${CONTACT_PHONE}`} className="hover:text-primary transition-colors">
                  {CONTACT_PHONE}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-cream/70">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary transition-colors">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-cream/70">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Cotonou, Benin</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream/10 pt-8">
          <p className="text-center text-xs text-cream/50">
            &copy; {new Date().getFullYear()} Tatavernis. Tous droits reserves. 
            Parfumerie haut de gamme au Benin.
          </p>
        </div>
      </div>
    </footer>
  )
}
