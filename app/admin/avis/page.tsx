'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle, XCircle, Trash2, Loader2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Avis } from '@/lib/types'

const FILTER_OPTIONS = [
  { value: 'tous', label: 'Tous les avis' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'approuve', label: 'Approuvés' },
]

function Stars({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={cn('h-4 w-4', i <= note ? 'fill-primary text-primary' : 'text-muted-foreground/30')}
        />
      ))}
    </div>
  )
}

const DEMO_AVIS: Avis[] = [
  { id: 1, produit_id: 1, nom_client: 'Adjobi K.', note: 5, commentaire: 'Parfum exceptionnel, tenue toute la journée. Je recommande vivement !', approuve: false, created_at: new Date().toISOString() },
  { id: 2, produit_id: 2, nom_client: 'Fatima D.', note: 4, commentaire: 'Très bonne qualité, livraison rapide. Légèrement différent de ce que j\'attendais mais satisfaite.', approuve: true, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, produit_id: 3, nom_client: 'Mohamed T.', note: 5, commentaire: 'Superbe sillage, je reçois des compliments tout le temps !', approuve: true, created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 4, produit_id: 1, nom_client: 'Ama G.', note: 3, commentaire: 'Correct mais un peu cher pour la contenance.', approuve: false, created_at: new Date(Date.now() - 259200000).toISOString() },
]

export default function AdminAvisPage() {
  const [avis, setAvis] = useState<Avis[]>(DEMO_AVIS)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')
  const [selected, setSelected] = useState<Avis | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)

  useEffect(() => {
    api.getAvis(undefined, true)
      .then(data => {
        const list = Array.isArray(data) ? data : (data as any)?.data ?? []
        if (list.length > 0) setAvis(list)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = avis.filter(a => {
    if (filter === 'approuve') return a.approuve
    if (filter === 'en_attente') return !a.approuve
    return true
  })

  const handleApprouver = async (id: number) => {
    setProcessing(id)
    try {
      await api.approuverAvis(id, true)
      setAvis(prev => prev.map(a => a.id === id ? { ...a, approuve: true } : a))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, approuve: true } : null)
    } catch { alert('Erreur. Vérifiez que XAMPP est actif.') }
    finally { setProcessing(null) }
  }

  const handleRejeter = async (id: number) => {
    setProcessing(id)
    try {
      await api.deleteAvis(id)
      setAvis(prev => prev.filter(a => a.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch { alert('Erreur. Vérifiez que XAMPP est actif.') }
    finally { setProcessing(null) }
  }

  const handleSupprimer = async (id: number) => {
    if (!confirm('Supprimer cet avis ?')) return
    setProcessing(id)
    try {
      await api.deleteAvis(id)
      setAvis(prev => prev.filter(a => a.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch { alert('Erreur de suppression.') }
    finally { setProcessing(null) }
  }

  const enAttente = avis.filter(a => !a.approuve).length
  const approuves = avis.filter(a => a.approuve).length

  return (
    <div className="space-y-5">

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{avis.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{enAttente}</p>
          <p className="text-xs text-amber-600/80 mt-1">En attente</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{approuves}</p>
          <p className="text-xs text-green-600/80 mt-1">Approuvés</p>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} avis</span>
      </div>

      {/* Tableau */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aucun avis dans cette catégorie.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(avisItem => (
              <div key={avisItem.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                {/* Note + client */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-sm text-foreground">{avisItem.nom_client}</p>
                    <Stars note={avisItem.note} />
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      avisItem.approuve
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    )}>
                      {avisItem.approuve ? 'Approuvé' : 'En attente'}
                    </span>
                  </div>
                  {avisItem.commentaire && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{avisItem.commentaire}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(avisItem.created_at).toLocaleDateString('fr-FR')}
                    {' · '}Produit #{avisItem.produit_id}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelected(avisItem)}
                    title="Voir le détail"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!avisItem.approuve && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700"
                      onClick={() => handleApprouver(avisItem.id)}
                      disabled={processing === avisItem.id}
                      title="Approuver"
                    >
                      {processing === avisItem.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <CheckCircle className="h-4 w-4" />
                      }
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => avisItem.approuve ? handleSupprimer(avisItem.id) : handleRejeter(avisItem.id)}
                    disabled={processing === avisItem.id}
                    title={avisItem.approuve ? 'Supprimer' : 'Rejeter'}
                  >
                    {processing === avisItem.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : avisItem.approuve ? <Trash2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog détail avis */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Détail de l&apos;avis</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-serif font-bold text-primary">
                  {selected.nom_client.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selected.nom_client}</p>
                  <Stars note={selected.note} />
                </div>
              </div>
              {selected.commentaire && (
                <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-4 leading-relaxed">
                  &ldquo;{selected.commentaire}&rdquo;
                </p>
              )}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Produit #{selected.produit_id}</p>
                <p>Posté le {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p>Statut : <span className={selected.approuve ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{selected.approuve ? 'Approuvé' : 'En attente'}</span></p>
              </div>
              <div className="flex gap-2 pt-2">
                {!selected.approuve && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprouver(selected.id)}
                    disabled={processing === selected.id}
                  >
                    {processing === selected.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approuver
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => selected.approuve ? handleSupprimer(selected.id) : handleRejeter(selected.id)}
                  disabled={processing === selected.id}
                >
                  {processing === selected.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                  {selected.approuve ? 'Supprimer' : 'Rejeter'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
