export type BuyAgain = 'yes' | 'maybe' | 'no'

export type Product = {
  id: string
  barcode: string
  name: string
  brand: string
  variant?: string
  category: string
  emoji: string
  imageUrl?: string
  createdAt: string
}

export type Rating = {
  productId: string
  stars: number
  buyAgain: BuyAgain
  price?: number
  currency: string
  note?: string
  updatedAt: string
}

export type CommunityStats = {
  ratingsCount: number
  averageRating: number | null
  buyAgainYesPct: number | null
  averagePrice: number | null
}

export type ScreenName =
  | 'home'
  | 'scan'
  | 'history'
  | 'product'
  | 'rate'
  | 'create'
  | 'profile'
