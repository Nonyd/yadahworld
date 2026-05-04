import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DeleteEventButton from '@/components/admin/cms/DeleteEventButton'

export default async function HomepageSiteEventsPage() {
  let events: Awaited<ReturnType<typeof prisma.siteEvent.findMany>> = []
  try {
    events = await prisma.siteEvent.findMany({ orderBy: { date: 'asc' } })
  } catch {
    events = []
  }

  return (
    <div>
      <AdminPageHeader
        title="Homepage ministry dates"
        description="Short list on the homepage “Upcoming” section. For full ticketing pages, use Events in the sidebar."
        actions={
          <Link href="/admin/homepage-events/new" className="admin-btn admin-btn-primary">
            New homepage event
          </Link>
        }
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-black/[0.02] text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
                <th className="px-4 py-3 font-medium sm:px-6">Date</th>
                <th className="px-4 py-3 font-medium sm:px-6">Title</th>
                <th className="px-4 py-3 font-medium sm:px-6">Location</th>
                <th className="px-4 py-3 font-medium sm:px-6">Active</th>
                <th className="px-4 py-3 text-right font-medium sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {events.map((e) => (
                <tr key={e.id} className="text-admin-text transition-colors hover:bg-black/[0.02]">
                  <td className="px-4 py-3 text-admin-muted sm:px-6">
                    {new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-medium sm:px-6">{e.title}</td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{e.location}</td>
                  <td className="px-4 py-3 sm:px-6">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                        e.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {e.isActive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right sm:px-6">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/homepage-events/${e.id}`} className="admin-btn admin-btn-ghost text-[10px]">
                        Edit
                      </Link>
                      <DeleteEventButton id={e.id} apiBase="/api/admin/site-events" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-admin-muted">No homepage events yet.</p>
        )}
      </div>
    </div>
  )
}
