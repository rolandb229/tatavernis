'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingBag, TrendingUp, Package, Clock, CheckCircle2,
  Truck, XCircle, ArrowRight, Loader2, AlertCircle
} from 'lucide-react'
import { api, formatPrice, STATUT_LABELS, STATUT_COLORS } from '@/lib/api'
import type { Stats } from '@/lib/types'

// Données par défaut pendant le chargement
const DEFAULT_STATS: Stats = {
  visiteurs: { total_30_jours: 0, aujourdhui: 0 },
  commandes: {
    total: 0,
    aujourdhui: 0,
    par_statut: {},
  },
  revenus: { total: 0, mois: 0 },
  produits: {
    total: 0,
    populaires: [],
  },
  dernieres_commandes: [],
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.getStats()
      .then(data => {
        if (data) setStats(data)
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const kpis = [
    {
      label: 'Commandes totales',
      value: stats.commandes.total,
      sub: `+${stats.commandes.aujourdhui} aujourd'hui`,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Revenus ce mois',
      value: formatPrice(stats.revenus.mois),
      sub: `Total : ${formatPrice(stats.revenus.total)}`,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Produits en catalogue',
      value: stats.produits.total,
      sub: 'Produits actifs',
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Commandes en attente',
      value: (stats.commandes.par_statut?.en_attente ?? 0) + (stats.commandes.par_statut?.paye ?? 0),
      sub: 'À traiter',
      icon: Clock,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  const statutsIcons: Record<string, typeof CheckCircle2> = {
    en_attente: Clock,
    paye: CheckCircle2,
    valide: CheckCircle2,
    en_livraison: Truck,
    livre: CheckCircle2,
    annule: XCircle,
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Erreur de chargement</span> — Impossible de charger les statistiques.
            Vérifiez votre connexion et réessayez.
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(kpi => (
              <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dernières commandes */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h2 className="font-serif font-bold text-foreground">Dernières commandes</h2>
                <Link href="/admin/commandes" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="divide-y divide-border">
                {stats.dernieres_commandes.map(cmd => {
                  const StatutIcon = statutsIcons[cmd.statut] || Clock
                  return (
                    <div key={cmd.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-sm">
                            #{cmd.id} — {cmd.nom_complet || `Client #${cmd.client_id}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{cmd.code_secret}</code>
                          <span className="text-xs text-muted-foreground">
                            {new Date(cmd.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-foreground text-sm">{formatPrice(cmd.montant_total)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_COLORS[cmd.statut]}`}>
                          {STATUT_LABELS[cmd.statut]}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Produits populaires + statuts */}
            <div className="space-y-6">
              {/* Produits populaires */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="font-serif font-bold text-foreground">Top produits</h2>
                </div>
                <div className="divide-y divide-border">
                  {stats.produits.populaires.map((p, i) => (
                    <div key={p.nom} className="flex items-center gap-3 px-5 py-3">
                      <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                      <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                        <Image src={p.image} alt={p.nom} fill className="object-cover" />
                      </div>
                      <p className="text-sm text-foreground flex-1 truncate">{p.nom}</p>
                      <p className="text-xs text-muted-foreground flex-shrink-0">{p.total_vendu} ventes</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statuts commandes */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-serif font-bold text-foreground mb-4">Statuts</h2>
                <div className="space-y-2">
                  {Object.entries(stats.commandes.par_statut).map(([statut, count]) => (
                    <div key={statut} className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_COLORS[statut]}`}>
                        {STATUT_LABELS[statut]}
                      </span>
                      <span className="text-sm font-bold text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
