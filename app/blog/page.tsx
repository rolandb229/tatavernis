'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CalendarDays, ArrowRight, BookOpen } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Skeleton } from '@/components/ui/skeleton'
import type { Article } from '@/lib/types'
import { API_ENDPOINTS } from '@/lib/api'

const SAMPLE_ARTICLES: Article[] = [
  {
    id: 1,
    titre: 'Comment choisir son parfum ?',
    slug: 'comment-choisir-son-parfum',
    contenu: 'Le choix d\'un parfum est une décision personnelle qui dépend de nombreux facteurs. Voici nos conseils pour trouver votre signature olfactive...',
    extrait: 'Découvrez nos conseils pour trouver le parfum qui vous correspond parfaitement.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/abc2545e7c4141bcbc0b2fbea495681f-zHwomACKMqTjNW4gaFKHDk07wsUXPm.jpg',
    publie: true,
    created_at: '2024-03-01',
  },
  {
    id: 2,
    titre: 'Les tendances parfums 2024',
    slug: 'tendances-parfums-2024',
    contenu: 'Cette année, les parfums orientaux et les notes gourmandes sont à l\'honneur. Découvrez les fragrances qui marqueront l\'année...',
    extrait: 'Les fragrances incontournables de cette année.',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/f1ce449530b14fc8913f9c96bd3af121-b8TMbBnsZ5oForhDQtpniEWhC8tlhj.jpg',
    publie: true,
    created_at: '2024-02-15',
  },
]

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>(SAMPLE_ARTICLES)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.articles)
        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data) && data.length > 0) setArticles(data)
        }
      } catch {
        // Silencieux : utilise les données de démonstration
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <div className="bg-noir text-cream py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-gold-gradient">Notre Blog</h1>
            <p className="text-cream/70">Conseils, tendances et actualités du monde des parfums</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-14">
          {loading ? (
            <div className="space-y-10">
              {[1, 2].map(i => (
                <div key={i} className="flex flex-col md:flex-row gap-6">
                  <Skeleton className="h-56 w-full md:w-72 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Aucun article pour le moment</p>
            </div>
          ) : (
            <div className="space-y-10">
              {articles.map(article => (
                <article key={article.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    {article.image && (
                      <div className="relative h-56 md:h-auto md:w-72 flex-shrink-0 overflow-hidden">
                        <Image
                          src={article.image}
                          alt={article.titre}
                          fill
                          className="object-cover image-zoom"
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-between p-6 flex-1">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <CalendarDays className="h-4 w-4" />
                          <time dateTime={article.created_at}>
                            {new Date(article.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </time>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {article.titre}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                          {article.extrait || article.contenu.substring(0, 200) + '…'}
                        </p>
                      </div>
                      <div className="mt-5">
                        <Link
                          href={`/blog/${article.slug}`}
                          className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                        >
                          Lire la suite
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
