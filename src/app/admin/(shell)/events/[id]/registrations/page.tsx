import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import EventAdminNav from '@/components/admin/events/EventAdminNav'

export default async function EventRegistrationsPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      tiers: true,
      registrations: {
        include: { tier: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!event) notFound()

  const paid = event.registrations.filter((r) => r.paymentStatus === 'PAID')
  const free = event.registrations.filter((r) => r.paymentStatus === 'FREE')
  const pending = event.registrations.filter((r) => r.paymentStatus === 'PENDING')
  const checkedIn = event.registrations.filter((r) => r.checkedIn)

  return (
    <div>
      <Link href={`/admin/events/${params.id}`} className="admin-btn admin-btn-ghost mb-4 inline-flex text-[10px]">
        ← Back to Event
      </Link>
      <EventAdminNav eventId={event.id} status={event.status} />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-normal text-admin-text">{event.title}</h1>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">Registrations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={`/api/admin/events/${params.id}/export`} className="admin-btn admin-btn-secondary text-[10px]">
            Export CSV
          </a>
          <Link href={`/admin/events/${params.id}/checkin`} className="admin-btn admin-btn-primary text-[10px]">
            Check-in Scanner →
          </Link>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Total', value: event.registrations.length },
          { label: 'Confirmed', value: paid.length + free.length },
          { label: 'Pending', value: pending.length },
          { label: 'Checked In', value: checkedIn.length },
        ].map(({ label, value }) => (
          <div key={label} className="border border-admin-border bg-admin-app-surface p-6">
            <p className="font-playfair text-4xl font-normal text-admin-accent">{value}</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
              {['Date', 'Name', 'Email', 'Phone', 'Tier', 'Amount', 'Status', 'Checked In', ''].map((h) => (
                <th key={h} className="pb-3 pr-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {event.registrations.map((reg) => (
              <tr key={reg.id} className="border-b border-admin-border/60 hover:bg-black/[0.02]">
                <td className="py-3 pr-4 text-xs text-admin-muted">
                  {new Date(reg.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="py-3 pr-4 text-sm font-medium text-admin-text">{reg.fullName}</td>
                <td className="py-3 pr-4 text-xs text-admin-muted">{reg.email}</td>
                <td className="py-3 pr-4 text-xs text-admin-muted">{reg.phone}</td>
                <td className="py-3 pr-4 text-xs text-admin-text">{reg.tier.name}</td>
                <td className="py-3 pr-4 text-xs text-admin-text">
                  {reg.amount === 0 ? 'Free' : `${reg.currency} ${(reg.amount / 100).toLocaleString()}`}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className="rounded px-2 py-1 text-[10px] uppercase tracking-wide"
                    style={{
                      background:
                        reg.paymentStatus === 'PAID' || reg.paymentStatus === 'FREE'
                          ? 'rgba(40,100,40,0.1)'
                          : reg.paymentStatus === 'PENDING'
                            ? 'rgba(139,105,20,0.1)'
                            : 'rgba(107,39,55,0.1)',
                      color:
                        reg.paymentStatus === 'PAID' || reg.paymentStatus === 'FREE'
                          ? '#2D6A2D'
                          : reg.paymentStatus === 'PENDING'
                            ? '#8B6914'
                            : '#6B2737',
                    }}
                  >
                    {reg.paymentStatus}
                  </span>
                </td>
                <td className="py-3 pr-4 text-[10px] text-admin-muted">
                  {reg.checkedIn
                    ? `✓ ${
                        reg.checkedInAt
                          ? new Date(reg.checkedInAt).toLocaleTimeString('en-GB', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Yes'
                      }`
                    : '—'}
                </td>
                <td className="py-3">
                  <Link
                    href={`/tickets/${reg.ticketCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted hover:text-admin-accent"
                  >
                    Ticket ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
