'use client'

import { useState, useEffect } from 'react'
import { Search, Eye, Loader2, ChevronDown, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { api, formatPrice, STATUT_LABELS, STATUT_COLORS } from '@/lib/api'
import type { Commande } from '@/lib/types'

const STATUTS_OPTIONS = [
  { value: 'tous', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'paye', label: 'Payé' },
  { value: 'valide', label: 'Validé' },
  { value: 'en_livraison', label: 'En livraison' },
  { value: 'livre', label: 'Livré' },
  { value: 'annule', label: 'Annulé' },
]

export default function AdminCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('tous')
  const [selected, setSelected] = useState<Commande | null>(null)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    api.getCommandes()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setCommandes(list)
      })
      .catch((error) => {
        console.error('[v0] Error loading orders:', error)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = commandes.filter(cmd => {
    const matchSearch =
      !search ||
      String(cmd.id).includes(search) ||
      cmd.code_secret?.toLowerCase().includes(search.toLowerCase()) ||
      cmd.nom_complet?.toLowerCase().includes(search.toLowerCase()) ||
      cmd.telephone?.includes(search)
    const matchStatut = statutFilter === 'tous' || cmd.statut === statutFilter
    return matchSearch && matchStatut
  })

  const updateStatut = async (cmdId: number, statut: string) => {
    setUpdating(cmdId)
    try {
      await api.updateCommandeStatut(cmdId, statut)
      setCommandes(prev => prev.map(c => c.id === cmdId ? { ...c, statut: statut as Commande['statut'] } : c))
      if (selected?.id === cmdId) setSelected(prev => prev ? { ...prev, statut: statut as Commande['statut'] } : null)
    } catch (error) {
      console.error('[v0] Error updating order status:', error)
      alert('Erreur lors de la mise à jour du statut.')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par ID, code, nom, téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUTS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Client</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Montant</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filtered.map(cmd => (
                  <tr key={cmd.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-muted-foreground">#{cmd.id}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono font-bold">{cmd.code_secret}</code>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{cmd.nom_complet || `Client #${cmd.client_id}`}</p>
                        {cmd.telephone && <p className="text-xs text-muted-foreground">{cmd.telephone}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground hidden md:table-cell">
                      {formatPrice(cmd.montant_total)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {new Date(cmd.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUT_COLORS[cmd.statut]}`}>
                        {STATUT_LABELS[cmd.statut]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(cmd)} className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
            {filtered.length} commande{filtered.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Modal détail commande */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {selected ? `Commande #${selected.id}` : 'Commande'}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <>
              <div className="space-y-4">
                {/* Code secret */}
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Code secret de retrait</p>
                  <p className="text-2xl font-bold font-mono tracking-widest text-primary">{selected.code_secret}</p>
                </div>

                {/* Info client */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm">Client</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{selected.nom_complet || `Client #${selected.client_id}`}</span>
                  </div>
                  {selected.telephone && (
                    <a
                      href={`https://wa.me/${selected.telephone?.replace(/\s/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {selected.telephone} (WhatsApp)
                    </a>
                  )}
                  {selected.adresse_livraison && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5" />
                      {selected.adresse_livraison}
                    </div>
                  )}
                </div>

                {/* Détails */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-muted-foreground mb-0.5">Montant</p>
                    <p className="font-bold text-foreground">{formatPrice(selected.montant_total)}</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-muted-foreground mb-0.5">Mode</p>
                    <p className="font-bold text-foreground capitalize">{selected.mode_reception}</p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-muted-foreground mb-0.5">Date</p>
                    <p className="font-bold text-foreground">
                      {new Date(selected.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-muted-foreground mb-0.5">Statut actuel</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_COLORS[selected.statut]}`}>
                      {STATUT_LABELS[selected.statut]}
                    </span>
                  </div>
                </div>

                {/* Mise à jour statut */}
                <div>
                  <p className="text-sm font-semibold text-foreground mb-2">Mettre à jour le statut</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUT_LABELS).map(([statut, label]) => (
                      <button
                        key={statut}
                        disabled={selected.statut === statut || updating === selected.id}
                        onClick={() => updateStatut(selected.id, statut)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 ${
                          selected.statut === statut
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary hover:text-primary'
                        }`}
                      >
                        {updating === selected.id ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : null}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
