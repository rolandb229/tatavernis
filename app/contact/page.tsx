'use client'

import { useState } from 'react'
import { MessageCircle, Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { WHATSAPP_NUMBER, CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS } from '@/lib/api'

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Bonjour Tatavernis,\n\nJe m'appelle ${form.nom || '...'}\n\n${form.message || 'Je souhaite vous contacter.'}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
    setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Hero */}
        <div className="bg-noir text-cream py-12 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 text-gold-gradient">Contact</h1>
          <p className="text-cream/70">Nous sommes là pour vous aider</p>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Coordonnées */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Nos Coordonnées</h2>
                <div className="space-y-4">
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">WhatsApp</p>
                      <p className="text-muted-foreground text-sm">+{WHATSAPP_NUMBER}</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">Cliquez pour ouvrir WhatsApp</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${CONTACT_PHONE}`}
                    className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Téléphone</p>
                      <p className="text-muted-foreground text-sm">{CONTACT_PHONE}</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <p className="text-muted-foreground text-sm">{CONTACT_EMAIL}</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Localisation</p>
                      <p className="text-muted-foreground text-sm">Cotonou, Bénin</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">Suivez-nous</h3>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Facebook
                  </a>
                  <a
                    href={SOCIAL_LINKS.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-noir text-cream rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    TikTok
                  </a>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-card border border-border rounded-2xl p-6">
              {sent ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-2">
                    Message envoyé via WhatsApp !
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button variant="outline" onClick={() => setSent(false)}>
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-serif font-bold text-foreground mb-5">
                    Envoyer un message
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nom" className="text-foreground mb-1.5 block">Votre nom</Label>
                        <Input id="nom" placeholder="Kokou Mensah" value={form.nom}
                          onChange={e => setForm({ ...form, nom: e.target.value })} className="bg-background" />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-foreground mb-1.5 block">Email</Label>
                        <Input id="email" type="email" placeholder="vous@exemple.com" value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })} className="bg-background" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="sujet" className="text-foreground mb-1.5 block">Sujet</Label>
                      <Input id="sujet" placeholder="Question sur un produit..." value={form.sujet}
                        onChange={e => setForm({ ...form, sujet: e.target.value })} className="bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-foreground mb-1.5 block">Message</Label>
                      <Textarea id="message" placeholder="Votre message..." rows={5} value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })} className="bg-background" />
                    </div>
                    <Button className="w-full btn-gold text-primary-foreground" onClick={handleWhatsApp}>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer via WhatsApp
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Le message s&apos;ouvrira dans WhatsApp pour envoi
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
