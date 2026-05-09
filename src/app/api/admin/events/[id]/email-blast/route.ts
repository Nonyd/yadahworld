import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderEmailTemplate, sendMail } from '@/lib/mailer'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { subject?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message required' }, { status: 400 })
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        where: {
          paymentStatus: { in: ['PAID', 'FREE'] },
        },
      },
    },
  })

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  let sent = 0
  const errors: string[] = []

  for (const reg of event.registrations) {
    try {
      await sendMail({
        to: reg.email,
        subject: `${subject} — ${event.title}`,
        html: renderEmailTemplate({
          eyebrow: 'Yadah Events',
          title: event.title,
          previewText: subject,
          intro: 'An update has been shared with you about this event.',
          bodyHtml: `<div style="margin: 16px 0; line-height: 1.8; color: #0f172a;">${message}</div>`,
          action: { label: 'View Your Ticket', href: `${siteBase()}/tickets/${reg.ticketCode}` },
          signedBy: 'Yadah Events Team',
        }),
      })
      sent++
    } catch {
      errors.push(reg.email)
    }
  }

  await logAdminApiActivity(session, {
    method: 'POST',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return NextResponse.json({
    success: true,
    sent,
    failed: errors.length,
    message: `Sent to ${sent} registrants.`,
  })
}
