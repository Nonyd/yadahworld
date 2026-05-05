export type CartItem = {
  productId: string
  variantId?: string
  name: string
  variantLabel?: string
  price: number
  image: string
  quantity: number
  /** When true, checkout collects a shipping address. Omit defaults to true. */
  requiresShipping?: boolean
}

export const SHOP_CART_STORAGE_KEY = 'yadah_shop_cart_v1'

export function cartLineKey(productId: string, variantId?: string | null) {
  return `${productId}::${variantId ?? ''}`
}
