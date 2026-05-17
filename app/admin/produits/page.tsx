'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Search, Pencil, Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api, formatPrice } from '@/lib/api'
import type { Produit, Marque, Categorie } from '@/lib/types'

const EMPTY_FORM = {
  nom: '', slug: '', description: '', prix: '', prix_promo: '',
  marque_id: '', categorie_id: '', stock: '', image: '',
  en_vedette: false, est_nouveau: false, est_promo: false,
}

export default function AdminProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [marques, setMarques] = useState<Marque[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    Promise.all([api.getProduits(), api.getMarques(), api.getCategories()])
      .then(([p, m, c]) => {
        const list = Array.isArray(p) ? p : (p?.data ?? [])
        setProduits(list)
        setMarques(Array.isArray(m) ? m : [])
        setCategories(Array.isArray(c) ? c : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = produits.filter(p =>
    !search ||
    p.nom.toLowerCase().includes(search.toLowerCase()) ||
    p.marque_nom?.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (p: Produit) => {
    setEditId(p.id)
    setForm({
      nom: p.nom,
      slug: p.slug,
      description: p.description,
      prix: String(p.prix),
      prix_promo: p.prix_promo ? String(p.prix_promo) : '',
      marque_id: String(p.marque_id),
      categorie_id: String(p.categorie_id),
      stock: String(p.stock),
      image: p.image,
      en_vedette: p.en_vedette,
      est_nouveau: p.est_nouveau,
      est_promo: p.est_promo,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.nom || !form.prix) { alert('Nom et prix obligatoires'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        prix: Number(form.prix),
        prix_promo: form.prix_promo ? Number(form.prix_promo) : null,
        marque_id: Number(form.marque_id),
        categorie_id: Number(form.categorie_id),
        stock: Number(form.stock) || 0,
        slug: form.slug || form.nom.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }
      if (editId) {
        await api.updateProduit(editId, payload)
        setProduits(prev => prev.map(p => p.id === editId ? { ...p, ...payload, id: editId } : p))
      } else {
        const res = await api.createProduit(payload)
        if (res?.id) setProduits(prev => [{ ...payload, id: res.id } as Produit, ...prev])
      }
      setDialogOpen(false)
    } catch (error) {
      console.error('[v0] Error saving product:', error)
      alert('Erreur de sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.deleteProduit(id)
      setProduits(prev => prev.filter(p => p.id !== id))
    } catch {
      alert('Erreur de suppression.')
    } finally {
      setDeleteId(null)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // For now, use a URL directly - in production, use Vercel Blob or similar
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setForm(f => ({ ...f, image: dataUrl }))
        setUploading(false)
      }
      reader.onerror = () => {
        alert('Erreur lors de la lecture du fichier')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      alert('Erreur upload image.')
      setUploading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button className="btn-gold text-primary-foreground" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau produit
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Produit</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Marque</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Prix</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Stock</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Aucun produit trouvé</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={p.image || '/placeholder.jpg'} alt={p.nom} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{p.nom}</p>
                          <div className="flex gap-1 mt-0.5">
                            {p.en_vedette && <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">Vedette</span>}
                            {p.est_nouveau && <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Nouveau</span>}
                            {p.est_promo && <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Promo</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.marque_nom || '—'}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-foreground">{formatPrice(p.prix)}</p>
                        {p.prix_promo && <p className="text-xs text-red-500">{formatPrice(p.prix_promo)}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.stock > 5 ? 'bg-green-100 text-green-700' : p.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock} unités
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
            {filtered.length} produit{filtered.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Dialog créer/éditer */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editId ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Nom *</Label>
              <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Santal Royal..." />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Slug (auto-généré si vide)</Label>
              <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="santal-royal" />
            </div>
            <div>
              <Label className="mb-1.5 block">Prix (FCFA) *</Label>
              <Input type="number" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} placeholder="85000" />
            </div>
            <div>
              <Label className="mb-1.5 block">Prix promo (FCFA)</Label>
              <Input type="number" value={form.prix_promo} onChange={e => setForm({ ...form, prix_promo: e.target.value })} placeholder="70000" />
            </div>
            <div>
              <Label className="mb-1.5 block">Marque</Label>
              <Select value={form.marque_id} onValueChange={v => setForm({ ...form, marque_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {marques.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Catégorie</Label>
              <Select value={form.categorie_id} onValueChange={v => setForm({ ...form, categorie_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Stock</Label>
              <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="10" />
            </div>
            <div>
              <Label className="mb-1.5 block">Image URL</Label>
              <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Uploader une image</Label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-muted-foreground" />
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {form.image && (
                  <div className="relative w-12 h-12 rounded overflow-hidden">
                    <Image src={form.image} alt="preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Description du parfum..." />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.en_vedette} onCheckedChange={v => setForm({ ...form, en_vedette: !!v })} />
                <span className="text-sm">En vedette</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.est_nouveau} onCheckedChange={v => setForm({ ...form, est_nouveau: !!v })} />
                <span className="text-sm">Nouveau</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={form.est_promo} onCheckedChange={v => setForm({ ...form, est_promo: !!v })} />
                <span className="text-sm">En promotion</span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button className="btn-gold text-primary-foreground" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editId ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Supprimer ce produit ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
