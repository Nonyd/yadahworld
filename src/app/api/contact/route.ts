import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { renderEmailCard, renderEmailTemplate, sendMail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { getNotifyEmail } from '@/lib/site-settings'
import { checkRateLimit, escapeHtml, getClientIp, normalizeEmailHeader } from '@/lib/security'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const throttle = checkRateLimit({
    key: `api:contact:${ip}`,
    max: 5,
    windowMs: 10 * 60 * 1000,
  })
  if (!throttle.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const { name, email, subject, message } = parsed.data
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeSubject = escapeHtml(subject)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')

  try {
    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    })
  } catch (e) {
    console.error('Contact DB error:', e)
    return NextResponse.json({ error: 'Could not save message.' }, { status: 500 })
  }

  const notifyEmail = await getNotifyEmail()

  try {
    await sendMail({
      to: notifyEmail,
      subject: `Contact: ${subject}`,
      replyTo: `"${normalizeEmailHeader(name)}" <${normalizeEmailHeader(email)}>`,
      html: renderEmailTemplate({
        eyebrow: 'Yadah Contact',
        title: 'New Contact Message',
        previewText: `New contact message from ${safeName}`,
        intro: 'A new message was submitted from the public contact form.',
        bodyHtml: `${renderEmailCard(
          'Sender Details',
          `<p style="margin:0 0 6px;"><strong>Name:</strong> ${safeName}</p>
           <p style="margin:0 0 6px;"><strong>Email:</strong> <a href="mailto:${safeEmail}" style="color:#6d28d9;">${safeEmail}</a></p>
           <p style="margin:0;"><strong>Subject:</strong> ${safeSubject}</p>`,
        )}
        ${renderEmailCard('Message', `<p style="margin:0; line-height:1.8;">${safeMessage}</p>`)}`,
        closing: 'Please review and respond as needed.',
        signedBy: 'Yadah Website',
      }),
    })
  } catch (e) {
    console.error('Brevo / mailer contact error:', e)
  }

  return NextResponse.json({ success: true })
}
