'use client'

type Row = {
  createdAt: string
  method: string
  path: string
  actorEmail: string
  actorId: string
  ipAddress: string
}

export default function ActivityLogExportButton({ rows }: { rows: Row[] }) {
  const onExport = () => {
    const header = ['createdAt', 'method', 'path', 'actorEmail', 'actorId', 'ipAddress']
    const lines = [header.join(',')]
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
    for (const r of rows) {
      lines.push(
        [
          esc(r.createdAt),
          esc(r.method),
          esc(r.path),
          esc(r.actorEmail),
          esc(r.actorId),
          esc(r.ipAddress),
        ].join(','),
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin-activity-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" onClick={onExport} className="admin-btn admin-btn-secondary text-[10px]" disabled={!rows.length}>
      Export CSV
    </button>
  )
}
