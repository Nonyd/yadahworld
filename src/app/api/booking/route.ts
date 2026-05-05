import { NextRequest, NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { getNotifyEmail } from '@/lib/site-settings'
import { bookingFormSchema } from '@/types/booking'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function normalizeWhatExpected(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value ? [value] : []
  return []
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bookingFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const whatExpected = normalizeWhatExpected(data.whatExpected)
  const whatExpectedStr = whatExpected.join(', ')
  const organizationAddress = `${data.streetAddress}, ${data.city}, ${data.state}, ${data.country}`
  const eventAddress = `${data.eventAddress}, ${data.eventCity}, ${data.eventState}, ${data.eventCountry}`

  const safeData = {
    fullName: escapeHtml(data.fullName),
    email: escapeHtml(data.email),
    phone: escapeHtml(data.phone),
    churchName: escapeHtml(data.churchName),
    website: data.website ? escapeHtml(data.website) : '',
    streetAddress: escapeHtml(data.streetAddress),
    city: escapeHtml(data.city),
    state: escapeHtml(data.state),
    country: escapeHtml(data.country),
    orgPhone: escapeHtml(data.orgPhone),
    orgEmail: escapeHtml(data.orgEmail),
    eventName: escapeHtml(data.eventName),
    natureOfEvent: escapeHtml(data.natureOfEvent),
    whatExpected: escapeHtml(whatExpectedStr),
    expectationDetails: data.expectationDetails?.trim() ? escapeHtml(data.expectationDetails) : '',
    eventDate: escapeHtml(data.eventDate),
    eventTime: escapeHtml(data.eventTime),
    eventAddress: escapeHtml(data.eventAddress),
    eventCity: escapeHtml(data.eventCity),
    eventState: escapeHtml(data.eventState),
    eventCountry: escapeHtml(data.eventCountry),
    additionalInfo: data.additionalInfo?.trim() ? escapeHtml(data.additionalInfo) : '',
    organizationAddress: escapeHtml(organizationAddress),
    fullEventAddress: escapeHtml(eventAddress),
  }

  try {
    await prisma.bookingRequest.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        churchName: data.churchName,
        website: data.website || null,
        orgAddress: organizationAddress,
        orgPhone: data.orgPhone,
        orgEmail: data.orgEmail,
        eventName: data.eventName,
        natureOfEvent: data.natureOfEvent,
        whatExpected: whatExpectedStr,
        expectationDetails: data.expectationDetails,
        eventDate: new Date(data.eventDate),
        eventTime: data.eventTime,
        eventAddress,
        additionalInfo: data.additionalInfo || null,
        status: 'PENDING',
      },
    })
  } catch (e) {
    console.error('Booking DB error:', e)
    return NextResponse.json({ error: 'Could not save booking. Check DATABASE_URL and run prisma db push.' }, { status: 500 })
  }

  const notifyEmail = await getNotifyEmail()

  try {
    await sendMail({
      to: notifyEmail,
      subject: `New Booking Request: ${data.eventName}`,
      replyTo: `"${safeData.fullName}" <${data.email}>`,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; color: #1f2937;">
          <h2 style="margin-bottom: 16px; color: #111827;">New Booking Request</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Full Name</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.fullName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.email}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.phone}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Organization</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.churchName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Website</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.website || '-'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Organization Address</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.organizationAddress}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Organization Phone</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.orgPhone}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Organization Email</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.orgEmail}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Event Name/Theme</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.eventName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Nature of Event</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.natureOfEvent}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Expected From Yadah</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.whatExpected}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Expectation Details</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.expectationDetails || '-'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Event Date</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.eventDate}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Event Time</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.eventTime}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Event Address</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.fullEventAddress}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Additional Info</strong></td><td style="padding: 8px; border: 1px solid #e5e7eb;">${safeData.additionalInfo || '-'}</td></tr>
          </table>
        </div>
      `,
    })

    await sendMail({
      to: data.email,
      subject: 'Your Booking Request Has Been Received',
      html: `
        <div style="margin:0; padding: 32px 16px; background:#f5f7fb; font-family: Arial, Helvetica, sans-serif; color:#1f2937;">
          <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #3b1f69 0%, #7a3ec8 100%); color: #ffffff; padding: 28px 24px;">
              <p style="margin: 0; font-size: 13px; letter-spacing: 0.6px; text-transform: uppercase; opacity: 0.9;">Yadah Booking</p>
              <h2 style="margin: 8px 0 0; font-size: 24px; line-height: 1.3;">Booking Request Received</h2>
            </div>
            <div style="padding: 24px;">
              <p style="margin: 0 0 12px;">Dear ${safeData.fullName},</p>
              <p style="margin: 0 0 12px; line-height: 1.6;">
                Thank you for reaching out to Yadah. Your booking request has been received and logged successfully.
              </p>
              <div style="margin: 18px 0; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; background: #fafafa;">
                <p style="margin: 0 0 8px;"><strong>Event:</strong> ${safeData.eventName}</p>
                <p style="margin: 0 0 8px;"><strong>Date:</strong> ${safeData.eventDate}</p>
                <p style="margin: 0;"><strong>Expected:</strong> ${safeData.whatExpected}</p>
              </div>
              <p style="margin: 0 0 12px; line-height: 1.6;">
                Please note this email is only an acknowledgment and does not confirm the booking yet.
                Our management team will review your request and contact you as soon as possible.
              </p>
              <p style="margin: 16px 0 0; line-height: 1.6;">
                God bless you,<br/>
                <strong>Yadah Management Team</strong><br/>
                SonsHub Media
              </p>
            </div>
            <div style="padding: 14px 24px; font-size: 12px; color: #6b7280; background: #f9fafb; border-top: 1px solid #e5e7eb;">
              This is an automated confirmation email from yadahworld.com.
            </div>
          </div>
        </div>
      `,
    })
  } catch (e) {
    console.error('Brevo / mailer error:', e)
  }

  return NextResponse.json({ success: true })
}
