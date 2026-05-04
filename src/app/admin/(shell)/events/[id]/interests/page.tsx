import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import EventAdminNav from '@/components/admin/events/EventAdminNav'
import NotifyInterestButton from '@/components/admin/events/NotifyInterestButton'

export default async function EventInterestsPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      interests: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!event) notFound()

  const pendingCount = event.interests.filter((i) => !i.notified).length

  return (
    <div>
      <Link href={`/admin/events/${params.id}`} className="admin-btn admin-btn-ghost mb-4 inline-flex text-[10px]">
        ← Back to Event
      </Link>
      <EventAdminNav eventId={event.id} status={event.status} />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-normal text-admin-text">{event.title}</h1>
          <p className="text-sm text-admin-muted">Interest list (coming soon)</p>
        </div>
        <NotifyInterestButton eventId={event.id} pendingCount={pendingCount} />
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border text-[10px] uppercase tracking-[0.14em] text-admin-muted">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Notified</th>
            </tr>
          </thead>
          <tbody>
            {event.interests.map((r) => (
              <tr key={r.id} className="border-b border-admin-border/60">
                <td className="px-4 py-3 text-xs text-admin-muted">{new Date(r.createdAt).toLocaleString('en-GB')}</td>
                <td className="px-4 py-3 text-admin-text">{r.email}</td>
                <td className="px-4 py-3 text-admin-muted">{r.name ?? '—'}</td>
                <td className="px-4 py-3 text-xs">{r.notified ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {event.interests.length === 0 && <p className="p-8 text-sm text-admin-muted">No interest sign-ups yet.</p>}
      </div>
    </div>
  )
}
