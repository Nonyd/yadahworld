import { prisma } from '@/lib/prisma'

export default async function SubscribersPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const active = subscribers.filter((s) => s.status === 'ACTIVE')
  const unsubscribed = subscribers.filter((s) => s.status === 'UNSUBSCRIBED')

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 font-playfair text-3xl font-normal" style={{ color: 'var(--body)' }}>
            Subscribers
          </h1>
          <p className="ui-label" style={{ color: 'var(--muted)' }}>
            {active.length} active · {unsubscribed.length} unsubscribed
          </p>
        </div>
        <a href="/api/admin/subscribers/export" className="admin-btn admin-btn-secondary shrink-0 text-[10px]">
          Export CSV
        </a>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: 'Total Subscribers', value: subscribers.length },
          { label: 'Active', value: active.length },
          { label: 'Unsubscribed', value: unsubscribed.length },
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
              {['Date', 'Name', 'Email', 'Source', 'Brevo', 'Status'].map((h) => (
                <th key={h} className="ui-label pb-3 pr-6 text-left" style={{ color: 'var(--muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {subscribers.map((sub) => (
              <tr
                key={sub.id}
                className="border-b transition-colors hover:bg-[var(--surface)]"
                style={{ borderColor: 'rgba(42,37,32,0.06)' }}
              >
                <td className="py-3 pr-6 text-sm" style={{ color: 'var(--muted)' }}>
                  {new Date(sub.createdAt).toLocaleDateString('en-GB')}
                </td>
                <td className="py-3 pr-6 text-sm font-medium" style={{ color: 'var(--body)' }}>
                  {sub.name ?? '—'}
                </td>
                <td className="py-3 pr-6 text-sm" style={{ color: 'var(--body)' }}>
                  {sub.email}
                </td>
                <td className="py-3 pr-6 text-sm" style={{ color: 'var(--muted)' }}>
                  {sub.source ?? '—'}
                </td>
                <td className="py-3 pr-6">
                  <span
                    className="ui-label px-2 py-1 text-[10px]"
                    style={{
                      background: sub.brevoSynced ? 'rgba(40,100,40,0.1)' : 'rgba(139,105,20,0.1)',
                      color: sub.brevoSynced ? '#2D6A2D' : 'var(--gold)',
                    }}
                  >
                    {sub.brevoSynced ? 'Synced' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 pr-6">
                  <span
                    className="ui-label px-2 py-1 text-[10px]"
                    style={{
                      background: sub.status === 'ACTIVE' ? 'rgba(40,100,40,0.1)' : 'rgba(107,39,55,0.1)',
                      color: sub.status === 'ACTIVE' ? '#2D6A2D' : 'var(--accent)',
                    }}
                  >
                    {sub.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subscribers.length === 0 && (
          <p className="py-12 text-center ui-label" style={{ color: 'var(--muted)' }}>
            No subscribers yet.
          </p>
        )}
      </div>
    </div>
  )
}
