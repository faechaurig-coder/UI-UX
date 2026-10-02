import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommunityStats, Product, Rating } from './types'

const PRODUCT_KEY = '@yaprobe/products/v1'
const RATING_KEY = '@yaprobe/ratings/v1'

const now = new Date().toISOString()

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 'wine-demo',
    barcode: '7501234567890',
    name: 'Cabernet Reserva',
    brand: 'Viña del Valle',
    variant: '750 ml',
    category: 'Vinos',
    emoji: '🍷',
    createdAt: now,
  },
  {
    id: 'coffee-demo',
    barcode: '7501234567891',
    name: 'Colombia Intenso',
    brand: 'Café Norte',
    variant: '340 g',
    category: 'Café',
    emoji: '☕',
    createdAt: now,
  },
  {
    id: 'chocolate-demo',
    barcode: '7501234567892',
    name: 'Chocolate 70%',
    brand: 'Montaña',
    variant: '90 g',
    category: 'Alimentos',
    emoji: '🍫',
    createdAt: now,
  },
]

const DEMO_RATINGS: Rating[] = [
  {
    productId: 'wine-demo',
    stars: 2,
    buyAgain: 'no',
    price: 149,
    currency: 'MXN',
    note: 'Muy dulce para mí. Por ese precio prefiero otra opción.',
    updatedAt: '2026-05-28T18:00:00.000Z',
  },
  {
    productId: 'coffee-demo',
    stars: 5,
    buyAgain: 'yes',
    price: 189,
    currency: 'MXN',
    note: 'Intenso, poco dulce y con buen aroma.',
    updatedAt: '2026-09-19T18:00:00.000Z',
  },
  {
    productId: 'chocolate-demo',
    stars: 4,
    buyAgain: 'yes',
    price: 72,
    currency: 'MXN',
    updatedAt: '2026-09-16T18:00:00.000Z',
  },
]

const DEMO_STATS: Record<string, CommunityStats> = {
  'wine-demo': { ratingsCount: 1842, averageRating: 4.3, buyAgainYesPct: 78, averagePrice: 171 },
  'coffee-demo': { ratingsCount: 928, averageRating: 4.6, buyAgainYesPct: 86, averagePrice: 194 },
  'chocolate-demo': { ratingsCount: 541, averageRating: 4.1, buyAgainYesPct: 72, averagePrice: 76 },
}

async function readArray<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function bootstrapLocalStore() {
  const existingProducts = await readArray<Product>(PRODUCT_KEY)
  if (existingProducts.length === 0) {
    await AsyncStorage.setItem(PRODUCT_KEY, JSON.stringify(DEMO_PRODUCTS))
  }
  const existingRatings = await readArray<Rating>(RATING_KEY)
  if (existingRatings.length === 0) {
    await AsyncStorage.setItem(RATING_KEY, JSON.stringify(DEMO_RATINGS))
  }
}

export const localStore = {
  async products() {
    return readArray<Product>(PRODUCT_KEY)
  },

  async ratings() {
    return readArray<Rating>(RATING_KEY)
  },

  async lookupBarcode(barcode: string) {
    const products = await readArray<Product>(PRODUCT_KEY)
    return products.find((p) => p.barcode === barcode) ?? null
  },

  async search(query: string) {
    const q = query.trim().toLowerCase()
    const products = await readArray<Product>(PRODUCT_KEY)
    if (!q) return products
    return products.filter((p) =>
      [p.name, p.brand, p.variant ?? '', p.category, p.barcode].some((value) =>
        value.toLowerCase().includes(q),
      ),
    )
  },

  async rating(productId: string) {
    const ratings = await readArray<Rating>(RATING_KEY)
    return ratings.find((r) => r.productId === productId) ?? null
  },

  async saveRating(rating: Rating) {
    const ratings = await readArray<Rating>(RATING_KEY)
    const next = ratings.filter((r) => r.productId !== rating.productId)
    next.unshift(rating)
    await AsyncStorage.setItem(RATING_KEY, JSON.stringify(next))
    return rating
  },

  async createProduct(input: Omit<Product, 'id' | 'createdAt'>) {
    const products = await readArray<Product>(PRODUCT_KEY)
    const duplicate = products.find((p) => p.barcode === input.barcode)
    if (duplicate) return duplicate
    const product: Product = {
      ...input,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    await AsyncStorage.setItem(PRODUCT_KEY, JSON.stringify([product, ...products]))
    return product
  },

  communityStats(productId: string): CommunityStats {
    return DEMO_STATS[productId] ?? {
      ratingsCount: 0,
      averageRating: null,
      buyAgainYesPct: null,
      averagePrice: null,
    }
  },
}
