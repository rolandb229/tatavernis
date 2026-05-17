import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Generate unique order code
function generateOrderCode(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TV${year}${month}${random}`
}

// GET /api/commandes - Liste des commandes
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const statut = searchParams.get('statut')
  const id = searchParams.get('id')
  const code = searchParams.get('code')
  const action = searchParams.get('action')

  try {
    // Verify order by code (for customers)
    if (action === 'verify' && code) {
      const { data: commande, error } = await supabase
        .from('commandes')
        .select(`
          *,
          commande_produits (
            id, produit_id, nom_produit, image_produit, quantite, prix_unitaire
          )
        `)
        .eq('code_secret', code)
        .single()

      if (error || !commande) {
        return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
      }

      return NextResponse.json(commande)
    }

    // Get single order by ID (admin)
    if (id) {
      const { data: commande, error } = await supabase
        .from('commandes')
        .select(`
          *,
          commande_produits (
            id, produit_id, nom_produit, image_produit, quantite, prix_unitaire
          )
        `)
        .eq('id', parseInt(id))
        .single()

      if (error || !commande) {
        return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
      }

      return NextResponse.json(commande)
    }

    // List all orders (admin)
    let query = supabase
      .from('commandes')
      .select(`
        *,
        commande_produits (
          id, produit_id, nom_produit, image_produit, quantite, prix_unitaire
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (statut) {
      query = query.eq('statut', statut)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: commandes, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json({
      data: commandes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/commandes - Créer une commande
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const body = await request.json()

    // Update order status
    if (action === 'update-status') {
      const { id, statut } = body
      
      const { data, error } = await supabase
        .from('commandes')
        .update({ 
          statut,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating order status:', error)
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data })
    }

    // Create new order
    const codeSecret = generateOrderCode()

    const { data: commande, error: orderError } = await supabase
      .from('commandes')
      .insert({
        code_secret: codeSecret,
        nom_complet: body.nom_complet,
        telephone: body.telephone,
        email: body.email || null,
        adresse: body.adresse || null,
        adresse_livraison: body.adresse_livraison || null,
        notes: body.notes || null,
        montant_total: body.montant_total,
        statut: body.statut || 'en_attente',
        mode_reception: body.mode_reception || 'retrait',
        transaction_id: body.transaction_id || null,
        reference_paiement: body.reference_paiement || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: orderError.message }, { status: 400 })
    }

    // Add order items
    if (body.produits && body.produits.length > 0) {
      const orderItems = body.produits.map((item: {
        produit_id: number;
        nom: string;
        image?: string;
        quantite: number;
        prix_unitaire: number;
      }) => ({
        commande_id: commande.id,
        produit_id: item.produit_id,
        nom_produit: item.nom,
        image_produit: item.image || null,
        quantite: item.quantite,
        prix_unitaire: item.prix_unitaire,
      }))

      const { error: itemsError } = await supabase
        .from('commande_produits')
        .insert(orderItems)

      if (itemsError) {
        console.error('Error adding order items:', itemsError)
        // Continue anyway, order was created
      }

      // Update stock for each product
      for (const item of body.produits) {
        await supabase.rpc('decrement_stock', {
          product_id: item.produit_id,
          qty: item.quantite
        }).catch(() => {
          // If RPC doesn't exist, do manual update
          supabase
            .from('produits')
            .update({ stock: supabase.rpc('greatest', { a: 0, b: 'stock - ' + item.quantite }) })
            .eq('id', item.produit_id)
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: commande,
      code_secret: codeSecret
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/commandes - Mettre à jour une commande
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('commandes')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating order:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/commandes - Supprimer une commande
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('commandes')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting order:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
