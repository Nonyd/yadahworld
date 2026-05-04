import { prisma } from '@/lib/prisma'
import CampusTourStatusBadge from '@/components/admin/campus-tour/CampusTourStatusBadge'

export default async function CampusTourAdminPage() {
  let applications: Awaited<ReturnType<typeof prisma.campusTourApplication.findMany>> = []
  try {
    applications = await prisma.campusTourApplication.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    applications = []
  }

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === 'NEW').length,
    confirmed: applications.filter((a) => a.status === 'CONFIRMED').length,
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 font-playfair text-3xl font-normal" style={{ color: 'var(--body)' }}>
            Campus Tour Applications
          </h1>
          <p className="ui-label" style={{ color: 'var(--muted)' }}>
            {stats.new} new · {stats.total} total
          </p>
        </div>
        <a href="/api/admin/campus-tour/export" className="admin-btn admin-btn-secondary shrink-0 self-start text-[10px]">
          Export CSV
        </a>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total', value: stats.total },
          { label: 'New', value: stats.new },
          { label: 'Confirmed', value: stats.confirmed },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="border p-6"
            style={{
              background: 'var(--bg)',
              borderColor: 'rgba(201,168,76,0.2)',
            }}
          >
            <p className="mb-1 font-playfair text-4xl font-normal" style={{ color: 'var(--accent)' }}>
              {value}
            </p>
            <p className="ui-label" style={{ color: 'var(--muted)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontFamily: 'var(--font-jost)' }}>
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(201,168,76,0.2)' }}>
              {['Date', 'Name', 'Campus', 'Role', 'WhatsApp', 'Email', 'Status'].map((h) => (
                <th key={h} className="ui-label pb-3 pr-4 text-left" style={{ color: 'var(--muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-b transition-colors hover:bg-[var(--surface)]"
                style={{ borderColor: 'rgba(42,37,32,0.06)' }}
              >
                <td className="py-3 pr-4 text-xs" style={{ color: 'var(--muted)' }}>
                  {new Date(app.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="py-3 pr-4 text-sm font-medium" style={{ color: 'var(--body)' }}>
                  {app.fullName}
                </td>
                <td className="py-3 pr-4 text-sm" style={{ color: 'var(--body)' }}>
                  {app.campus}
                </td>
                <td className="py-3 pr-4 text-xs" style={{ color: 'var(--muted)' }}>
                  {app.role}
                </td>
                <td className="py-3 pr-4 text-xs" style={{ color: 'var(--muted)' }}>
                  <a
                    href={`https://wa.me/${app.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[var(--accent)]"
                  >
                    {app.whatsapp}
                  </a>
                </td>
                <td className="py-3 pr-4 text-xs" style={{ color: 'var(--muted)' }}>
                  <a href={`mailto:${app.email}`} className="transition-colors hover:text-[var(--accent)]">
                    {app.email}
                  </a>
                </td>
                <td className="py-3 pr-4">
                  <CampusTourStatusBadge status={app.status} id={app.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {applications.length === 0 && (
          <p className="py-12 text-center ui-label" style={{ color: 'var(--muted)' }}>
            No applications yet.
          </p>
        )}
      </div>
    </div>
  )
}
