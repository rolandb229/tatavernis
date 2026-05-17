import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

// GET /api/admin - Admin actions (stats, check session)
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    // Check admin session
    if (action === 'check') {
      const cookieStore = await cookies()
      const adminSession = cookieStore.get('admin_session')
      
      if (!adminSession) {
        return NextResponse.json({ authenticated: false }, { status: 401 })
      }

      try {
        const sessionData = JSON.parse(adminSession.value)
        return NextResponse.json({ 
          authenticated: true, 
          admin: { 
            id: sessionData.id, 
            email: sessionData.email,
            nom: sessionData.nom 
          } 
        })
      } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 })
      }
    }

    // Get dashboard statistics
    if (action === 'stats') {
      // Total products
      const { count: totalProduits } = await supabase
        .from('produits')
        .select('*', { count: 'exact', head: true })

      // Total orders
      const { count: totalCommandes } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })

      // Orders by status
      const { data: commandesParStatut } = await supabase
        .from('commandes')
        .select('statut')

      const parStatut: Record<string, number> = {}
      commandesParStatut?.forEach(c => {
        parStatut[c.statut] = (parStatut[c.statut] || 0) + 1
      })

      // Today's orders
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: commandesAujourdhui } = await supabase
        .from('commandes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Total revenue
      const { data: revenusData } = await supabase
        .from('commandes')
        .select('montant_total, statut')
        .in('statut', ['paye', 'valide', 'en_livraison', 'livre'])

      const totalRevenus = revenusData?.reduce((sum, c) => sum + c.montant_total, 0) || 0

      // Monthly revenue
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const { data: revenusMoisData } = await supabase
        .from('commandes')
        .select('montant_total')
        .in('statut', ['paye', 'valide', 'en_livraison', 'livre'])
        .gte('created_at', firstDayOfMonth.toISOString())

      const revenusMois = revenusMoisData?.reduce((sum, c) => sum + c.montant_total, 0) || 0

      // Popular products (by order frequency)
      const { data: commandeProduits } = await supabase
        .from('commande_produits')
        .select('produit_id, nom_produit, quantite')

      const productSales: Record<number, { nom: string; total: number }> = {}
      commandeProduits?.forEach(cp => {
        if (cp.produit_id) {
          if (!productSales[cp.produit_id]) {
            productSales[cp.produit_id] = { nom: cp.nom_produit || 'Inconnu', total: 0 }
          }
          productSales[cp.produit_id].total += cp.quantite
        }
      })

      const populaires = Object.entries(productSales)
        .map(([id, data]) => ({ id: parseInt(id), nom: data.nom, total_vendu: data.total }))
        .sort((a, b) => b.total_vendu - a.total_vendu)
        .slice(0, 5)

      // Get images for popular products
      const populairesWithImages = await Promise.all(
        populaires.map(async (p) => {
          const { data: produit } = await supabase
            .from('produits')
            .select('image')
            .eq('id', p.id)
            .single()
          return { ...p, image: produit?.image || '/placeholder.jpg' }
        })
      )

      // Recent orders
      const { data: dernieresCommandes } = await supabase
        .from('commandes')
        .select(`
          *,
          commande_produits (id, nom_produit, quantite, prix_unitaire)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      // Pending reviews count
      const { count: avisEnAttente } = await supabase
        .from('avis')
        .select('*', { count: 'exact', head: true })
        .eq('approuve', false)

      return NextResponse.json({
        visiteurs: {
          total_30_jours: Math.floor(Math.random() * 1000) + 500, // Placeholder
          aujourdhui: Math.floor(Math.random() * 100) + 20
        },
        commandes: {
          total: totalCommandes || 0,
          aujourdhui: commandesAujourdhui || 0,
          par_statut: parStatut
        },
        revenus: {
          total: totalRevenus,
          mois: revenusMois
        },
        produits: {
          total: totalProduits || 0,
          populaires: populairesWithImages
        },
        avis_en_attente: avisEnAttente || 0,
        dernieres_commandes: dernieresCommandes || []
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin - Login/Logout
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    // Admin login
    if (action === 'login') {
      const { email, password } = await request.json()

      if (!email || !password) {
        return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
      }

      // Find admin by email
      const { data: admin, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !admin) {
        return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, admin.password_hash)
      if (!validPassword) {
        return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
      }

      // Create session cookie
      const cookieStore = await cookies()
      const sessionData = {
        id: admin.id,
        email: admin.email,
        nom: admin.nom,
        role: admin.role,
        timestamp: Date.now()
      }

      cookieStore.set('admin_session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return NextResponse.json({ 
        success: true, 
        admin: { 
          id: admin.id, 
          email: admin.email, 
          nom: admin.nom 
        } 
      })
    }

    // Admin logout
    if (action === 'logout') {
      const cookieStore = await cookies()
      cookieStore.delete('admin_session')
      return NextResponse.json({ success: true })
    }

    // Create new admin user
    if (action === 'create-admin') {
      const { email, password, nom } = await request.json()

      if (!email || !password) {
        return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)

      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          email,
          password_hash: passwordHash,
          nom: nom || 'Admin',
          role: 'admin'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating admin:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data: { id: data.id, email: data.email } })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
