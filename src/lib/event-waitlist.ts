import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { renderEmailTemplate, sendMail } from '@/lib/mailer'
import type { Event, TicketTier } from '@prisma/client'

function claimToken(): string {
  return randomBytes(24).toString('hex')
}

export async function sendWaitlistConfirmationEmail(opts: {
  to: string
  name: string
  event: Event
  tier: TicketTier
  position: number
}) {
  const { to, name, event, tier, position } = opts
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  await sendMail({
    to,
    subject: `You're on the waitlist for ${event.title}`,
    html: renderEmailTemplate({
      previewText: `Waitlist position #${position}`,
      eyebrow: 'Yadah Events',
      title: "You're on the waitlist",
      greeting: `Hi ${name},`,
      intro: `A spot is not available right now for **${tier.name}** at **${event.title}**. You're #${position} in the queue. We'll email you if a place opens up.`,
      bodyHtml: `<p style="margin:0;line-height:1.7;color:#334155;">You don't need to do anything else. If tickets become available, you'll receive a time-limited link to complete registration.</p>
        <p style="margin:16px 0 0;"><a href="${siteBase}/events/${event.slug}" style="color:#6d28d9;">View event page</a></p>`,
    }),
  })
}

export async function sendWaitlistClaimEmail(opts: {
  to: string
  name: string
  event: Event
  tier: TicketTier
  claimUrl: string
  expiresAt: Date
}) {
  const { to, name, event, tier, claimUrl, expiresAt } = opts
  const exp = expiresAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
  await sendMail({
    to,
    subject: `A spot just opened for ${event.title} — claim it now`,
    html: renderEmailTemplate({
      previewText: 'Claim your ticket within 24 hours',
      eyebrow: 'Yadah Events',
      title: 'A ticket spot opened up',
      greeting: `Hi ${name},`,
      intro: `Good news — you can now claim **${tier.name}** for **${event.title}**. This link expires at **${exp}** (24 hours from when it was sent).`,
      bodyHtml: `<p style="margin:0;line-height:1.7;color:#334155;">Complete registration on the event page using your personal link. If you don't claim in time, we may offer the spot to the next person on the waitlist.</p>`,
      action: { label: 'Claim your spot', href: claimUrl },
    }),
  })
}

/** After a paid/free seat is cancelled, offer the next waitlisted person a claim link. */
export async function notifyNextWaitlistForTier(tierId: string): Promise<void> {
  const tier = await prisma.ticketTier.findUnique({
    where: { id: tierId },
    include: { event: true },
  })
  if (!tier || tier.capacity === null) return

  const activeCount = await prisma.eventRegistration.count({
    where: {
      tierId,
      paymentStatus: { in: ['PAID', 'FREE'] },
    },
  })
  if (activeCount >= tier.capacity) return

  const next = await prisma.eventRegistration.findFirst({
    where: {
      tierId,
      paymentStatus: 'WAITLISTED',
      isWaitlisted: true,
    },
    orderBy: [{ waitlistPos: 'asc' }, { createdAt: 'asc' }],
  })
  if (!next) return

  const token = claimToken()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const claimUrl = `${siteBase}/api/events/${tier.event.slug}/waitlist/claim?token=${encodeURIComponent(token)}`

  await prisma.eventRegistration.update({
    where: { id: next.id },
    data: {
      waitlistClaimToken: token,
      waitlistClaimExpires: expires,
    },
  })

  await sendWaitlistClaimEmail({
    to: next.email,
    name: next.fullName,
    event: tier.event,
    tier,
    claimUrl,
    expiresAt: expires,
  })
}
