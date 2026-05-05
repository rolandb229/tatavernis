'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FileText,
  Tag,
  BookOpen,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Star,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { href: '/admin/commandes', icon: ShoppingBag, label: 'Commandes' },
  { href: '/admin/produits', icon: Package, label: 'Produits' },
  { href: '/admin/marques', icon: Tag, label: 'Marques' },
  { href: '/admin/categories', icon: FileText, label: 'Catégories' },
  { href: '/admin/articles', icon: BookOpen, label: 'Articles' },
  { href: '/admin/avis', icon: Star, label: 'Avis clients' },
  { href: '/admin/parametres', icon: Settings, label: 'Paramètres' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [checking, setChecking] = useState(true)

  // Skip auth check on login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false)
      return
    }
    api.adminCheck()
      .then(res => {
        if (!res?.authenticated) {
          router.push('/admin/login')
        }
        setChecking(false)
      })
      .catch(() => {
        // Si backend inaccessible en dev, on laisse passer
        setChecking(false)
      })
  }, [isLoginPage, router])

  const handleLogout = async () => {
    try { await api.adminLogout() } catch {}
    router.push('/admin/login')
  }

  if (isLoginPage) return <>{children}</>

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-noir/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-noir text-cream flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:flex',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-cream/10 flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nouveau%20logo%20tata%20vernis%20copie-yiLw2DUuF21Ws2mr1cAWUFWHxGOwsn.png"
              alt="Tatavernis Admin"
              width={130}
              height={45}
              className="h-9 w-auto"
            />
          </Link>
          <button className="lg:hidden text-cream/60 hover:text-cream" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map(item => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary/20 text-primary'
                        : 'text-cream/70 hover:text-cream hover:bg-cream/10'
                    )}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                    {active && <ChevronRight className="h-3 w-3 ml-auto" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bas : lien boutique + déconnexion */}
        <div className="p-4 border-t border-cream/10 space-y-2 flex-shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-cream/60 hover:text-cream px-3 py-2 rounded-lg hover:bg-cream/10 transition-colors"
          >
            Voir la boutique
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-cream/60 hover:text-red-400 w-full px-3 py-2 rounded-lg hover:bg-cream/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 bg-background border-b border-border flex items-center gap-4 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-serif font-semibold text-foreground text-lg">
            {navItems.find(i => i.exact ? pathname === i.href : pathname.startsWith(i.href))?.label || 'Administration'}
          </h1>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
