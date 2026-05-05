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
    const contactMessage = await prisma.contactMessage.findUnique({ where: { id: params.id } })
    if (!contactMessage) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

    const safeName = escapeHtml(contactMessage.name)
    const safeBody = escapeHtml(parsed.data.message).replace(/\n/g, '<br/>')

    await sendMail({
      to: contactMessage.email,
      subject: normalizeEmailHeader(parsed.data.subject),
      html: renderEmailTemplate({
        eyebrow: 'Yadah Contact',
        title: normalizeEmailHeader(parsed.data.subject),
        greeting: `Dear ${safeName},`,
        bodyHtml: `<p style="margin:0; line-height:1.8; color:#334155;">${safeBody}</p>`,
        signedBy: 'Yadah Team',
      }),
    })

    await prisma.contactMessageReply.create({
      data: {
        contactMessageId: contactMessage.id,
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
