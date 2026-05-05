'use client'

import { useState } from 'react'
import { Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    // Simuler l'inscription (à brancher sur une API email réelle)
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <section className="py-20 bg-primary">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-foreground/10 mb-6">
          <Mail className="h-7 w-7 text-primary-foreground" />
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-4 text-balance">
          Restez informé(e) des nouveautés
        </h2>
        <p className="text-primary-foreground/70 mb-8 leading-relaxed">
          Inscrivez-vous à notre newsletter et recevez en avant-première nos nouvelles collections,
          offres exclusives et conseils beauté.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 text-primary-foreground">
            <CheckCircle className="h-6 w-6" />
            <p className="text-lg font-medium">Merci pour votre inscription !</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold shrink-0"
            >
              {loading ? 'Inscription...' : (
                <>
                  S&apos;inscrire
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        )}

        <p className="text-primary-foreground/40 text-xs mt-4">
          Pas de spam. Désinscription possible à tout moment.
        </p>
      </div>
    </section>
  )
}
