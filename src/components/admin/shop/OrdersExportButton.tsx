'use client'

type Row = {
  orderNumber: string
  createdAt: string
  customerName: string
  customerEmail: string
  items: number
  total: number
  paymentStatus: string
  status: string
}

export default function OrdersExportButton({ rows }: { rows: Row[] }) {
  const onExport = () => {
    const header = ['orderNumber', 'createdAt', 'customerName', 'customerEmail', 'items', 'totalKobo', 'paymentStatus', 'status']
    const lines = [header.join(',')]
    for (const r of rows) {
      const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
      lines.push(
        [
          esc(r.orderNumber),
          esc(r.createdAt),
          esc(r.customerName),
          esc(r.customerEmail),
          String(r.items),
          String(r.total),
          r.paymentStatus,
          r.status,
        ].join(','),
      )
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" onClick={onExport} className="admin-btn admin-btn-secondary text-[10px]" disabled={!rows.length}>
      Export CSV
    </button>
  )
}
