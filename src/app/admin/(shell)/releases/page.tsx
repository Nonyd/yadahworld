import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import DeleteReleaseButton from '@/components/admin/cms/DeleteReleaseButton'

export default async function AdminReleasesPage() {
  let releases: Awaited<ReturnType<typeof prisma.siteRelease.findMany>> = []
  try {
    releases = await prisma.siteRelease.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
  } catch {
    releases = []
  }

  return (
    <div>
      <AdminPageHeader
        title="Releases"
        description="These power the “Recent Releases” section on the homepage. If none exist, the site shows curated defaults."
        actions={
          <Link href="/admin/releases/new" className="admin-btn admin-btn-primary">
            New release
          </Link>
        }
      />

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border bg-black/[0.02] text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">
                <th className="px-4 py-3 font-medium sm:px-6">Cover</th>
                <th className="px-4 py-3 font-medium sm:px-6">Title</th>
                <th className="px-4 py-3 font-medium sm:px-6">Type</th>
                <th className="px-4 py-3 font-medium sm:px-6">Year</th>
                <th className="px-4 py-3 font-medium sm:px-6">Order</th>
                <th className="px-4 py-3 font-medium sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {releases.map((r) => (
                <tr key={r.id} className="text-admin-text transition-colors hover:bg-black/[0.02]">
                  <td className="px-4 py-3 sm:px-6">
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin may paste any CDN URL */}
                    <img src={r.cover} alt="" className="h-12 w-12 rounded-md bg-admin-bg object-cover" />
                  </td>
                  <td className="px-4 py-3 font-medium sm:px-6">
                    {r.title}
                    {r.isNew && (
                      <span className="ml-2 rounded bg-admin-accent/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-admin-accent">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{r.type}</td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{r.year}</td>
                  <td className="px-4 py-3 text-admin-muted sm:px-6">{r.order}</td>
                  <td className="px-4 py-3 text-right sm:px-6">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/releases/${r.id}`} className="admin-btn admin-btn-ghost text-[10px]">
                        Edit
                      </Link>
                      <DeleteReleaseButton id={r.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {releases.length === 0 && (
          <p className="px-6 py-12 text-center text-sm text-admin-muted">No releases yet. Add one to replace homepage defaults.</p>
        )}
      </div>
    </div>
  )
}
