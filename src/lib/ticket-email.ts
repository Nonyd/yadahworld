import { sendMail } from '@/lib/mailer'
import { generateQRCodeDataUrl } from '@/lib/qrcode'
import type { Event, EventRegistration, TicketTier } from '@prisma/client'

export async function sendTicketEmail({
  registration,
  event,
  tier,
}: {
  registration: EventRegistration
  event: Event
  tier: TicketTier
}) {
  const qrDataUrl = await generateQRCodeDataUrl(registration.ticketCode)

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

  const amountFormatted =
    tier.price > 0 ? `${tier.currency} ${(tier.price / 100).toLocaleString()}` : 'Free'

  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  await sendMail({
    to: registration.email,
    subject: `Your ticket for ${event.title} — ${eventDate}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Ticket — ${event.title}</title>
</head>
<body style="margin:0;padding:0;background:#F7F3EC;
             font-family:Georgia,serif;">
  
  <div style="max-width:600px;margin:0 auto;
              background:#F7F3EC;">
    
    <!-- Header -->
    <div style="background:#0D0B08;padding:32px 40px;
                text-align:center;">
      <img 
        src="https://res.cloudinary.com/dxliuat50/image/upload/v1777837569/Yadah_White_4x_cd09dg.png"
        alt="Yadah"
        style="height:36px;width:auto;"
      />
    </div>

    <!-- Banner -->
    ${event.bannerImage ? `
    <div style="width:100%;height:200px;overflow:hidden;">
      <img src="${event.bannerImage}" 
           alt="${event.title}"
           style="width:100%;height:100%;object-fit:cover;" />
    </div>
    ` : ''}

    <!-- Ticket body -->
    <div style="padding:40px;">
      
      <p style="font-family:sans-serif;font-size:10px;
                letter-spacing:0.2em;text-transform:uppercase;
                color:#8B6914;margin:0 0 12px;">
        Your Ticket
      </p>
      
      <h1 style="font-size:28px;font-weight:400;
                 color:#2A2520;margin:0 0 8px;
                 line-height:1.2;">
        ${event.title}
      </h1>
      
      <p style="font-size:16px;color:#8A7F72;
                margin:0 0 32px;font-style:italic;">
        ${registration.fullName}
      </p>

      <!-- Ticket details box -->
      <div style="border:1px solid rgba(139,105,20,0.2);
                  padding:24px;margin-bottom:32px;
                  background:#EDE8DF;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:
                       1px solid rgba(42,37,32,0.08);">
              <p style="font-family:sans-serif;font-size:9px;
                        letter-spacing:0.2em;text-transform:uppercase;
                        color:#8A7F72;margin:0 0 4px;">
                Date
              </p>
              <p style="font-size:15px;color:#2A2520;margin:0;">
                ${eventDate}
              </p>
            </td>
            <td style="padding:8px 0 8px 24px;border-bottom:
                       1px solid rgba(42,37,32,0.08);">
              <p style="font-family:sans-serif;font-size:9px;
                        letter-spacing:0.2em;text-transform:uppercase;
                        color:#8A7F72;margin:0 0 4px;">
                Time
              </p>
              <p style="font-size:15px;color:#2A2520;margin:0;">
                ${eventTime}
                ${event.doorsOpen ? `<br><span style="font-size:12px;
                  color:#8A7F72;">Doors: ${event.doorsOpen}</span>` : ''}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:
                       1px solid rgba(42,37,32,0.08);">
              <p style="font-family:sans-serif;font-size:9px;
                        letter-spacing:0.2em;text-transform:uppercase;
                        color:#8A7F72;margin:0 0 4px;">
                Venue
              </p>
              <p style="font-size:15px;color:#2A2520;margin:0;">
                ${event.venueName ?? (event.isOnline ? 'Online' : 'TBA')}
                ${event.venueAddress ? `<br><span style="font-size:12px;
                  color:#8A7F72;">${event.venueAddress}, 
                  ${event.venueCity}</span>` : ''}
              </p>
            </td>
            <td style="padding:8px 0 8px 24px;border-bottom:
                       1px solid rgba(42,37,32,0.08);">
              <p style="font-family:sans-serif;font-size:9px;
                        letter-spacing:0.2em;text-transform:uppercase;
                        color:#8A7F72;margin:0 0 4px;">
                Ticket Type
              </p>
              <p style="font-size:15px;color:#2A2520;margin:0;">
                ${tier.name}
                <br>
                <span style="font-size:12px;color:#8B6914;">
                  ${amountFormatted}
                </span>
              </p>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:8px 0;">
              <p style="font-family:sans-serif;font-size:9px;
                        letter-spacing:0.2em;text-transform:uppercase;
                        color:#8A7F72;margin:0 0 4px;">
                Ticket Code
              </p>
              <p style="font-size:13px;color:#2A2520;margin:0;
                        font-family:monospace;
                        letter-spacing:0.1em;">
                ${registration.ticketCode.toUpperCase()}
              </p>
            </td>
          </tr>
        </table>
      </div>

      ${event.dressCode ? `
      <div style="background:rgba(139,105,20,0.08);
                  border-left:2px solid #8B6914;
                  padding:12px 16px;margin-bottom:24px;">
        <p style="font-family:sans-serif;font-size:9px;
                  letter-spacing:0.2em;text-transform:uppercase;
                  color:#8B6914;margin:0 0 4px;">
          Dress Code
        </p>
        <p style="font-size:14px;color:#2A2520;margin:0;">
          ${event.dressCode}
        </p>
      </div>
      ` : ''}

      <!-- QR Code -->
      <div style="text-align:center;margin:32px 0;">
        <p style="font-family:sans-serif;font-size:9px;
                  letter-spacing:0.2em;text-transform:uppercase;
                  color:#8A7F72;margin:0 0 16px;">
          Present this QR code at the entrance
        </p>
        <img 
          src="${qrDataUrl}"
          alt="QR Code"
          style="width:200px;height:200px;
                 border:1px solid rgba(42,37,32,0.1);
                 padding:8px;background:#F7F3EC;"
        />
        <p style="font-family:monospace;font-size:11px;
                  color:#8A7F72;margin:12px 0 0;
                  letter-spacing:0.15em;">
          ${registration.ticketCode.toUpperCase()}
        </p>
      </div>

      <!-- View ticket link -->
      <div style="text-align:center;margin:24px 0;">
        <a href="${siteBase}/tickets/${registration.ticketCode}"
           style="display:inline-block;
                  background:#6B2737;color:white;
                  padding:12px 32px;text-decoration:none;
                  font-family:sans-serif;font-size:10px;
                  letter-spacing:0.2em;text-transform:uppercase;">
          View Your Ticket Online
        </a>
      </div>

      ${event.requirements ? `
      <div style="margin-top:24px;padding:16px;
                  border:1px solid rgba(42,37,32,0.1);">
        <p style="font-family:sans-serif;font-size:9px;
                  letter-spacing:0.2em;text-transform:uppercase;
                  color:#8A7F72;margin:0 0 8px;">
          Important Information
        </p>
        <p style="font-size:13px;color:#8A7F72;
                  line-height:1.6;margin:0;">
          ${event.requirements}
        </p>
      </div>
      ` : ''}

    </div>

    <!-- Footer -->
    <div style="background:#0D0B08;padding:24px 40px;
                text-align:center;">
      <p style="font-family:sans-serif;font-size:9px;
                letter-spacing:0.15em;text-transform:uppercase;
                color:rgba(253,250,245,0.3);margin:0;">
        © ${new Date().getFullYear()} Yadah · SonsHub Media · 
        Abuja, Nigeria
      </p>
      <p style="font-family:sans-serif;font-size:9px;
                color:rgba(253,250,245,0.2);margin:8px 0 0;">
        Questions? Contact us at info@yadahworld.com
      </p>
    </div>

  </div>
</body>
</html>
    `,
  })
}
