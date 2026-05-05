'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { api } from '@/lib/api'
import type { Marque } from '@/lib/types'

const EMPTY = { nom: '', slug: '', description: '', logo: '' }

export default function AdminMarquesPage() {
  const [marques, setMarques] = useState<Marque[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    api.getMarques().then(data => { if (Array.isArray(data)) setMarques(data) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setEditId(null); setForm(EMPTY); setDialogOpen(true) }
  const openEdit = (m: Marque) => {
    setEditId(m.id)
    setForm({ nom: m.nom, slug: m.slug, description: m.description || '', logo: m.logo || '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nom) { alert('Nom obligatoire'); return }
    setSaving(true)
    try {
      const payload = { ...form, slug: form.slug || form.nom.toLowerCase().replace(/\s+/g, '-') }
      if (editId) {
        await api.updateMarque(editId, payload)
        setMarques(prev => prev.map(m => m.id === editId ? { ...m, ...payload } : m))
      } else {
        const res = await api.createMarque(payload)
        if (res?.id) setMarques(prev => [...prev, { ...payload, id: res.id } as Marque])
      }
      setDialogOpen(false)
    } catch { alert('Erreur de sauvegarde.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try { await api.deleteMarque(id); setMarques(prev => prev.filter(m => m.id !== id)) }
    catch { alert('Erreur de suppression.') }
    finally { setDeleteId(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button className="btn-gold text-primary-foreground" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle marque
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
        ) : marques.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">Aucune marque. Ajoutez-en une !</div>
        ) : (
          marques.map(m => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between">
              <div>
                <p className="font-serif font-bold text-foreground">{m.nom}</p>
                {m.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>}
                {m.nb_produits !== undefined && <p className="text-xs text-primary mt-1">{m.nb_produits} produit{m.nb_produits > 1 ? 's' : ''}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(m)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif">{editId ? 'Modifier' : 'Nouvelle'} marque</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="mb-1.5 block">Nom *</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            <div><Label className="mb-1.5 block">Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="nom-de-marque" /></div>
            <div><Label className="mb-1.5 block">Logo (URL)</Label><Input value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} /></div>
            <div><Label className="mb-1.5 block">Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button className="btn-gold text-primary-foreground" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{editId ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Supprimer cette marque ?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
