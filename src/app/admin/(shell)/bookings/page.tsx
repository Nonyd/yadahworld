import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function BookingsPage() {
  let bookings: Awaited<ReturnType<typeof prisma.bookingRequest.findMany>> = []
  try {
    bookings = await prisma.bookingRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    bookings = []
  }

  return (
    <div>
      <h1 className="font-playfair text-3xl mb-8" style={{ color: 'var(--body)' }}>
        Booking Requests
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]" style={{ fontFamily: 'var(--font-jost)' }}>
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
              {['Date', 'Name', 'Organisation', 'Event', 'Event Date', 'Status', ''].map((h) => (
                <th key={h} className="text-left pb-3 pr-6 ui-label" style={{ color: 'var(--muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="border-b hover:bg-[var(--surface)] transition-colors"
                style={{ borderColor: 'rgba(42,37,32,0.06)' }}
              >
                <td className="py-4 pr-6 text-sm" style={{ color: 'var(--muted)' }}>
                  {new Date(b.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="py-4 pr-6 text-sm font-medium" style={{ color: 'var(--body)' }}>
                  {b.fullName}
                </td>
                <td className="py-4 pr-6 text-sm" style={{ color: 'var(--muted)' }}>
                  {b.churchName}
                </td>
                <td className="py-4 pr-6 text-sm" style={{ color: 'var(--body)' }}>
                  {b.eventName}
                </td>
                <td className="py-4 pr-6 text-sm" style={{ color: 'var(--muted)' }}>
                  {new Date(b.eventDate).toLocaleDateString('en-GB')}
                </td>
                <td className="py-4 pr-6">
                  <span
                    className="ui-label px-2 py-1 text-[10px]"
                    style={{
                      background:
                        b.status === 'PENDING'
                          ? 'rgba(139,105,20,0.1)'
                          : b.status === 'CONFIRMED'
                            ? 'rgba(40,100,40,0.1)'
                            : 'rgba(107,39,55,0.1)',
                      color:
                        b.status === 'PENDING' ? 'var(--gold)' : b.status === 'CONFIRMED' ? '#2D6A2D' : 'var(--accent)',
                    }}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-4">
                  <Link href={`/admin/bookings/${b.id}`} className="btn-ghost text-xs">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <p className="ui-label mt-8" style={{ color: 'var(--muted)' }}>
            No bookings yet.
          </p>
        )}
      </div>
    </div>
  )
}
