import { sendMail } from '@/lib/mailer'
import { generateQRCodeDataUrl } from '@/lib/qrcode'
import { escapeHtml, normalizeEmailHeader } from '@/lib/security'
import type { Event, EventRegistration, TicketTier } from '@prisma/client'

function formatPrice(tier: TicketTier): string {
  if (tier.price <= 0) return 'Free'
  if (tier.currency === 'NGN') return `₦${(tier.price / 100).toLocaleString()}`
  return `${tier.currency} ${(tier.price / 100).toLocaleString()}`
}

async function ticketCardHtml(registration: EventRegistration, event: Event, tier: TicketTier): Promise<string> {
  const qrDataUrl = await generateQRCodeDataUrl(registration.ticketCode, { width: 200 })
  const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const eventTime = new Date(event.date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const venueLine = event.venueName?.trim()
    ? escapeHtml(event.venueName)
    : event.isOnline
      ? 'Online'
      : 'TBA'
  const addressParts = [event.venueAddress, event.venueCity].filter(Boolean).join(', ')
  const addressHtml = addressParts ? `<span style="font-size:13px;color:#5C534A;">${escapeHtml(addressParts)}</span>` : ''

  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto 24px auto;background:#F7F3EC;border:1px solid rgba(107,39,55,0.15);border-radius:4px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
  <tr>
    <td style="padding:28px 24px 24px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8B6914;">🎫 Your ticket</p>
      <h2 style="margin:0 0 20px;font-size:22px;line-height:1.25;color:#2A2520;font-weight:700;">${escapeHtml(event.title)}</h2>
      <p style="margin:0 0 10px;font-size:14px;color:#2A2520;">📅 &nbsp;${escapeHtml(eventDate)} · ${escapeHtml(eventTime)}</p>
      <p style="margin:0 0 6px;font-size:14px;color:#2A2520;">📍 &nbsp;${venueLine}</p>
      ${addressHtml ? `<p style="margin:0 0 16px;padding-left:1.5em;">${addressHtml}</p>` : '<p style="margin:0 0 16px;"></p>'}
      <p style="margin:0 0 24px;font-size:14px;color:#2A2520;">🎟️ &nbsp;<span style="color:#6B2737;font-weight:600;">${escapeHtml(tier.name)}</span> — ${escapeHtml(registration.fullName)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(107,39,55,0.12);">
        <tr>
          <td style="padding:24px 0 8px;text-align:center;">
            <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8B6914;">Scan to check in</p>
            <img src="${qrDataUrl}" alt="Ticket QR" width="200" height="200" style="display:block;margin:0 auto;border:8px solid #FFFFFF;background:#FFFFFF;" />
            <p style="margin:16px 0 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8A7F72;">Ticket code</p>
            <p style="margin:6px 0 0;font-family:Consolas,Monaco,monospace;font-size:13px;color:#5C534A;">${escapeHtml(registration.ticketCode)}</p>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(107,39,55,0.12);margin-top:8px;">
        <tr>
          <td style="padding:20px 8px 0;text-align:center;">
            <p style="margin:0;font-size:13px;line-height:1.5;color:#5C534A;">⚠️ Please present this QR code at the entrance for check-in.<br/>Do not share this ticket.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

/** One email with multiple ticket cards (one per registration row). */
export async function sendTicketBundleEmail({
  registrations,
  event,
  tier,
}: {
  registrations: EventRegistration[]
  event: Event
  tier: TicketTier
}) {
  if (registrations.length === 0) return
  const primary = registrations[0]!
  const cards = await Promise.all(registrations.map((r) => ticketCardHtml(r, event, tier)))
  const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const amountFormatted = formatPrice(tier)
  const year = new Date().getFullYear()

  const header = `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:linear-gradient(180deg,#6B2737 0%,#4A1B26 100%);border-radius:4px 4px 0 0;overflow:hidden;">
  <tr>
    <td style="padding:28px 24px;text-align:center;">
      <img src="https://res.cloudinary.com/dxliuat50/image/upload/v1777837569/Yadah_White_4x_cd09dg.png" alt="Yadah" width="140" style="display:block;margin:0 auto;height:auto;" />
      <p style="margin:14px 0 0;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(247,243,236,0.85);">The voice of Jesus to nations</p>
    </td>
  </tr>
</table>`

  const summary =
    registrations.length > 1
      ? `<p style="margin:0 0 20px;font-size:13px;color:#5C534A;text-align:center;">${registrations.length} × ${escapeHtml(tier.name)} · ${amountFormatted} each</p>`
      : `<p style="margin:0 0 20px;font-size:13px;color:#5C534A;text-align:center;">${escapeHtml(tier.name)} · ${amountFormatted}</p>`

  await sendMail({
    to: primary.email,
    subject: normalizeEmailHeader(`Your ticket for ${event.title} — ${eventDate}`),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#E8E2D8;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;">
    ${header}
    <div style="background:#F7F3EC;padding:24px 16px 8px;border:1px solid rgba(107,39,55,0.15);border-top:none;border-radius:0 0 4px 4px;">
      ${summary}
    </div>
    ${cards.join('')}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:8px auto 0;">
      <tr>
        <td style="padding:16px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#8B6914;"><a href="https://yadahworld.com" style="color:#6B2737;text-decoration:none;">Yadahworld.com</a></p>
          <p style="margin:8px 0 0;font-size:11px;color:#8A7F72;">© ${year} SonsHub Media</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`,
  })
}

export async function sendTicketEmail({
  registration,
  event,
  tier,
}: {
  registration: EventRegistration
  event: Event
  tier: TicketTier
}) {
  await sendTicketBundleEmail({ registrations: [registration], event, tier })
}
