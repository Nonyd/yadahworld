import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mailer'

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { subject?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!subject || !message) {
    return NextResponse.json({ error: 'Subject and message required' }, { status: 400 })
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        where: {
          paymentStatus: { in: ['PAID', 'FREE'] },
        },
      },
    },
  })

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  let sent = 0
  const errors: string[] = []

  for (const reg of event.registrations) {
    try {
      await sendMail({
        to: reg.email,
        subject: `${subject} — ${event.title}`,
        html: `
          <div style="font-family:Georgia,serif;
                      max-width:600px;margin:0 auto;
                      padding:40px 20px;
                      background:#F7F3EC;
                      color:#2A2520;">
            <img 
              src="https://res.cloudinary.com/dxliuat50/image/upload/v1777837569/Yadah_White_4x_cd09dg.png"
              alt="Yadah"
              style="height:32px;width:auto;
                     filter:brightness(0);
                     margin-bottom:32px;"
            />
            <h2 style="font-size:20px;font-weight:400;
                       margin-bottom:8px;">
              ${event.title}
            </h2>
            <div style="font-size:15px;line-height:1.8;
                        color:#2A2520;margin:24px 0;">
              ${message}
            </div>
            <div style="border-top:1px solid rgba(42,37,32,0.1);
                        padding-top:16px;margin-top:32px;">
              <a href="${siteBase()}/tickets/${reg.ticketCode}"
                 style="font-family:sans-serif;
                        font-size:10px;
                        letter-spacing:0.15em;
                        text-transform:uppercase;
                        color:#8B6914;">
                View Your Ticket →
              </a>
            </div>
            <p style="font-size:11px;color:#8A7F72;
                      margin-top:32px;">
              © ${new Date().getFullYear()} Yadah · 
              yadahworld.com
            </p>
          </div>
        `,
      })
      sent++
    } catch {
      errors.push(reg.email)
    }
  }

  return NextResponse.json({
    success: true,
    sent,
    failed: errors.length,
    message: `Sent to ${sent} registrants.`,
  })
}
