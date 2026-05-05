'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.adminLogin(form.email, form.password)
      if (res.success) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(res.error || 'Identifiants incorrects')
      }
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez que XAMPP est actif.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nouveau%20logo%20tata%20vernis%20copie-yiLw2DUuF21Ws2mr1cAWUFWHxGOwsn.png"
            alt="Tatavernis"
            width={200}
            height={70}
            className="h-16 w-auto mx-auto mb-4"
          />
          <p className="text-cream/60 text-sm">Administration</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-border rounded-2xl p-8 shadow-xl space-y-5">
          <h1 className="text-xl font-serif font-bold text-foreground text-center mb-2">
            Connexion Admin
          </h1>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-foreground mb-1.5 block">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@tatavernis.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="pl-10 bg-background"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground mb-1.5 block">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="pl-10 pr-10 bg-background"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full btn-gold text-primary-foreground" disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Connexion...</>
            ) : 'Se connecter'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Accès réservé aux administrateurs de Tatavernis
          </p>
        </form>
      </div>
    </div>
  )
}
