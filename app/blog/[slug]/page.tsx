'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Loader2 } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { API_ENDPOINTS } from '@/lib/api'
import type { Article } from '@/lib/types'

export default function ArticlePage() {
  const params = useParams()
  const slug = params.slug as string
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.articles}?slug=${encodeURIComponent(slug)}`)
        if (res.ok) {
          const data = await res.json()
          setArticle(data)
        }
      } catch {
        // Silencieux
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-2xl font-serif font-bold text-foreground mb-4">Article introuvable</h1>
            <Button asChild className="btn-gold text-primary-foreground">
              <Link href="/blog">Retour au blog</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Image hero */}
        {article.image && (
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={article.image}
              alt={article.titre}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-noir/50" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-3xl mx-auto w-full px-4 pb-10">
                <Link href="/blog" className="inline-flex items-center gap-2 text-cream/80 hover:text-cream text-sm mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Retour au blog
                </Link>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-cream text-balance leading-tight">
                  {article.titre}
                </h1>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-10">
          {!article.image && (
            <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Link>
          )}

          {!article.image && (
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6 text-balance">
              {article.titre}
            </h1>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 border-b border-border pb-6">
            <CalendarDays className="h-4 w-4" />
            <time dateTime={article.created_at}>
              Publié le{' '}
              {new Date(article.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>

          {/* Extrait */}
          {article.extrait && (
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed italic border-l-4 border-primary pl-4">
              {article.extrait}
            </p>
          )}

          {/* Contenu */}
          <div
            className="prose prose-lg max-w-none text-foreground leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.contenu.replace(/\n/g, '<br/>') }}
          />

          {/* Vidéo */}
          {article.video_url && (
            <div className="mt-10 rounded-xl overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={article.video_url}
                  className="w-full h-full"
                  allowFullScreen
                  title={article.titre}
                />
              </div>
            </div>
          )}

          {/* CTA retour */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tous les articles
              </Link>
            </Button>
            <Button asChild className="btn-gold text-primary-foreground">
              <Link href="/boutique">Découvrir nos parfums</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
