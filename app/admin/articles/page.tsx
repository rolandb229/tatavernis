'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react'
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
import { api, API_ENDPOINTS } from '@/lib/api'
import type { Article } from '@/lib/types'

const EMPTY: Omit<Article, 'id' | 'created_at'> = {
  titre: '', slug: '', contenu: '', extrait: '', image: '', video_url: '', publie: true,
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<typeof EMPTY>(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    api.getArticles(true)
      .then(data => { if (Array.isArray(data) && data.length > 0) setArticles(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const openCreate = () => { setEditId(null); setForm(EMPTY); setDialogOpen(true) }
  const openEdit = (a: Article) => {
    setEditId(a.id)
    setForm({ titre: a.titre, slug: a.slug, contenu: a.contenu, extrait: a.extrait || '', image: a.image || '', video_url: a.video_url || '', publie: a.publie })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.titre || !form.contenu) { alert('Titre et contenu obligatoires'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        slug: form.slug || form.titre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      }
      if (editId) {
        await api.updateArticle(editId, payload)
        setArticles(prev => prev.map(a => a.id === editId ? { ...a, ...payload, id: editId } as Article : a))
      } else {
        const res = await api.createArticle(payload)
        if (res?.id) setArticles(prev => [{ ...payload, id: res.id, created_at: new Date().toISOString() } as Article, ...prev])
      }
      setDialogOpen(false)
    } catch { alert('Erreur de sauvegarde.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try { await api.deleteArticle(id); setArticles(prev => prev.filter(a => a.id !== id)) }
    catch { alert('Erreur de suppression.') }
    finally { setDeleteId(null) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('type', 'article')
      const res = await fetch(API_ENDPOINTS.upload, { method: 'POST', body: fd })
      const data = await res.json()
      if (data?.url) setForm(f => ({ ...f, image: data.url }))
      else if (data?.path) setForm(f => ({ ...f, image: data.path }))
    } catch { alert('Erreur upload.') }
    finally { setUploading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button className="btn-gold text-primary-foreground" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Nouvel article
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Article</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden sm:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Statut</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /></td></tr>
            ) : articles.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">Aucun article. Créez-en un !</td></tr>
            ) : (
              articles.map(a => (
                <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {a.image && (
                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <Image src={a.image} alt={a.titre} fill className="object-cover" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{a.titre}</p>
                        {a.extrait && <p className="text-xs text-muted-foreground truncate max-w-xs">{a.extrait}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {new Date(a.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit ${a.publie ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {a.publie ? <><Eye className="h-3 w-3" /> Publié</> : <><EyeOff className="h-3 w-3" /> Brouillon</>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editId ? 'Modifier' : 'Nouvel'} article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Titre *</Label>
              <Input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Comment choisir son parfum..." />
            </div>
            <div>
              <Label className="mb-1.5 block">Slug</Label>
              <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="comment-choisir-son-parfum" />
            </div>
            <div>
              <Label className="mb-1.5 block">Extrait (résumé)</Label>
              <Textarea value={form.extrait} onChange={e => setForm({ ...form, extrait: e.target.value })} rows={2} placeholder="Court résumé de l'article..." />
            </div>
            <div>
              <Label className="mb-1.5 block">Contenu *</Label>
              <Textarea value={form.contenu} onChange={e => setForm({ ...form, contenu: e.target.value })} rows={8} placeholder="Contenu de l'article..." />
            </div>
            <div>
              <Label className="mb-1.5 block">Image (URL)</Label>
              <Input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label className="mb-1.5 block">Uploader une image</Label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-muted-foreground" />
                {uploading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {form.image && <div className="relative w-12 h-12 rounded overflow-hidden"><Image src={form.image} alt="preview" fill className="object-cover" /></div>}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">URL Vidéo (YouTube embed)</Label>
              <Input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://www.youtube.com/embed/..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={form.publie} onCheckedChange={v => setForm({ ...form, publie: !!v })} />
              <span className="text-sm font-medium">Publier cet article</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button className="btn-gold text-primary-foreground" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? 'Enregistrer' : 'Publier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Supprimer cet article ?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
