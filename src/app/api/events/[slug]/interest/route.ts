import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mailer'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid data' }, { status: 400 })
    }

    const event = await prisma.event.findFirst({
      where: { slug: params.slug, status: 'COMING_SOON' },
    })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const email = parsed.data.email.trim().toLowerCase()

    await prisma.eventInterest.upsert({
      where: {
        eventId_email: {
          eventId: event.id,
          email,
        },
      },
      create: {
        eventId: event.id,
        email,
        name: parsed.data.name?.trim() || null,
      },
      update: {
        name: parsed.data.name?.trim() || null,
      },
    })

    await sendMail({
      to: email,
      subject: `You're on the list — ${event.title}`,
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
            You're on the list.
          </h1>
          <p style="font-size:16px;line-height:1.8;
                    color:#8A7F72;margin-bottom:16px;">
            Thank you${
              parsed.data.name ? `, ${parsed.data.name.trim().split(/\s+/)[0]}` : ''
            }. We have noted your interest in 
            <strong style="color:#2A2520;">
              ${event.title}
            </strong>.
          </p>
          <p style="font-size:16px;line-height:1.8;
                    color:#8A7F72;margin-bottom:32px;">
            We will notify you as soon as registration opens. 
            God bless you.
          </p>
          <blockquote style="border-left:2px solid #8B6914;
                             padding-left:24px;
                             font-style:italic;
                             color:#2A2520;font-size:16px;">
            "The Voice of Jesus Christ to Nations."
          </blockquote>
          <p style="font-size:11px;color:#8A7F72;margin-top:40px;">
            © ${new Date().getFullYear()} Yadah · 
            yadahworld.com
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: "You're on the list. We'll notify you when registration opens.",
    })
  } catch (err) {
    console.error('Interest error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
