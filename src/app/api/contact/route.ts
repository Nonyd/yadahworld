import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendMail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
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

  try {
    await prisma.contactMessage.create({
      data: { name, email, subject, message },
    })
  } catch (e) {
    console.error('Contact DB error:', e)
    return NextResponse.json({ error: 'Could not save message.' }, { status: 500 })
  }

  const notifyEmail = process.env.BREVO_NOTIFY_EMAIL ?? 'yadahsings@gmail.com'

  try {
    await sendMail({
      to: notifyEmail,
      subject: `Contact: ${subject}`,
      html: `<p><strong>${name}</strong> (<a href="mailto:${email}">${email}</a>)</p><p>${message.replace(/\n/g, '<br/>')}</p>`,
    })
  } catch (e) {
    console.error('Brevo / mailer contact error:', e)
  }

  return NextResponse.json({ success: true })
}
