import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/articles - Liste des articles
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const admin = searchParams.get('admin') === '1'
  const id = searchParams.get('id')
  const slug = searchParams.get('slug')

  try {
    // Get single article by ID
    if (id) {
      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', parseInt(id))
        .single()

      if (error || !article) {
        return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
      }

      return NextResponse.json(article)
    }

    // Get single article by slug
    if (slug) {
      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !article) {
        return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
      }

      return NextResponse.json(article)
    }

    // List all articles
    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    // Only show published articles for non-admin
    if (!admin) {
      query = query.eq('publie', true)
    }

    const { data: articles, error } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    return NextResponse.json(articles || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/articles - Créer un article
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('articles')
      .insert({
        titre: body.titre,
        slug: body.slug || body.titre.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        contenu: body.contenu,
        extrait: body.extrait || null,
        image: body.image || null,
        video_url: body.video_url || null,
        publie: body.publie || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating article:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/articles - Mettre à jour un article
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
      .from('articles')
      .update({
        titre: body.titre,
        slug: body.slug,
        contenu: body.contenu,
        extrait: body.extrait,
        image: body.image,
        video_url: body.video_url,
        publie: body.publie,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating article:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/articles - Supprimer un article
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting article:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
