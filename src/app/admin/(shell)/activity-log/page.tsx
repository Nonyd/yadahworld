import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import ActivityLogExportButton from '@/components/admin/ActivityLogExportButton'

export default async function AdminActivityLogPage() {
  let logs: {
    id: string
    createdAt: Date
    method: string
    path: string
    actorEmail: string | null
    actorId: string | null
    ipAddress: string | null
  }[] = []

  let loadError: string | null = null
  try {
    logs = await prisma.adminActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2000,
    })
  } catch {
    loadError = 'Could not load activity data. Ensure your database schema includes the AdminActivityLog table, then try again.'
    logs = []
  }

  const exportRows = logs.map((r) => ({
    createdAt: r.createdAt.toISOString(),
    method: r.method,
    path: r.path,
    actorEmail: r.actorEmail ?? '',
    actorId: r.actorId ?? '',
    ipAddress: r.ipAddress ?? '',
  }))

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <AdminPageHeader title="Activity log" />
        <ActivityLogExportButton rows={exportRows} />
      </div>

      {loadError ? (
        <p className="text-sm text-red-700">{loadError}</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-admin-muted">No activity recorded yet.</p>
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-wider text-admin-muted">
                <th className="px-4 py-3">Time (UTC)</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((r) => (
                <tr key={r.id} className="border-b border-admin-border/80 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-admin-muted">{r.createdAt.toISOString().replace('T', ' ').slice(0, 19)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-admin-text">{r.method}</td>
                  <td className="max-w-[420px] break-all px-4 py-3 font-mono text-xs text-admin-text">{r.path}</td>
                  <td className="max-w-[220px] break-all px-4 py-3 text-admin-muted">{r.actorEmail ?? '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-admin-muted">{r.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
