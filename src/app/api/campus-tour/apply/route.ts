import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mailer'
import { z } from 'zod'

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name required'),
    whatsapp: z.string().min(7, 'WhatsApp number required'),
    email: z.string().email('Valid email required'),
    campus: z.string().min(1, 'Please select your campus'),
    customCampus: z.string().optional(),
    role: z.string().min(1, 'Please select your role'),
    customRole: z.string().optional(),
    whyMinisterYadah: z
      .string()
      .transform((s) => s.trim())
      .pipe(z.string().min(1, 'Please tell us why you want Minister Yadah in your school')),
    expectations: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.campus === 'other' && !data.customCampus?.trim()) return false
      return true
    },
    { message: 'Please enter your university name', path: ['customCampus'] }
  )
  .refine(
    (data) => {
      if (data.role === 'other' && !data.customRole?.trim()) return false
      return true
    },
    { message: 'Please describe your role', path: ['customRole'] }
  )

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const data = parsed.data
    const displayCampus = data.campus === 'other' ? data.customCampus! : data.campus
    const displayRole = data.role === 'other' ? data.customRole! : data.role

    await prisma.campusTourApplication.create({
      data: {
        fullName: data.fullName,
        whatsapp: data.whatsapp,
        email: data.email,
        campus: displayCampus,
        customCampus: data.campus === 'other' ? data.customCampus : null,
        role: displayRole,
        customRole: data.role === 'other' ? data.customRole : null,
        whyMinisterYadah: data.whyMinisterYadah.trim(),
        expectations: data.expectations ?? null,
      },
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://yadahworld.com'

    await sendMail({
      to: 'info@yadahworld.com',
      subject: `New Campus Tour Application — ${displayCampus}`,
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
          <h2 style="font-size:22px;font-weight:400;
                     margin-bottom:4px;">
            New Campus Tour Application
          </h2>
          <p style="font-size:13px;color:#8A7F72;
                    margin-bottom:32px;">
            ${new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <table style="width:100%;border-collapse:collapse;">
            ${[
              ['Name', data.fullName],
              ['Email', data.email],
              ['WhatsApp', data.whatsapp],
              ['Campus', displayCampus],
              ['Role', displayRole],
              ['Why Minister Yadah', data.whyMinisterYadah.trim()],
              ['Expectations', data.expectations ?? '—'],
            ]
              .map(
                ([label, value]) => `
              <tr>
                <td style="padding:10px 0;
                           border-bottom:1px solid rgba(42,37,32,0.08);
                           font-family:sans-serif;font-size:10px;
                           letter-spacing:0.15em;
                           text-transform:uppercase;
                           color:#8A7F72;width:140px;
                           vertical-align:top;">
                  ${escapeHtml(label)}
                </td>
                <td style="padding:10px 0 10px 16px;
                           border-bottom:1px solid rgba(42,37,32,0.08);
                           font-size:15px;color:#2A2520;">
                  ${escapeHtml(String(value))}
                </td>
              </tr>
            `
              )
              .join('')}
          </table>
          <div style="margin-top:32px;">
            <a href="${siteUrl}/admin/campus-tour"
               style="display:inline-block;
                      background:#6B2737;color:white;
                      padding:12px 32px;text-decoration:none;
                      font-family:sans-serif;font-size:10px;
                      letter-spacing:0.2em;text-transform:uppercase;">
              View in Admin →
            </a>
          </div>
          <p style="font-size:11px;color:#8A7F72;margin-top:40px;">
            © ${new Date().getFullYear()} Yadah · yadahworld.com
          </p>
        </div>
      `,
    })

    const firstName = escapeHtml(data.fullName.split(' ')[0] ?? data.fullName)

    await sendMail({
      to: data.email,
      subject: 'We received your Campus Tour application — Yadah',
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
          <h1 style="font-size:26px;font-weight:400;
                     margin-bottom:16px;">
            Application received.
          </h1>
          <p style="font-size:16px;line-height:1.8;
                    color:#8A7F72;margin-bottom:16px;">
            Dear ${firstName},
          </p>
          <p style="font-size:16px;line-height:1.8;
                    color:#8A7F72;margin-bottom:16px;">
            Thank you for your interest in having Yadah 
            minister at <strong style="color:#2A2520;">
            ${escapeHtml(displayCampus)}</strong>. 
            We have received your application and will be 
            in touch with you as soon as possible.
          </p>
          <p style="font-size:16px;line-height:1.8;
                    color:#8A7F72;margin-bottom:32px;">
            God bless you and your campus fellowship.
          </p>
          <blockquote style="border-left:2px solid #8B6914;
                             padding-left:24px;margin:32px 0;
                             font-style:italic;
                             color:#2A2520;font-size:17px;
                             line-height:1.6;">
            "The Voice of Jesus Christ to Nations."
          </blockquote>
          <p style="font-size:11px;color:#8A7F72;margin-top:40px;">
            © ${new Date().getFullYear()} Yadah · 
            SonsHub Media · yadahworld.com
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully.',
    })
  } catch (err) {
    console.error('Campus tour apply error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
