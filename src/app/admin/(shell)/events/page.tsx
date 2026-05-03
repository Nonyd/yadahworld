import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DeleteEventButton from '@/components/admin/cms/DeleteEventButton'

export default async function AdminEventsPage() {
  let events: Awaited<ReturnType<typeof prisma.siteEvent.findMany>> = []
  try {
    events = await prisma.siteEvent.findMany({ orderBy: { date: 'asc' } })
  } catch {
    events = []
  }

  return (
    <div>
      <AdminPageHeader
        title="Events"
        description="Upcoming moments on the homepage. Inactive rows are hidden from the public site."
        actions={
          <Link href="/admin/events/new" className="admin-btn admin-btn-primary">
            New event
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
                <th className="px-4 py-3 font-medium sm:px-6 text-right">Actions</th>
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
                      <Link href={`/admin/events/${e.id}`} className="admin-btn admin-btn-ghost text-[10px]">
                        Edit
                      </Link>
                      <DeleteEventButton id={e.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {events.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-admin-muted">No events yet. The homepage uses built-in placeholders until you add one.</p>
        )}
      </div>
    </div>
  )
}
