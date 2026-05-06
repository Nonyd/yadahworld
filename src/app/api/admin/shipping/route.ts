import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  rates: z.array(
    z.object({
      id: z.string().min(1),
      rate: z.number().int().min(0),
      isActive: z.boolean(),
    }),
  ),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [rates, settings] = await Promise.all([
    prisma.shippingRate.findMany({ orderBy: { zone: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ])
  return NextResponse.json({
    rates,
    settings: {
      freeShippingThreshold: settings?.freeShippingThreshold ?? null,
      defaultShippingRate: settings?.defaultShippingRate ?? 150000,
    },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 })
  }

  await prisma.$transaction(
    parsed.data.rates.map((row) =>
      prisma.shippingRate.update({
        where: { id: row.id },
        data: { rate: row.rate, isActive: row.isActive },
      }),
    ),
  )

  const rates = await prisma.shippingRate.findMany({ orderBy: { zone: 'asc' } })
  return NextResponse.json({ rates })
}
