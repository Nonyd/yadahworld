import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mailer'
import { getNotifyEmail } from '@/lib/site-settings'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000)

  // Find bookings that have been REVIEWING for more than 5 hours
  // and haven't had a reminder sent yet (or last reminder was > 5 hours ago)
  const bookings = await prisma.bookingRequest.findMany({
    where: {
      status: 'REVIEWING',
      updatedAt: { lte: fiveHoursAgo },
      OR: [
        { lastStatusEmailSentAt: null },
        { lastStatusEmailSentAt: { lte: fiveHoursAgo } },
      ],
    },
  })

  if (bookings.length === 0) {
    return NextResponse.json({ reminded: 0 })
  }

  const notifyEmail = await getNotifyEmail()
  let reminded = 0

  for (const booking of bookings) {
    try {
      await sendMail({
        to: notifyEmail,
        subject: `⏰ Reminder: Booking from ${booking.fullName} is still under review`,
        html: `
          <p>This booking has been under review for more than 5 hours and requires your attention.</p>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;font-weight:bold">Name</td><td style="padding:8px">${booking.fullName}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${booking.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Event</td><td style="padding:8px">${booking.eventName ?? '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Date</td><td style="padding:8px">${booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-GB') : '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Submitted</td><td style="padding:8px">${new Date(booking.createdAt).toLocaleString('en-GB')}</td></tr>
          </table>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/bookings/${booking.id}">View booking in admin →</a></p>
        `,
      })

      await prisma.bookingRequest.update({
        where: { id: booking.id },
        data: { lastStatusEmailSentAt: new Date() },
      })

      reminded++
    } catch (e) {
      console.error('Booking reminder error:', booking.id, e)
    }
  }

  return NextResponse.json({ reminded })
}
