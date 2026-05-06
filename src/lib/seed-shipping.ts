import { prisma } from '@/lib/prisma'

const DEFAULT_RATES = [
  { zone: 'Abia', label: 'Abia', rate: 250000 },
  { zone: 'Adamawa', label: 'Adamawa', rate: 350000 },
  { zone: 'Akwa Ibom', label: 'Akwa Ibom', rate: 280000 },
  { zone: 'Anambra', label: 'Anambra', rate: 250000 },
  { zone: 'Bauchi', label: 'Bauchi', rate: 350000 },
  { zone: 'Bayelsa', label: 'Bayelsa', rate: 300000 },
  { zone: 'Benue', label: 'Benue', rate: 300000 },
  { zone: 'Borno', label: 'Borno', rate: 400000 },
  { zone: 'Cross River', label: 'Cross River', rate: 300000 },
  { zone: 'Delta', label: 'Delta', rate: 280000 },
  { zone: 'Ebonyi', label: 'Ebonyi', rate: 280000 },
  { zone: 'Edo', label: 'Edo', rate: 280000 },
  { zone: 'Ekiti', label: 'Ekiti', rate: 250000 },
  { zone: 'Enugu', label: 'Enugu', rate: 250000 },
  { zone: 'FCT', label: 'FCT (Abuja)', rate: 150000 },
  { zone: 'Gombe', label: 'Gombe', rate: 350000 },
  { zone: 'Imo', label: 'Imo', rate: 250000 },
  { zone: 'Jigawa', label: 'Jigawa', rate: 380000 },
  { zone: 'Kaduna', label: 'Kaduna', rate: 300000 },
  { zone: 'Kano', label: 'Kano', rate: 300000 },
  { zone: 'Katsina', label: 'Katsina', rate: 350000 },
  { zone: 'Kebbi', label: 'Kebbi', rate: 380000 },
  { zone: 'Kogi', label: 'Kogi', rate: 280000 },
  { zone: 'Kwara', label: 'Kwara', rate: 250000 },
  { zone: 'Lagos', label: 'Lagos', rate: 200000 },
  { zone: 'Nasarawa', label: 'Nasarawa', rate: 200000 },
  { zone: 'Niger', label: 'Niger', rate: 250000 },
  { zone: 'Ogun', label: 'Ogun', rate: 200000 },
  { zone: 'Ondo', label: 'Ondo', rate: 250000 },
  { zone: 'Osun', label: 'Osun', rate: 250000 },
  { zone: 'Oyo', label: 'Oyo', rate: 250000 },
  { zone: 'Plateau', label: 'Plateau', rate: 300000 },
  { zone: 'Rivers', label: 'Rivers', rate: 300000 },
  { zone: 'Sokoto', label: 'Sokoto', rate: 400000 },
  { zone: 'Taraba', label: 'Taraba', rate: 380000 },
  { zone: 'Yobe', label: 'Yobe', rate: 380000 },
  { zone: 'Zamfara', label: 'Zamfara', rate: 400000 },
  { zone: 'International', label: 'International', rate: 2500000 },
] as const

export async function seedShippingRates() {
  const existing = await prisma.shippingRate.count()
  if (existing > 0) return { seeded: false, count: existing }

  await prisma.shippingRate.createMany({
    data: DEFAULT_RATES.map((r) => ({ ...r, isActive: true })),
    skipDuplicates: true,
  })

  return { seeded: true, count: DEFAULT_RATES.length }
}
