import nodemailer from 'nodemailer'
import type { SiteSettings } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function mergeSmtpConfig(settings: SiteSettings | null) {
  const host =
    settings?.brevoSmtpHost?.trim() || process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com'
  const port = settings?.brevoSmtpPort ?? Number(process.env.BREVO_SMTP_PORT ?? 587)
  const user = settings?.brevoSmtpUser?.trim() || process.env.BREVO_SMTP_USER || ''
  const pass = settings?.brevoSmtpPass?.trim() || process.env.BREVO_SMTP_PASS || ''
  const fromName = settings?.brevoFromName?.trim() || process.env.BREVO_FROM_NAME || 'Yadah'
  const fromEmail =
    settings?.brevoFromEmail?.trim() || process.env.BREVO_FROM_EMAIL || 'noreply@yadahworld.com'
  return { host, port, user, pass, fromName, fromEmail }
}

export async function sendMail({
  to,
  subject,
  html,
  replyTo,
  settingsOverride,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
  /** When omitted, loads row id=1 from DB. */
  settingsOverride?: SiteSettings | null
}) {
  const settings =
    settingsOverride !== undefined ? settingsOverride : await prisma.siteSettings.findUnique({ where: { id: 1 } })
  const { host, port, user, pass, fromName, fromEmail } = mergeSmtpConfig(settings)
  if (!pass) {
    throw new Error('Brevo SMTP is not configured (missing BREVO_SMTP_PASS or settings override).')
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: user ? { user, pass } : { user: fromEmail, pass },
  })

  await transport.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  })
}
