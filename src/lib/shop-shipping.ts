import { prisma } from '@/lib/prisma'

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const

export type ShippingRateResult = {
  rate: number
  label: string
  isFree: boolean
}

export const FALLBACK_SHIPPING_KOBO = 150_000

export function defaultEstimatedShippingKobo(requiresShipping: boolean): number {
  return requiresShipping ? FALLBACK_SHIPPING_KOBO : 0
}

export async function resolveShippingRate(params: {
  state?: string | null
  country?: string | null
  subtotal: number
  requiresShipping: boolean
}): Promise<ShippingRateResult> {
  if (!params.requiresShipping) {
    return { rate: 0, label: 'Digital delivery', isFree: true }
  }

  const subtotal = Number.isFinite(params.subtotal) ? Math.max(0, Math.floor(params.subtotal)) : 0
  const country = (params.country ?? 'Nigeria').trim()
  const state = (params.state ?? '').trim()

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  const fallbackRate = settings?.defaultShippingRate ?? FALLBACK_SHIPPING_KOBO
  const threshold = settings?.freeShippingThreshold ?? null

  if (threshold !== null && subtotal >= threshold) {
    return { rate: 0, label: 'Free shipping', isFree: true }
  }

  const zone = country.toLowerCase() === 'nigeria' ? state || 'Default' : 'International'
  const label = country.toLowerCase() === 'nigeria' ? (state || 'Nigeria') : 'International'

  const matched = await prisma.shippingRate.findFirst({
    where: {
      zone,
      isActive: true,
    },
  })

  if (matched) {
    return {
      rate: matched.rate,
      label: matched.label,
      isFree: matched.rate <= 0,
    }
  }

  return {
    rate: fallbackRate,
    label,
    isFree: fallbackRate <= 0,
  }
}
