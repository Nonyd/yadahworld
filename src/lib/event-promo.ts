import type { DiscountType, PromoCode } from '@prisma/client'

export type PromoValidation =
  | { ok: true; promo: PromoCode; discountAmount: number; message?: string }
  | { ok: false; error: string }

export function computePromoDiscount(
  subtotalKobo: number,
  discountType: DiscountType,
  discountValue: number,
): number {
  if (subtotalKobo <= 0) return 0
  if (discountType === 'PERCENTAGE') {
    const pct = Math.min(100, Math.max(0, discountValue))
    return Math.floor((subtotalKobo * pct) / 100)
  }
  return Math.min(subtotalKobo, Math.max(0, discountValue))
}

export function validatePromoForCheckout(promo: PromoCode | null, subtotalKobo: number): PromoValidation {
  if (!promo) {
    return { ok: false, error: 'Invalid promo code' }
  }
  if (!promo.isActive) {
    return { ok: false, error: 'This promo code is no longer active' }
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { ok: false, error: 'This promo code has expired' }
  }
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return { ok: false, error: 'This promo code has reached its usage limit' }
  }
  const discountAmount = computePromoDiscount(subtotalKobo, promo.discountType, promo.discountValue)
  if (discountAmount <= 0) {
    return { ok: false, error: 'This promo code does not apply to this order' }
  }
  return { ok: true, promo, discountAmount }
}
