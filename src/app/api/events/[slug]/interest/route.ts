import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderEmailTemplate, sendMail } from '@/lib/mailer'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
    }

    const event = await prisma.event.findFirst({
      where: { slug: params.slug, status: 'COMING_SOON' },
    })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const email = parsed.data.email.trim().toLowerCase()

    await prisma.eventInterest.upsert({
      where: {
        eventId_email: {
          eventId: event.id,
          email,
        },
      },
      create: {
        eventId: event.id,
        email,
        name: parsed.data.name?.trim() || null,
      },
      update: {
        name: parsed.data.name?.trim() || null,
      },
    })

    await sendMail({
      to: email,
      subject: `You're on the list — ${event.title}`,
      html: renderEmailTemplate({
        eyebrow: 'Yadah Events',
        title: "You're on the list",
        previewText: `Interest confirmed for ${escapeHtml(event.title)}`,
        intro: `Thank you${parsed.data.name ? `, ${escapeHtml(parsed.data.name.trim().split(/\s+/)[0] ?? '')}` : ''}. We have noted your interest in <strong>${escapeHtml(event.title)}</strong>.`,
        bodyHtml:
          '<p style="margin:0 0 12px; line-height:1.7; color:#334155;">We will notify you as soon as registration opens.</p>',
        signedBy: 'Yadah Events Team',
      }),
    })

    return NextResponse.json({
      success: true,
      message: "You're on the list. We'll notify you when registration opens.",
    })
  } catch (err) {
    console.error('Interest error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
