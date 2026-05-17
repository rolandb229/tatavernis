import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/avis - Liste des avis
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const produitId = searchParams.get('produit_id')
  const admin = searchParams.get('admin') === '1'

  try {
    let query = supabase
      .from('avis')
      .select(`
        *,
        produits (id, nom, image)
      `)
      .order('created_at', { ascending: false })

    if (produitId) {
      query = query.eq('produit_id', parseInt(produitId))
    }

    // Only show approved reviews for non-admin
    if (!admin) {
      query = query.eq('approuve', true)
    }

    const { data: avis, error } = await query

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json(avis || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/avis - Créer un avis
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('avis')
      .insert({
        produit_id: body.produit_id,
        nom_client: body.nom_client,
        email_client: body.email_client || null,
        note: body.note,
        commentaire: body.commentaire || null,
        approuve: false, // Reviews need approval
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/avis - Approuver/modifier un avis
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
      .from('avis')
      .update({
        approuve: body.approuve
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating review:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update product rating
    const { data: avis } = await supabase
      .from('avis')
      .select('note')
      .eq('produit_id', data.produit_id)
      .eq('approuve', true)

    if (avis && avis.length > 0) {
      const avgRating = avis.reduce((sum, a) => sum + a.note, 0) / avis.length
      await supabase
        .from('produits')
        .update({ 
          note_moyenne: Math.round(avgRating * 10) / 10,
          nombre_avis: avis.length
        })
        .eq('id', data.produit_id)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/avis - Supprimer un avis
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    // Get review first to update product rating
    const { data: review } = await supabase
      .from('avis')
      .select('produit_id')
      .eq('id', parseInt(id))
      .single()

    const { error } = await supabase
      .from('avis')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting review:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update product rating
    if (review) {
      const { data: avis } = await supabase
        .from('avis')
        .select('note')
        .eq('produit_id', review.produit_id)
        .eq('approuve', true)

      const avgRating = avis && avis.length > 0
        ? avis.reduce((sum, a) => sum + a.note, 0) / avis.length
        : 0

      await supabase
        .from('produits')
        .update({ 
          note_moyenne: Math.round(avgRating * 10) / 10,
          nombre_avis: avis?.length || 0
        })
        .eq('id', review.produit_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
