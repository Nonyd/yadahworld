import { prisma } from '@/lib/prisma'

export default async function AdminOverview() {
  let bookings = 0
  let messages = 0
  let pendingBookings = 0
  try {
    ;[bookings, messages, pendingBookings] = await Promise.all([
      prisma.bookingRequest.count(),
      prisma.contactMessage.count(),
      prisma.bookingRequest.count({ where: { status: 'PENDING' } }),
    ])
  } catch {
    // DB unavailable — show zeros
  }

  const stats = [
    { label: 'Total Bookings', value: bookings, note: `${pendingBookings} pending` },
    { label: 'Messages', value: messages, note: 'Inbox' },
  ]

  return (
    <div>
      <h1 className="font-playfair text-3xl font-normal mb-2" style={{ color: 'var(--body)' }}>
        Overview
      </h1>
      <p className="ui-label mb-12" style={{ color: 'var(--muted)' }}>
        Welcome back.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map(({ label, value, note }) => (
          <div
            key={label}
            className="p-6 border"
            style={{ background: 'var(--bg)', borderColor: 'rgba(201,168,76,0.2)' }}
          >
            <p className="font-playfair text-4xl font-normal mb-1" style={{ color: 'var(--accent)' }}>
              {value}
            </p>
            <p className="ui-label mb-1" style={{ color: 'var(--body)' }}>
              {label}
            </p>
            <p className="ui-label" style={{ color: 'var(--muted)', opacity: 0.6 }}>
              {note}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
