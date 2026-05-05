import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addBrevoContact, sendBrevoWelcomeEmail } from '@/lib/brevo'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/security'

const schema = z.object({
  email: z.string().email('Please enter a valid email address').transform((s) => s.trim().toLowerCase()),
  name: z.string().max(200).optional(),
  source: z.string().max(80).optional(),
})

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const throttle = checkRateLimit({
    key: `api:newsletter-subscribe:${ip}`,
    max: 4,
    windowMs: 10 * 60 * 1000,
  })
  if (!throttle.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? 'Invalid request'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { email } = parsed.data
    const name = parsed.data.name?.trim() || undefined
    const source = parsed.data.source?.trim() || undefined

    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existing?.status === 'ACTIVE') {
      return NextResponse.json({ error: 'You are already subscribed.' }, { status: 409 })
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        name: name ?? null,
        status: 'ACTIVE',
        source: source ?? 'footer',
        brevoSynced: false,
      },
      update: {
        status: 'ACTIVE',
        ...(name !== undefined ? { name: name ?? null } : {}),
        ...(source !== undefined ? { source: source ?? 'footer' } : {}),
        brevoSynced: false,
      },
    })

    const listIdRaw = process.env.BREVO_LIST_ID?.trim()
    const listId = listIdRaw ? parseInt(listIdRaw, 10) : NaN

    if (Number.isFinite(listId) && listId > 0) {
      const result = await addBrevoContact({ email, name, listId })
      if (result.success) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { brevoSynced: true },
        })
      }
    }

    try {
      await sendBrevoWelcomeEmail({ email, name })
    } catch (mailErr) {
      console.error('Welcome email failed:', mailErr)
    }

    return NextResponse.json({
      success: true,
      message: 'You have been subscribed successfully.',
    })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
