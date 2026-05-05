import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { renderEmailCard, renderEmailTemplate, sendMail } from '@/lib/mailer'
import { escapeHtml } from '@/lib/security'

const patchSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'CONFIRMED', 'DECLINED']).optional(),
  adminNotes: z.string().optional(),
  declineReason: z.string().optional(),
  confirmationNote: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const nextStatus = parsed.data.status
  const nextDeclineReason = parsed.data.declineReason?.trim()
  const nextConfirmationNote = parsed.data.confirmationNote?.trim()
  if (nextStatus === 'DECLINED' && !nextDeclineReason) {
    return NextResponse.json({ error: 'Decline reason is required for declined bookings.' }, { status: 400 })
  }

  try {
    const booking = await prisma.bookingRequest.findUnique({
      where: { id: params.id },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const updated = await prisma.bookingRequest.update({
      where: { id: params.id },
      data: {
        ...(nextStatus && { status: nextStatus }),
        ...(parsed.data.adminNotes !== undefined && { adminNotes: parsed.data.adminNotes }),
        ...(parsed.data.declineReason !== undefined && { declineReason: nextDeclineReason || null }),
        ...(parsed.data.confirmationNote !== undefined && { confirmationNote: nextConfirmationNote || null }),
      },
    })

    const statusChanged = Boolean(nextStatus && nextStatus !== booking.status)
    if (statusChanged && (nextStatus === 'REVIEWING' || nextStatus === 'CONFIRMED' || nextStatus === 'DECLINED')) {
      const safeName = escapeHtml(updated.fullName)
      const safeEvent = escapeHtml(updated.eventName)
      const safeReason = escapeHtml(updated.declineReason?.trim() || '')
      const safeConfirmationNote = escapeHtml(updated.confirmationNote?.trim() || '').replace(/\n/g, '<br/>')

      const config: Record<'REVIEWING' | 'CONFIRMED' | 'DECLINED', { subject: string; intro: string; bodyHtml?: string }> = {
        REVIEWING: {
          subject: `Booking review in progress — ${updated.eventName}`,
          intro:
            'Your booking request has been received. Expect a call soonest from a representative for follow-up and final confirmation.',
        },
        CONFIRMED: {
          subject: `Booking confirmed — ${updated.eventName}`,
          intro: `Your booking request for <strong>${safeEvent}</strong> has been confirmed.`,
          bodyHtml: safeConfirmationNote
            ? renderEmailCard('Additional Note', `<p style="margin:0; line-height:1.8;">${safeConfirmationNote}</p>`)
            : undefined,
        },
        DECLINED: {
          subject: `Booking update — ${updated.eventName}`,
          intro: `Thank you for your request for <strong>${safeEvent}</strong>. At this time, we are unable to proceed with the booking.`,
          bodyHtml: renderEmailCard('Reason', `<p style="margin:0; line-height:1.8;">${safeReason}</p>`),
        },
      }

      const email = config[nextStatus]
      await sendMail({
        to: updated.email,
        subject: email.subject,
        html: renderEmailTemplate({
          eyebrow: 'Yadah Booking',
          title: `Booking Status: ${nextStatus}`,
          greeting: `Dear ${safeName},`,
          intro: email.intro,
          bodyHtml: email.bodyHtml,
          signedBy: 'Yadah Management Team',
        }),
      })

      await prisma.bookingRequest.update({
        where: { id: params.id },
        data: { lastStatusEmailSentAt: new Date() },
      })
    }
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.bookingRequest.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
