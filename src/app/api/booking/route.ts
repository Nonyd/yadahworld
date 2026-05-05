import { NextRequest, NextResponse } from 'next/server'
import { renderEmailRows, renderEmailTemplate, sendMail } from '@/lib/mailer'
import { prisma } from '@/lib/prisma'
import { getNotifyEmail } from '@/lib/site-settings'
import { bookingFormSchema } from '@/types/booking'
import { checkRateLimit, escapeHtml, getClientIp } from '@/lib/security'

function normalizeWhatExpected(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return value ? [value] : []
  return []
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const throttle = checkRateLimit({
    key: `api:booking:${ip}`,
    max: 4,
    windowMs: 10 * 60 * 1000,
  })
  if (!throttle.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

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
    return NextResponse.json({ error: 'Could not save booking.' }, { status: 500 })
  }

  const notifyEmail = await getNotifyEmail()

  try {
    await sendMail({
      to: notifyEmail,
      subject: `New Booking Request: ${data.eventName}`,
      replyTo: `"${safeData.fullName}" <${data.email}>`,
      html: renderEmailTemplate({
        eyebrow: 'Yadah Booking',
        title: 'New Booking Request',
        previewText: `${safeData.fullName} submitted a booking request`,
        intro: 'A new booking request has been submitted through the booking form.',
        bodyHtml: `<table style="width:100%; border-collapse: collapse;">${renderEmailRows([
          { label: 'Full Name', value: safeData.fullName },
          { label: 'Email', value: safeData.email },
          { label: 'Phone', value: safeData.phone },
          { label: 'Organization', value: safeData.churchName },
          { label: 'Website', value: safeData.website || '-' },
          { label: 'Organization Address', value: safeData.organizationAddress },
          { label: 'Organization Phone', value: safeData.orgPhone },
          { label: 'Organization Email', value: safeData.orgEmail },
          { label: 'Event Name/Theme', value: safeData.eventName },
          { label: 'Nature of Event', value: safeData.natureOfEvent },
          { label: 'Expected From Yadah', value: safeData.whatExpected },
          { label: 'Expectation Details', value: safeData.expectationDetails || '-' },
          { label: 'Event Date', value: safeData.eventDate },
          { label: 'Event Time', value: safeData.eventTime },
          { label: 'Event Address', value: safeData.fullEventAddress },
          { label: 'Additional Info', value: safeData.additionalInfo || '-' },
        ])}</table>`,
        closing: 'Reply to this message to follow up with the requester.',
        signedBy: 'Yadah Website',
      }),
    })

    await sendMail({
      to: data.email,
      subject: 'Your Booking Request Has Been Received',
      html: renderEmailTemplate({
        eyebrow: 'Yadah Booking',
        title: 'Booking Request Received',
        previewText: 'Your booking request has been logged successfully.',
        greeting: `Dear ${safeData.fullName},`,
        intro:
          'Thank you for reaching out to Yadah. Your booking request has been received and logged successfully.',
        bodyHtml: `<div style="border: 1px solid #e5e7eb; border-radius: 12px; background: #f8fafc; padding: 16px; margin: 18px 0;">
          <p style="margin:0 0 8px;"><strong>Event:</strong> ${safeData.eventName}</p>
          <p style="margin:0 0 8px;"><strong>Date:</strong> ${safeData.eventDate}</p>
          <p style="margin:0;"><strong>Expected:</strong> ${safeData.whatExpected}</p>
        </div>
        <p style="margin: 0 0 12px; line-height: 1.7; color: #334155;">
          Please note this email is only an acknowledgment and does not confirm the booking yet.
          Our management team will review your request and contact you as soon as possible.
        </p>`,
        signedBy: 'Yadah Management Team',
      }),
    })
  } catch (e) {
    console.error('Brevo / mailer error:', e)
  }

  return NextResponse.json({ success: true })
}
