import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { prisma } from '@/lib/prisma'
import { bookingFormSchema } from '@/types/booking'

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

  try {
    await prisma.bookingRequest.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        churchName: data.churchName,
        website: data.website || null,
        orgAddress: `${data.streetAddress}, ${data.city}, ${data.state}, ${data.country}`,
        orgPhone: data.orgPhone,
        orgEmail: data.orgEmail,
        eventName: data.eventName,
        natureOfEvent: data.natureOfEvent,
        whatExpected: whatExpectedStr,
        expectationDetails: data.expectationDetails,
        eventDate: new Date(data.eventDate),
        eventTime: data.eventTime,
        eventAddress: `${data.eventAddress}, ${data.eventCity}, ${data.eventState}, ${data.eventCountry}`,
        additionalInfo: data.additionalInfo || null,
        status: 'PENDING',
      },
    })
  } catch (e) {
    console.error('Booking DB error:', e)
    return NextResponse.json({ error: 'Could not save booking. Check DATABASE_URL and run prisma db push.' }, { status: 500 })
  }

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) {
    const resend = new Resend(resendKey)
    const fromBooking = process.env.RESEND_FROM_BOOKING ?? 'Yadah Booking <onboarding@resend.dev>'
    const fromMgmt = process.env.RESEND_FROM_MGMT ?? 'Yadah Management <onboarding@resend.dev>'
    const mgmtEmail = process.env.BOOKING_NOTIFY_EMAIL ?? 'yadahsings@gmail.com'

    try {
      await resend.emails.send({
        from: fromBooking,
        to: mgmtEmail,
        subject: `New Booking Request: ${data.eventName}`,
        html: `
        <h2>New Booking Request</h2>
        <p><strong>From:</strong> ${data.fullName} (${data.email})</p>
        <p><strong>Organization:</strong> ${data.churchName}</p>
        <p><strong>Event:</strong> ${data.eventName}</p>
        <p><strong>Date:</strong> ${data.eventDate}</p>
        <p><strong>Nature:</strong> ${data.natureOfEvent}</p>
        <p><strong>Expected:</strong> ${whatExpectedStr}</p>
        <p><strong>Details:</strong> ${data.expectationDetails}</p>
        <p><strong>Address:</strong> ${data.eventAddress}, ${data.eventCity}</p>
        ${data.additionalInfo ? `<p><strong>Additional:</strong> ${data.additionalInfo}</p>` : ''}
      `,
      })

      await resend.emails.send({
        from: fromMgmt,
        to: data.email,
        subject: 'Your Booking Request Has Been Received',
        html: `
        <p>Dear ${data.fullName},</p>
        <p>Thank you for reaching out. Your booking request for <strong>${data.eventName}</strong>
        on <strong>${data.eventDate}</strong> has been received.</p>
        <p>Please note that this does not confirm the event. Yadah's management will review your
        request and contact you at the soonest possible time.</p>
        <p>God bless you,<br/>Yadah Management Team<br/>SonsHub Media</p>
      `,
      })
    } catch (e) {
      console.error('Resend error:', e)
    }
  }

  return NextResponse.json({ success: true })
}
