import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPaystackChargeAndFinalize } from '@/lib/event-paystack-finalize'

/** Server-side Paystack verify (e.g. return from hosted checkout). */
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const reference =
    req.nextUrl.searchParams.get('reference')?.trim() ||
    req.nextUrl.searchParams.get('trxref')?.trim() ||
    ''
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  const event = await prisma.event.findFirst({
    where: { slug: params.slug, status: 'PUBLISHED' },
    select: { id: true },
  })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null)
  const result = await verifyPaystackChargeAndFinalize(reference, settings)

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, message: result.message })
}
