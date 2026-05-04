import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mailer'

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      interests: { where: { notified: false } },
    },
  })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  let sent = 0
  for (const interest of event.interests) {
    try {
      await sendMail({
        to: interest.email,
        subject: `Registration is now open — ${event.title}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;
                      margin:0 auto;padding:40px 20px;
                      background:#F7F3EC;color:#2A2520;">
            <img 
              src="https://res.cloudinary.com/dxliuat50/image/upload/v1777837569/Yadah_White_4x_cd09dg.png"
              alt="Yadah"
              style="height:32px;width:auto;
                     filter:brightness(0);margin-bottom:32px;"
            />
            <h1 style="font-size:24px;font-weight:400;
                       margin-bottom:16px;">
              Registration is now open.
            </h1>
            <p style="font-size:16px;line-height:1.8;
                      color:#8A7F72;margin-bottom:24px;">
              ${
                interest.name?.trim()
                  ? `Hi ${interest.name.trim().split(/\s+/)[0]}, `
                  : ''
              }Registration for 
              <strong style="color:#2A2520;">
                ${event.title}
              </strong> 
              is now open. Secure your spot today.
            </p>
            <a href="${siteBase()}/events/${event.slug}"
               style="display:inline-block;
                      background:#6B2737;color:white;
                      padding:12px 32px;text-decoration:none;
                      font-family:sans-serif;font-size:10px;
                      letter-spacing:0.2em;
                      text-transform:uppercase;
                      margin-bottom:32px;">
              Register Now →
            </a>
            <p style="font-size:11px;color:#8A7F72;margin-top:40px;">
              © ${new Date().getFullYear()} Yadah · 
              yadahworld.com
            </p>
          </div>
        `,
      })

      await prisma.eventInterest.update({
        where: { id: interest.id },
        data: { notified: true },
      })
      sent++
    } catch (err) {
      console.error(`Failed to notify ${interest.email}:`, err)
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    message: `Notified ${sent} interested subscribers.`,
  })
}
