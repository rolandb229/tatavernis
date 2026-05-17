import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/produits - Liste des produits avec filtres
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const categorie = searchParams.get('categorie')
  const marque = searchParams.get('marque')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const nouveau = searchParams.get('nouveau')
  const promo = searchParams.get('promo')
  const id = searchParams.get('id')
  const slug = searchParams.get('slug')
  const minPrix = searchParams.get('minPrix')
  const maxPrix = searchParams.get('maxPrix')
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'

  try {
    // Fetch single product by ID or slug
    if (id) {
      const { data: produit, error } = await supabase
        .from('produits')
        .select(`
          *,
          marques (id, nom, slug),
          categories (id, nom, slug),
          avis (id, nom_client, note, commentaire, approuve, created_at)
        `)
        .eq('id', parseInt(id))
        .single()
      
      if (error || !produit) {
        return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
      }

      // Get similar products
      const { data: similaires } = await supabase
        .from('produits')
        .select('*')
        .eq('categorie_id', produit.categorie_id)
        .neq('id', produit.id)
        .limit(4)

      // Filter only approved reviews
      const avisApprouves = produit.avis?.filter((a: { approuve: boolean }) => a.approuve) || []

      return NextResponse.json({
        ...produit,
        marque_nom: produit.marques?.nom,
        categorie_nom: produit.categories?.nom,
        avis: avisApprouves,
        similaires: similaires || []
      })
    }

    if (slug) {
      const { data: produit, error } = await supabase
        .from('produits')
        .select(`
          *,
          marques (id, nom, slug),
          categories (id, nom, slug),
          avis (id, nom_client, note, commentaire, approuve, created_at)
        `)
        .eq('slug', slug)
        .single()
      
      if (error || !produit) {
        return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
      }

      const { data: similaires } = await supabase
        .from('produits')
        .select('*')
        .eq('categorie_id', produit.categorie_id)
        .neq('id', produit.id)
        .limit(4)

      const avisApprouves = produit.avis?.filter((a: { approuve: boolean }) => a.approuve) || []

      return NextResponse.json({
        ...produit,
        marque_nom: produit.marques?.nom,
        categorie_nom: produit.categories?.nom,
        avis: avisApprouves,
        similaires: similaires || []
      })
    }

    // Build query for product list
    let query = supabase
      .from('produits')
      .select(`
        *,
        marques (id, nom, slug),
        categories (id, nom, slug)
      `, { count: 'exact' })

    // Apply filters
    if (categorie) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorie)
        .single()
      if (cat) query = query.eq('categorie_id', cat.id)
    }

    if (marque) {
      const { data: mar } = await supabase
        .from('marques')
        .select('id')
        .eq('slug', marque)
        .single()
      if (mar) query = query.eq('marque_id', mar.id)
    }

    if (search) {
      query = query.or(`nom.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (featured === 'true') query = query.eq('en_vedette', true)
    if (nouveau === 'true') query = query.eq('est_nouveau', true)
    if (promo === 'true') query = query.eq('est_promo', true)
    
    if (minPrix) query = query.gte('prix', parseInt(minPrix))
    if (maxPrix) query = query.lte('prix', parseInt(maxPrix))

    // Sorting
    const validSorts = ['prix', 'nom', 'created_at', 'note_moyenne']
    const sortField = validSorts.includes(sort) ? sort : 'created_at'
    const ascending = order === 'asc'
    query = query.order(sortField, { ascending })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: produits, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    // Transform data
    const transformedProducts = produits?.map(p => ({
      ...p,
      marque_nom: p.marques?.nom,
      categorie_nom: p.categories?.nom,
    })) || []

    return NextResponse.json({
      data: transformedProducts,
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

// POST /api/produits - Créer un produit (admin)
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  try {
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('produits')
      .insert({
        nom: body.nom,
        slug: body.slug || body.nom.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: body.description,
        prix: body.prix,
        prix_promo: body.prix_promo || null,
        image: body.image,
        images_supplementaires: body.images_supplementaires || [],
        marque_id: body.marque_id,
        categorie_id: body.categorie_id,
        stock: body.stock || 0,
        en_vedette: body.en_vedette || false,
        est_nouveau: body.est_nouveau || false,
        est_promo: body.est_promo || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/produits - Mettre à jour un produit (admin)
export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const body = await request.json()
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    // Only update provided fields
    if (body.nom !== undefined) updateData.nom = body.nom
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.description !== undefined) updateData.description = body.description
    if (body.prix !== undefined) updateData.prix = body.prix
    if (body.prix_promo !== undefined) updateData.prix_promo = body.prix_promo
    if (body.image !== undefined) updateData.image = body.image
    if (body.images_supplementaires !== undefined) updateData.images_supplementaires = body.images_supplementaires
    if (body.marque_id !== undefined) updateData.marque_id = body.marque_id
    if (body.categorie_id !== undefined) updateData.categorie_id = body.categorie_id
    if (body.stock !== undefined) updateData.stock = body.stock
    if (body.en_vedette !== undefined) updateData.en_vedette = body.en_vedette
    if (body.est_nouveau !== undefined) updateData.est_nouveau = body.est_nouveau
    if (body.est_promo !== undefined) updateData.est_promo = body.est_promo

    const { data, error } = await supabase
      .from('produits')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/produits - Supprimer un produit (admin)
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('produits')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      console.error('Error deleting product:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
