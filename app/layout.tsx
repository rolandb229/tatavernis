import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tatavernis | Parfumerie Haut de Gamme',
  description: 'Decouvrez notre collection exclusive de parfums de luxe. Tatavernis, votre parfumerie haut de gamme au Benin.',
  keywords: ['parfum', 'parfumerie', 'luxe', 'Benin', 'Tatavernis', 'fragrance', 'haut de gamme'],
  authors: [{ name: 'Tatavernis' }],
  openGraph: {
    title: 'Tatavernis | Parfumerie Haut de Gamme',
    description: 'Le parfum est une signature invisible mais inoubliable',
    locale: 'fr_FR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d4af37',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${lato.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
