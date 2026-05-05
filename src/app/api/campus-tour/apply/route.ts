import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { renderEmailRows, renderEmailTemplate, sendMail } from '@/lib/mailer'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/security'

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
  const ip = getClientIp(req)
  const throttle = checkRateLimit({
    key: `api:campus-tour-apply:${ip}`,
    max: 4,
    windowMs: 10 * 60 * 1000,
  })
  if (!throttle.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

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
      html: renderEmailTemplate({
        eyebrow: 'Yadah Campus Tour',
        title: 'New Campus Tour Application',
        previewText: `${escapeHtml(data.fullName)} applied from ${escapeHtml(displayCampus)}`,
        intro: 'A new campus tour application has been submitted.',
        bodyHtml: `<table style="width:100%; border-collapse: collapse;">${renderEmailRows([
          { label: 'Name', value: escapeHtml(data.fullName) },
          { label: 'Email', value: escapeHtml(data.email) },
          { label: 'WhatsApp', value: escapeHtml(data.whatsapp) },
          { label: 'Campus', value: escapeHtml(displayCampus) },
          { label: 'Role', value: escapeHtml(displayRole) },
          { label: 'Why Minister Yadah', value: escapeHtml(data.whyMinisterYadah.trim()) },
          { label: 'Expectations', value: escapeHtml(data.expectations ?? '—') },
        ])}</table>`,
        action: { label: 'View in Admin', href: `${siteUrl}/admin/campus-tour` },
        closing: 'Please review the application and follow up.',
        signedBy: 'Yadah Website',
      }),
    })

    const firstName = escapeHtml(data.fullName.split(' ')[0] ?? data.fullName)

    await sendMail({
      to: data.email,
      subject: 'We received your Campus Tour application — Yadah',
      html: renderEmailTemplate({
        eyebrow: 'Yadah Campus Tour',
        title: 'Application Received',
        greeting: `Dear ${firstName},`,
        intro: `Thank you for your interest in having Yadah minister at <strong>${escapeHtml(displayCampus)}</strong>. We have received your application and will be in touch with you as soon as possible.`,
        bodyHtml: '<p style="margin:0 0 12px; line-height:1.7; color:#334155;">God bless you and your campus fellowship.</p>',
        signedBy: 'Yadah Management Team',
      }),
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
