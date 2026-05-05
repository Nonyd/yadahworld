import { sendMail } from '@/lib/mailer'
import { generateQRCodeDataUrl } from '@/lib/qrcode'
import type { Event, EventRegistration, TicketTier } from '@prisma/client'

function formatPrice(tier: TicketTier): string {
  if (tier.price <= 0) return 'Free'
  if (tier.currency === 'NGN') return `₦${(tier.price / 100).toLocaleString()}`
  return `${tier.currency} ${(tier.price / 100).toLocaleString()}`
}

async function ticketQrBlocks(
  registrations: EventRegistration[],
  event: Event,
  tier: TicketTier,
): Promise<string> {
  const parts: string[] = []
  for (const registration of registrations) {
    const qrDataUrl = await generateQRCodeDataUrl(registration.ticketCode)
    parts.push(`
      <div style="border:1px solid rgba(139,105,20,0.2);padding:24px;margin-bottom:24px;background:#EDE8DF;">
        <p style="font-size:16px;color:#2A2520;margin:0 0 8px;">${registration.fullName}</p>
        <p style="font-family:sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#8A7F72;margin:0 0 4px;">Ticket code</p>
        <p style="font-size:13px;color:#2A2520;margin:0 0 16px;font-family:monospace;">${registration.ticketCode.toUpperCase()}</p>
        <div style="text-align:center;">
          <img src="${qrDataUrl}" alt="QR" style="width:200px;height:200px;border:1px solid rgba(42,37,32,0.1);padding:8px;background:#F7F3EC;" />
        </div>
        ${event.doorsOpen ? `<p style="font-size:12px;color:#8A7F72;margin:12px 0 0;">Doors: ${event.doorsOpen}</p>` : ''}
      </div>
    `)
  }
  return parts.join('')
}

/** One email with multiple QR sections (one ticket per registration row). */
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
  const qrSection = await ticketQrBlocks(registrations, event, tier)
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
  const amountFormatted = formatPrice(tier)
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  await sendMail({
    to: primary.email,
    subject: `Your ticket for ${event.title} — ${eventDate}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:0 auto;background:#F7F3EC;">
    <div style="background:#0D0B08;padding:32px 40px;text-align:center;">
      <img src="https://res.cloudinary.com/dxliuat50/image/upload/v1777837569/Yadah_White_4x_cd09dg.png" alt="Yadah" style="height:36px;width:auto;" />
    </div>
    ${event.bannerImage ? `<div style="width:100%;height:200px;overflow:hidden;"><img src="${event.bannerImage}" alt="${event.title}" style="width:100%;height:100%;object-fit:cover;" /></div>` : ''}
    <div style="padding:40px;">
      <p style="font-family:sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8B6914;margin:0 0 12px;">Your ticket${registrations.length > 1 ? 's' : ''}</p>
      <h1 style="font-size:28px;font-weight:400;color:#2A2520;margin:0 0 8px;line-height:1.2;">${event.title}</h1>
      <p style="font-size:14px;color:#8A7F72;margin:0 0 24px;">${registrations.length} × ${tier.name} · ${amountFormatted} each</p>
      <div style="border:1px solid rgba(139,105,20,0.2);padding:24px;margin-bottom:24px;background:#EDE8DF;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;"><p style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#8A7F72;margin:0;">Date</p><p style="font-size:15px;color:#2A2520;margin:4px 0 0;">${eventDate}</p></td>
            <td style="padding:8px 0 8px 24px;"><p style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#8A7F72;margin:0;">Time</p><p style="font-size:15px;color:#2A2520;margin:4px 0 0;">${eventTime}</p></td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 0;">
              <p style="font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#8A7F72;margin:0;">Venue</p>
              <p style="font-size:15px;color:#2A2520;margin:4px 0 0;">${event.venueName ?? (event.isOnline ? 'Online' : 'TBA')}${event.venueAddress ? `<br><span style="font-size:12px;color:#8A7F72;">${event.venueAddress}, ${event.venueCity ?? ''}</span>` : ''}</p>
            </td>
          </tr>
        </table>
      </div>
      <p style="font-family:sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#8A7F72;margin:0 0 12px;">Present each QR at the entrance</p>
      ${qrSection}
      <div style="text-align:center;margin:24px 0;">
        <a href="${siteBase}/tickets/${primary.ticketCode}" style="display:inline-block;background:#6B2737;color:white;padding:12px 32px;text-decoration:none;font-family:sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;">View tickets online</a>
      </div>
    </div>
    <div style="background:#0D0B08;padding:24px 40px;text-align:center;">
      <p style="font-family:sans-serif;font-size:9px;color:rgba(253,250,245,0.3);margin:0;">© ${new Date().getFullYear()} Yadah · yadahworld.com</p>
    </div>
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
