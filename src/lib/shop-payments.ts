import type { SiteSettings } from '@prisma/client'

export function paystackSecret(settings: SiteSettings | null): string | null {
  return settings?.paystackSecretKey?.trim() || process.env.PAYSTACK_SECRET_KEY?.trim() || null
}

export function paystackPublic(settings: SiteSettings | null): string | null {
  return settings?.paystackPublicKey?.trim() || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.trim() || null
}

export function flutterwaveSecret(settings: SiteSettings | null): string | null {
  return settings?.flutterwaveSecretKey?.trim() || process.env.FLUTTERWAVE_SECRET_KEY?.trim() || null
}

export function flutterwavePublic(settings: SiteSettings | null): string | null {
  return settings?.flutterwavePublicKey?.trim() || process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY?.trim() || null
}

export function payazaSecret(): string | null {
  return process.env.PAYAZA_SECRET_KEY?.trim() || null
}

export function payazaPublic(): string | null {
  return process.env.PAYAZA_PUBLIC_KEY?.trim() || null
}
