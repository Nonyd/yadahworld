import nodemailer from 'nodemailer'
import type { SiteSettings } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type EmailTemplateRow = { label: string; value: string }
type EmailTemplateAction = { label: string; href: string }

function mergeSmtpConfig(settings: SiteSettings | null) {
  const host = settings?.brevoSmtpHost?.trim() || process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com'
  const port = settings?.brevoSmtpPort ?? Number(process.env.BREVO_SMTP_PORT ?? 587)
  const user = settings?.brevoSmtpUser?.trim() || process.env.BREVO_SMTP_USER || ''
  const pass = settings?.brevoSmtpPass?.trim() || process.env.BREVO_SMTP_PASS || ''
  const fromName = settings?.brevoFromName?.trim() || process.env.BREVO_FROM_NAME || 'Yadah'
  const fromEmail = settings?.brevoFromEmail?.trim() || process.env.BREVO_FROM_EMAIL || 'noreply@yadahworld.com'
  return { host, port, user, pass, fromName, fromEmail }
}

export function renderEmailRows(rows: EmailTemplateRow[]) {
  return rows
    .map(
      (row) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #ebeef3; width: 35%; color: #6b7280; font-weight: 600;">${row.label}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #ebeef3; color: #0f172a;">${row.value}</td>
        </tr>
      `,
    )
    .join('')
}

export function renderEmailCard(title: string, contentHtml: string) {
  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; background: #f8fafc; padding: 16px; margin: 18px 0;">
      <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #6b7280;">${title}</p>
      ${contentHtml}
    </div>
  `
}

export function renderEmailTemplate({
  previewText,
  eyebrow = 'Yadah World',
  title,
  greeting,
  intro,
  bodyHtml,
  action,
  closing = 'God bless you,',
  signedBy = 'Yadah Management Team',
  footerNote = 'This is an automated message from yadahworld.com.',
}: {
  previewText?: string
  eyebrow?: string
  title: string
  greeting?: string
  intro?: string
  bodyHtml?: string
  action?: EmailTemplateAction
  closing?: string
  signedBy?: string
  footerNote?: string
}) {
  return `
    <div style="margin: 0; padding: 30px 14px; background: #eef2f7; font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText ?? title}</div>
      <div style="max-width: 660px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="padding: 24px; background: linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%); color: #ffffff;">
          <p style="margin: 0; font-size: 12px; letter-spacing: .1em; text-transform: uppercase; opacity: .92;">${eyebrow}</p>
          <h1 style="margin: 10px 0 0; font-size: 28px; line-height: 1.25;">${title}</h1>
        </div>
        <div style="padding: 24px;">
          ${greeting ? `<p style="margin: 0 0 12px; line-height: 1.6;">${greeting}</p>` : ''}
          ${intro ? `<p style="margin: 0 0 12px; line-height: 1.7; color: #334155;">${intro}</p>` : ''}
          ${bodyHtml ?? ''}
          ${
            action
              ? `<p style="margin: 24px 0 0;"><a href="${action.href}" style="display: inline-block; background: #6d28d9; color: #ffffff; text-decoration: none; border-radius: 999px; padding: 12px 20px; font-weight: 600;">${action.label}</a></p>`
              : ''
          }
          <p style="margin: 20px 0 0; line-height: 1.7; color: #334155;">${closing}<br /><strong>${signedBy}</strong></p>
        </div>
        <div style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 12px; color: #64748b;">${footerNote}</p>
        </div>
      </div>
    </div>
  `
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
    tls: { rejectUnauthorized: false },
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