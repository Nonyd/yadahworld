import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { renderEmailTemplate, sendMail } from '@/lib/mailer'

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      interests: { where: { notified: false } },
    },
  })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  let sent = 0
  for (const interest of event.interests) {
    try {
      await sendMail({
        to: interest.email,
        subject: `Registration is now open — ${event.title}`,
        html: renderEmailTemplate({
          eyebrow: 'Yadah Events',
          title: 'Registration Is Now Open',
          previewText: `${escapeHtml(event.title)} is now open for registration`,
          intro: `${interest.name?.trim() ? `Hi ${escapeHtml(interest.name.trim().split(/\s+/)[0] ?? '')}, ` : ''}registration for <strong>${escapeHtml(event.title)}</strong> is now open. Secure your spot today.`,
          action: { label: 'Register Now', href: `${siteBase()}/events/${event.slug}` },
          signedBy: 'Yadah Events Team',
        }),
      })

      await prisma.eventInterest.update({
        where: { id: interest.id },
        data: { notified: true },
      })
      sent++
    } catch (err) {
      console.error(`Failed to notify ${interest.email}:`, err)
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    message: `Notified ${sent} interested subscribers.`,
  })
}
