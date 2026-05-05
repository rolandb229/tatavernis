'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { API_ENDPOINTS, formatPrice } from '@/lib/api'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'

export default function PanierPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [codeSecret, setCodeSecret] = useState<string | null>(null)
  const [commandeId, setCommandeId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    nom_complet: '',
    telephone: '',
    email: '',
    adresse: '',
    notes: '',
    mode_reception: 'retrait' as 'retrait' | 'livraison',
  })

  const total = getTotal()

  const handleSubmitOrder = async () => {
    if (!formData.nom_complet.trim() || !formData.telephone.trim()) {
      alert('Veuillez remplir le nom et le numéro de téléphone.')
      return
    }
    if (formData.mode_reception === 'livraison' && !formData.adresse.trim()) {
      alert('Veuillez indiquer votre adresse de livraison.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.commandes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom_complet: formData.nom_complet,
          telephone: formData.telephone,
          email: formData.email,
          adresse: formData.adresse,
          adresse_livraison: formData.adresse,
          notes: formData.notes,
          mode_reception: formData.mode_reception,
          produits: items.map(item => ({
            id: item.produit.id,
            quantite: item.quantite,
          })),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setCodeSecret(data.code_secret)
        setCommandeId(data.commande_id)
        clearCart()
        setStep(3)
      } else {
        alert(data.error || 'Erreur lors de la création de la commande. Vérifiez que XAMPP est actif.')
      }
    } catch {
      alert('Impossible de contacter le serveur. Vérifiez que XAMPP est démarré et que la base de données est configurée.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-background">
          <div className="text-center px-4">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-serif font-bold text-foreground mb-4">Votre panier est vide</h1>
            <p className="text-muted-foreground mb-8">Découvrez notre collection de parfums haut de gamme</p>
            <Button asChild className="btn-gold text-primary-foreground px-8 py-3">
              <Link href="/boutique">Découvrir la boutique</Link>
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
      <main className="flex-1 bg-background py-12">
        <div className="max-w-4xl mx-auto px-4">

          {/* Titre + retour */}
          <div className="mb-8">
            {step !== 3 && (
              <Link href="/boutique" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-4 text-sm transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Continuer les achats
              </Link>
            )}
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {step === 1 ? 'Votre Panier' : step === 2 ? 'Vos Informations' : 'Commande Confirmée !'}
            </h1>
          </div>

          {/* Indicateur d'étapes */}
          {step !== 3 && (
            <div className="flex items-center mb-10">
              {[
                { num: 1, label: 'Panier' },
                { num: 2, label: 'Informations' },
                { num: 3, label: 'Confirmation' },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-1 transition-colors ${
                      step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {s.num}
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">{s.label}</span>
                  </div>
                  {i < 2 && (
                    <div className={`h-0.5 flex-1 mb-5 transition-colors ${step > s.num ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Étape 1 : Panier */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => {
                  const prix = item.produit.prix_promo || item.produit.prix
                  return (
                    <div key={item.produit.id} className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={item.produit.image} alt={item.produit.nom} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-foreground truncate">{item.produit.nom}</h3>
                        <p className="text-sm text-muted-foreground">{item.produit.marque_nom}</p>
                        <p className="text-primary font-bold mt-1">{formatPrice(prix)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8"
                          onClick={() => updateQuantity(item.produit.id, item.quantite - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-foreground">{item.quantite}</span>
                        <Button variant="outline" size="icon" className="h-8 w-8"
                          onClick={() => updateQuantity(item.produit.id, item.quantite + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{formatPrice(prix * item.quantite)}</p>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive mt-1"
                          onClick={() => removeItem(item.produit.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Récapitulatif */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <h2 className="font-serif font-bold text-lg text-foreground mb-4">Récapitulatif</h2>
                  <div className="space-y-2 mb-4">
                    {items.map(item => (
                      <div key={item.produit.id} className="flex justify-between text-sm text-muted-foreground">
                        <span className="truncate mr-2">{item.produit.nom} ×{item.quantite}</span>
                        <span className="flex-shrink-0">{formatPrice((item.produit.prix_promo || item.produit.prix) * item.quantite)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-foreground text-lg mb-6">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                  <Button className="w-full btn-gold text-primary-foreground font-semibold py-3" onClick={() => setStep(2)}>
                    Passer la commande
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Informations */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                  <h2 className="font-serif font-bold text-xl text-foreground">Vos informations</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nom" className="text-foreground mb-1.5 block">Nom complet *</Label>
                      <Input id="nom" placeholder="Kokou Mensah" value={formData.nom_complet}
                        onChange={e => setFormData({ ...formData, nom_complet: e.target.value })}
                        className="bg-background" />
                    </div>
                    <div>
                      <Label htmlFor="tel" className="text-foreground mb-1.5 block">Téléphone / WhatsApp *</Label>
                      <Input id="tel" placeholder="+229 01 97 99 99 90" value={formData.telephone}
                        onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                        className="bg-background" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground mb-1.5 block">Email (optionnel)</Label>
                    <Input id="email" type="email" placeholder="vous@exemple.com" value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="bg-background" />
                  </div>

                  <div>
                    <Label className="text-foreground mb-3 block font-semibold">Mode de réception *</Label>
                    <RadioGroup value={formData.mode_reception}
                      onValueChange={v => setFormData({ ...formData, mode_reception: v as 'retrait' | 'livraison' })}
                      className="space-y-3">
                      <div className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${formData.mode_reception === 'retrait' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value="retrait" id="retrait" className="mt-0.5" />
                        <Label htmlFor="retrait" className="cursor-pointer">
                          <span className="font-semibold text-foreground block">Retrait en boutique</span>
                          <span className="text-sm text-muted-foreground">Venez récupérer votre commande à Cotonou</span>
                        </Label>
                      </div>
                      <div className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${formData.mode_reception === 'livraison' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                        <RadioGroupItem value="livraison" id="livraison" className="mt-0.5" />
                        <Label htmlFor="livraison" className="cursor-pointer">
                          <span className="font-semibold text-foreground block">Livraison à domicile</span>
                          <span className="text-sm text-muted-foreground">Livraison au Bénin et en Afrique</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.mode_reception === 'livraison' && (
                    <div>
                      <Label htmlFor="adresse" className="text-foreground mb-1.5 block">Adresse de livraison *</Label>
                      <Textarea id="adresse" placeholder="Quartier, rue, ville, pays..." rows={3}
                        value={formData.adresse}
                        onChange={e => setFormData({ ...formData, adresse: e.target.value })}
                        className="bg-background" />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes" className="text-foreground mb-1.5 block">Notes (optionnel)</Label>
                    <Textarea id="notes" placeholder="Instructions spéciales, emballage cadeau..." rows={2}
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-background" />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                  </Button>
                  <Button className="flex-1 btn-gold text-primary-foreground" onClick={handleSubmitOrder} disabled={loading}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Traitement...</> : 'Confirmer la commande'}
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                  <h2 className="font-serif font-bold text-lg text-foreground mb-4">Votre commande</h2>
                  <div className="space-y-2 mb-4">
                    {items.map(item => (
                      <div key={item.produit.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate mr-2">{item.produit.nom} ×{item.quantite}</span>
                        <span className="text-foreground flex-shrink-0 font-semibold">
                          {formatPrice((item.produit.prix_promo || item.produit.prix) * item.quantite)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-foreground text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3 : Confirmation */}
          {step === 3 && (
            <div className="max-w-xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-3">Commande confirmée !</h2>
              <p className="text-muted-foreground mb-8">
                Merci pour votre commande. Conservez ce code secret pour suivre ou retirer votre commande.
              </p>

              {codeSecret && (
                <div className="bg-card border-2 border-primary rounded-xl p-6 mb-6 text-left space-y-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">
                    Votre code secret de retrait
                  </p>
                  <p className="text-3xl font-bold text-primary font-mono text-center tracking-widest">
                    {codeSecret}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Présentez ce code en boutique pour récupérer votre commande
                  </p>
                </div>
              )}

              {commandeId && (
                <p className="text-sm text-muted-foreground mb-8">
                  Numéro de commande : <span className="font-semibold text-foreground">#{commandeId}</span>
                </p>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
                <p className="text-sm font-semibold text-amber-800 mb-1">Prochaines étapes</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Nous vous contacterons via WhatsApp pour confirmer</li>
                  <li>• Apportez votre code secret lors du retrait</li>
                  <li>• Conservez ce code précieusement</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <Link href="/boutique">Continuer les achats</Link>
                </Button>
                <Button className="btn-gold text-primary-foreground" asChild>
                  <Link href="/">Retour à l&apos;accueil</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
