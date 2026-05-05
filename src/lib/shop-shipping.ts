/** Flat shipping in kobo; free when subtotal (kobo) is at or above threshold. */

const FLAT_SHIPPING_KOBO = 150_000 // ₦1,500
const FREE_SHIPPING_OVER_KOBO = 5_000_000 // ₦50,000

export function shopShippingFeeKobo(subtotalKobo: number, requiresShipping: boolean): number {
  if (!requiresShipping) return 0
  if (subtotalKobo >= FREE_SHIPPING_OVER_KOBO) return 0
  return FLAT_SHIPPING_KOBO
}
