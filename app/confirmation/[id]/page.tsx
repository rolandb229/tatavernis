'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, MapPin, Phone, Hash, Loader2, ShoppingBag, MessageCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { API_ENDPOINTS, formatPrice } from '@/lib/api'
import type { Commande } from '@/lib/types'

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  paye: 'Payé',
  valide: 'Validé',
  en_livraison: 'En livraison',
  livre: 'Livré',
  annule: 'Annulé',
}

export default function ConfirmationPage() {
  const params = useParams()
  const commande_id = params.id as string
  const [commande, setCommande] = useState<Commande | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!commande_id) return
    fetch(`${API_ENDPOINTS.commandes}?id=${commande_id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => setCommande(Array.isArray(data) ? data[0] : data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [commande_id])

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

  if (!commande) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-background px-4">
          <div className="text-center">
            <Package className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl font-serif font-bold text-foreground mb-3">Commande introuvable</h1>
            <p className="text-muted-foreground mb-6">Vérifiez le numéro ou contactez-nous.</p>
            <Button asChild className="btn-gold text-primary-foreground">
              <Link href="/">Retour à l&apos;accueil</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isRetrait = commande.mode_reception === 'retrait'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="max-w-2xl mx-auto px-4 space-y-8">

          {/* Succès */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-5">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Commande confirmée !</h1>
            <p className="text-muted-foreground">
              Merci {commande.nom_complet}, votre commande a bien été enregistrée.
            </p>
          </div>

          {/* Code secret retrait */}
          {isRetrait && commande.code_secret && (
            <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-6 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                Votre code de retrait
              </p>
              <p className="text-5xl font-mono font-bold text-primary tracking-widest mb-3">
                {commande.code_secret}
              </p>
              <p className="text-sm text-muted-foreground">
                Présentez ce code en boutique pour récupérer votre commande.
              </p>
            </div>
          )}

          {/* Détails */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="font-serif font-bold text-lg text-foreground">Détails de la commande</h2>
            <Separator />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" /> Numéro
                </span>
                <span className="font-semibold text-foreground">#{commande.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" /> Téléphone
                </span>
                <span className="font-semibold text-foreground">{commande.telephone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Réception
                </span>
                <span className="font-semibold text-foreground">
                  {isRetrait ? 'Retrait en boutique' : 'Livraison à domicile'}
                </span>
              </div>
              {!isRetrait && commande.adresse_livraison && (
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Adresse</span>
                  <span className="font-semibold text-foreground text-right">
                    {commande.adresse_livraison}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <span className="font-semibold text-primary">
                  {STATUT_LABELS[commande.statut] ?? commande.statut}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-primary text-lg">
                  {formatPrice(commande.montant_total)}
                </span>
              </div>
            </div>
          </div>

          {/* Produits commandés */}
          {commande.produits && commande.produits.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h2 className="font-serif font-bold text-lg text-foreground">Produits commandés</h2>
              <Separator />
              <div className="space-y-3">
                {commande.produits.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {p.nom} <span className="text-muted-foreground">× {p.quantite}</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(p.prix_unitaire * p.quantite)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted/40 rounded-2xl p-5 text-sm text-muted-foreground">
            {isRetrait ? (
              <>
                <p className="font-semibold text-foreground mb-1">Instructions de retrait</p>
                <p>
                  Présentez-vous en boutique avec votre code de retrait. Notre équipe préparera
                  votre commande dans les plus brefs délais.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground mb-1">Instructions de livraison</p>
                <p>
                  Notre équipe vous contactera par téléphone pour confirmer l&apos;adresse et le
                  créneau de livraison.
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="btn-gold text-primary-foreground flex-1">
              <Link href="/boutique">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continuer mes achats
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-primary/30 hover:border-primary"
            >
              <a
                href={(() => {
                  const msg = encodeURIComponent(
                    `Bonjour, je viens de passer la commande #${commande.id}. Code : ${commande.code_secret || ''}`
                  )
                  return `https://wa.me/22901979999090?text=${msg}`
                })()}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contacter via WhatsApp
              </a>
            </Button>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
