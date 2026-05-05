import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { renderEmailTemplate, sendMail } from '@/lib/mailer'
import { escapeHtml, normalizeEmailHeader } from '@/lib/security'

const replySchema = z.object({
  subject: z.string().trim().min(2),
  message: z.string().trim().min(2),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = replySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Subject and message are required.' }, { status: 400 })
  }

  try {
    const booking = await prisma.bookingRequest.findUnique({ where: { id: params.id } })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const safeName = escapeHtml(booking.fullName)
    const safeMessage = escapeHtml(parsed.data.message).replace(/\n/g, '<br/>')

    await sendMail({
      to: booking.email,
      subject: normalizeEmailHeader(parsed.data.subject),
      html: renderEmailTemplate({
        eyebrow: 'Yadah Booking',
        title: normalizeEmailHeader(parsed.data.subject),
        greeting: `Dear ${safeName},`,
        bodyHtml: `<p style="margin:0; line-height:1.8; color:#334155;">${safeMessage}</p>`,
        signedBy: 'Yadah Management Team',
      }),
    })

    await prisma.bookingReply.create({
      data: {
        bookingRequestId: booking.id,
        subject: parsed.data.subject,
        message: parsed.data.message,
        sentByEmail: session.user?.email ?? null,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Could not send reply.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
