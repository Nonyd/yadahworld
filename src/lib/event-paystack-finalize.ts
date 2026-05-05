import type { SiteSettings } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendTicketBundleEmail } from '@/lib/ticket-email'
import { paystackSecret } from '@/lib/shop-payments'

/** Marks pending event registration(s) paid and sends ticket email. Idempotent. */
export async function finalizePaidEventRegistrations(reference: string): Promise<boolean> {
  const byGroup = await prisma.eventRegistration.findMany({
    where: {
      OR: [{ orderGroupId: reference }, { ticketCode: reference }],
      paymentStatus: 'PENDING',
    },
    include: { event: true, tier: true },
    orderBy: { createdAt: 'asc' },
  })

  if (byGroup.length === 0) return false

  const first = byGroup[0]!
  const qty = byGroup.length

  await prisma.$transaction(async (tx) => {
    await tx.eventRegistration.updateMany({
      where: { id: { in: byGroup.map((r) => r.id) } },
      data: {
        paymentStatus: 'PAID',
        paymentRef: reference,
      },
    })
    await tx.ticketTier.update({
      where: { id: first.tierId },
      data: { sold: { increment: qty } },
    })
    const promoRow = first.promoCode
      ? await tx.promoCode.findFirst({
          where: {
            eventId: first.eventId,
            code: { equals: first.promoCode, mode: 'insensitive' },
          },
          select: { id: true },
        })
      : null
    if (promoRow && (first.discountAmount ?? 0) > 0) {
      await tx.promoCode.update({
        where: { id: promoRow.id },
        data: { usedCount: { increment: 1 } },
      })
    }
  })

  const refreshed = await prisma.eventRegistration.findMany({
    where: { id: { in: byGroup.map((r) => r.id) } },
    include: { event: true, tier: true },
  })
  const tier = refreshed[0]?.tier
  const ev = refreshed[0]?.event
  if (tier && ev) {
    await sendTicketBundleEmail({
      registrations: refreshed,
      event: ev,
      tier,
    })
  }

  return true
}

export async function verifyPaystackChargeAndFinalize(
  reference: string,
  settings: SiteSettings | null,
): Promise<{ ok: boolean; message: string }> {
  const secret = paystackSecret(settings)
  if (!secret) {
    return { ok: false, message: 'Payment not configured' }
  }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const json = (await res.json()) as { status?: boolean; data?: { status?: string } }
  if (!json.status || json.data?.status !== 'success') {
    return { ok: false, message: 'Payment not verified' }
  }

  const already = await prisma.eventRegistration.findFirst({
    where: {
      OR: [{ orderGroupId: reference }, { ticketCode: reference }],
      paymentStatus: 'PAID',
    },
    select: { id: true },
  })
  if (already) {
    return { ok: true, message: 'Already confirmed' }
  }

  const done = await finalizePaidEventRegistrations(reference)
  return { ok: done, message: done ? 'Confirmed' : 'Nothing to update' }
}
