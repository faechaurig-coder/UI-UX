import { ensureAnonymousSession, supabase } from './supabase'
import { BuyAgain, CommunityStats, Product, Rating } from './types'

function assertCloud() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

export const cloudRepository = {
  async connect() {
    return ensureAnonymousSession()
  },

  async lookupBarcode(barcode: string): Promise<Product | null> {
    const db = assertCloud()
    await ensureAnonymousSession()
    const { data, error } = await db
      .from('products')
      .select('id,barcode,name,brand,variant,created_at,categories(name_es)')
      .eq('barcode', barcode)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    const categoryRelation = data.categories as unknown as { name_es?: string } | null

    return {
      id: data.id as string,
      barcode: data.barcode as string,
      name: data.name as string,
      brand: (data.brand as string | null) ?? '',
      variant: (data.variant as string | null) ?? undefined,
      category: categoryRelation?.name_es ?? 'Otros',
      emoji: '📦',
      createdAt: data.created_at as string,
    }
  },

  async myRating(productId: string): Promise<Rating | null> {
    const db = assertCloud()
    await ensureAnonymousSession()
    const { data, error } = await db
      .from('ratings')
      .select('product_id,stars,buy_again,price,currency,note,updated_at')
      .eq('product_id', productId)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return {
      productId: data.product_id as string,
      stars: data.stars as number,
      buyAgain: data.buy_again as BuyAgain,
      price: data.price == null ? undefined : Number(data.price),
      currency: (data.currency as string | null) ?? 'MXN',
      note: (data.note as string | null) ?? undefined,
      updatedAt: data.updated_at as string,
    }
  },

  async saveRating(rating: Rating) {
    const db = assertCloud()
    const session = await ensureAnonymousSession()
    if (!session?.user.id) throw new Error('No authenticated user')

    const { error } = await db.from('ratings').upsert(
      {
        user_id: session.user.id,
        product_id: rating.productId,
        stars: rating.stars,
        buy_again: rating.buyAgain,
        price: rating.price ?? null,
        currency: rating.currency,
        note: rating.note ?? null,
        updated_at: rating.updatedAt,
      },
      { onConflict: 'user_id,product_id' },
    )

    if (error) throw error
  },

  async publicStats(productId: string): Promise<CommunityStats> {
    const db = assertCloud()
    await ensureAnonymousSession()
    const { data, error } = await db.rpc('product_public_stats', {
      target_product: productId,
    })
    if (error) throw error

    const row = Array.isArray(data) ? data[0] : data
    return {
      ratingsCount: Number(row?.ratings_count ?? 0),
      averageRating: row?.average_rating == null ? null : Number(row.average_rating),
      buyAgainYesPct: row?.buy_again_yes_pct == null ? null : Number(row.buy_again_yes_pct),
      averagePrice: row?.average_price == null ? null : Number(row.average_price),
    }
  },
}
