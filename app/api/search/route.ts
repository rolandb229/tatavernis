import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/search - Recherche globale
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const q = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '10')

  if (!q || q.length < 2) {
    return NextResponse.json({ produits: [], categories: [], marques: [] })
  }

  try {
    // Search products
    const { data: produits } = await supabase
      .from('produits')
      .select(`
        id, nom, slug, prix, prix_promo, image, en_vedette, est_promo,
        marques (nom),
        categories (nom)
      `)
      .or(`nom.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(limit)

    // Search categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, nom, slug')
      .ilike('nom', `%${q}%`)
      .limit(5)

    // Search brands
    const { data: marques } = await supabase
      .from('marques')
      .select('id, nom, slug')
      .ilike('nom', `%${q}%`)
      .limit(5)

    // Transform products
    const transformedProducts = produits?.map(p => ({
      ...p,
      marque_nom: p.marques?.nom,
      categorie_nom: p.categories?.nom,
    })) || []

    return NextResponse.json({
      produits: transformedProducts,
      categories: categories || [],
      marques: marques || []
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
