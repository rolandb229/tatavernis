import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/categories - Liste des catégories
export async function GET() {
  const supabase = await createClient()
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('nom')

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Count products per category
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (cat) => {
        const { count } = await supabase
          .from('produits')
          .select('*', { count: 'exact', head: true })
          .eq('categorie_id', cat.id)
        
        return { ...cat, nb_produits: count || 0 }
      })
    )

    return NextResponse.json(categoriesWithCount)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/categories - Créer une catégorie
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        nom: body.nom,
        slug: body.slug || body.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description,
        image: body.image,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/categories - Mettre à jour une catégorie
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
      .from('categories')
      .update({
        nom: body.nom,
        slug: body.slug,
        description: body.description,
        image: body.image,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/categories - Supprimer une catégorie
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting category:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
