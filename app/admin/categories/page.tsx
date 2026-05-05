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
import type { Categorie } from '@/lib/types'

const EMPTY = { nom: '', slug: '', description: '', image: '' }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    api.getCategories().then(data => { if (Array.isArray(data)) setCategories(data) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setEditId(null); setForm(EMPTY); setDialogOpen(true) }
  const openEdit = (c: Categorie) => {
    setEditId(c.id)
    setForm({ nom: c.nom, slug: c.slug, description: c.description || '', image: c.image || '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nom) { alert('Nom obligatoire'); return }
    setSaving(true)
    try {
      const payload = { ...form, slug: form.slug || form.nom.toLowerCase().replace(/\s+/g, '-') }
      if (editId) {
        await api.updateCategorie(editId, payload)
        setCategories(prev => prev.map(c => c.id === editId ? { ...c, ...payload } : c))
      } else {
        const res = await api.createCategorie(payload)
        if (res?.id) setCategories(prev => [...prev, { ...payload, id: res.id } as Categorie])
      }
      setDialogOpen(false)
    } catch { alert('Erreur de sauvegarde.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try { await api.deleteCategorie(id); setCategories(prev => prev.filter(c => c.id !== id)) }
    catch { alert('Erreur de suppression.') }
    finally { setDeleteId(null) }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button className="btn-gold text-primary-foreground" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nouvelle catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></div>
        ) : categories.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">Aucune catégorie. Ajoutez-en une !</div>
        ) : (
          categories.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-4 flex items-start justify-between">
              <div>
                <p className="font-serif font-bold text-foreground">{c.nom}</p>
                {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
                {c.nb_produits !== undefined && <p className="text-xs text-primary mt-1">{c.nb_produits} produit{c.nb_produits > 1 ? 's' : ''}</p>}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(c.id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif">{editId ? 'Modifier' : 'Nouvelle'} catégorie</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label className="mb-1.5 block">Nom *</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
            <div><Label className="mb-1.5 block">Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
            <div><Label className="mb-1.5 block">Image (URL)</Label><Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} /></div>
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
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Supprimer cette catégorie ?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
