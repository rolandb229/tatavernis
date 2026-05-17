import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/marques - Liste des marques
export async function GET() {
  const supabase = await createClient()
  
  try {
    const { data: marques, error } = await supabase
      .from('marques')
      .select('*')
      .order('nom')

    if (error) {
      console.error('Error fetching brands:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Count products per brand
    const marquesWithCount = await Promise.all(
      (marques || []).map(async (mar) => {
        const { count } = await supabase
          .from('produits')
          .select('*', { count: 'exact', head: true })
          .eq('marque_id', mar.id)
        
        return { ...mar, nb_produits: count || 0 }
      })
    )

    return NextResponse.json(marquesWithCount)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/marques - Créer une marque
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('marques')
      .insert({
        nom: body.nom,
        slug: body.slug || body.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description,
        logo: body.logo,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating brand:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/marques - Mettre à jour une marque
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
      .from('marques')
      .update({
        nom: body.nom,
        slug: body.slug,
        description: body.description,
        logo: body.logo,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating brand:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/marques - Supprimer une marque
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('marques')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting brand:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
