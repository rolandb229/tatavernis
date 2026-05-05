'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Globe, Phone, Mail, MapPin, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'

interface Parametres {
  nom_site: string
  description_site: string
  telephone: string
  whatsapp: string
  email: string
  adresse: string
  ville: string
  frais_livraison: string
  livraison_gratuite_min: string
  horaires: string
  facebook_url: string
  instagram_url: string
  tiktok_url: string
}

const DEFAULT: Parametres = {
  nom_site: 'Tatavernis',
  description_site: 'Parfumerie haut de gamme au Bénin',
  telephone: '+229 01 97 99 99 90',
  whatsapp: '22901979999090',
  email: 'contact@tatavernis.com',
  adresse: 'Cotonou, Bénin',
  ville: 'Cotonou',
  frais_livraison: '2000',
  livraison_gratuite_min: '50000',
  horaires: 'Lun-Sam : 8h-20h | Dim : 10h-18h',
  facebook_url: '',
  instagram_url: '',
  tiktok_url: '',
}

export default function AdminParametresPage() {
  const [params, setParams] = useState<Parametres>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.getParametres()
      .then((data: any) => {
        if (data && typeof data === 'object') {
          setParams(prev => ({ ...prev, ...data }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof Parametres, value: string) =>
    setParams(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await api.updateParametres(params as unknown as Record<string, string>)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Erreur de sauvegarde. Vérifiez que XAMPP est actif.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* Informations du site */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="font-serif font-bold text-foreground">Informations du site</h2>
        </div>
        <Separator />
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Nom du site</Label>
            <Input value={params.nom_site} onChange={e => set('nom_site', e.target.value)} className="bg-background" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Description</Label>
            <Textarea
              value={params.description_site}
              onChange={e => set('description_site', e.target.value)}
              rows={3}
              className="bg-background resize-none"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Horaires d&apos;ouverture</Label>
            <Input value={params.horaires} onChange={e => set('horaires', e.target.value)} className="bg-background" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="font-serif font-bold text-foreground">Contact</h2>
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm">Téléphone</Label>
              <Input value={params.telephone} onChange={e => set('telephone', e.target.value)} className="bg-background" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">WhatsApp (numéro avec indicatif)</Label>
              <Input value={params.whatsapp} onChange={e => set('whatsapp', e.target.value)} className="bg-background" placeholder="22901979999090" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input type="email" value={params.email} onChange={e => set('email', e.target.value)} className="bg-background" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Adresse
              </Label>
              <Input value={params.adresse} onChange={e => set('adresse', e.target.value)} className="bg-background" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Ville</Label>
              <Input value={params.ville} onChange={e => set('ville', e.target.value)} className="bg-background" />
            </div>
          </div>
        </div>
      </section>

      {/* Livraison */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <h2 className="font-serif font-bold text-foreground">Livraison</h2>
        </div>
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block text-sm">Frais de livraison (FCFA)</Label>
            <Input
              type="number"
              value={params.frais_livraison}
              onChange={e => set('frais_livraison', e.target.value)}
              className="bg-background"
              min={0}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Livraison gratuite à partir de (FCFA)</Label>
            <Input
              type="number"
              value={params.livraison_gratuite_min}
              onChange={e => set('livraison_gratuite_min', e.target.value)}
              className="bg-background"
              min={0}
            />
          </div>
        </div>
      </section>

      {/* Réseaux sociaux */}
      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h2 className="font-serif font-bold text-foreground">Réseaux sociaux</h2>
        <Separator />
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block text-sm">Facebook URL</Label>
            <Input value={params.facebook_url} onChange={e => set('facebook_url', e.target.value)} className="bg-background" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Instagram URL</Label>
            <Input value={params.instagram_url} onChange={e => set('instagram_url', e.target.value)} className="bg-background" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">TikTok URL</Label>
            <Input value={params.tiktok_url} onChange={e => set('tiktok_url', e.target.value)} className="bg-background" placeholder="https://tiktok.com/@..." />
          </div>
        </div>
      </section>

      {/* Bouton sauvegarder */}
      <div className="flex items-center gap-4 pb-4">
        <Button
          className="btn-gold text-primary-foreground px-8"
          onClick={handleSave}
          disabled={saving}
        >
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Sauvegarde...</>
            : <><Save className="h-4 w-4 mr-2" />Sauvegarder</>
          }
        </Button>
        {saved && (
          <p className="text-sm text-green-600 font-medium">Paramètres sauvegardés avec succès !</p>
        )}
      </div>

    </div>
  )
}
