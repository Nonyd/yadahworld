import { prisma } from '@/lib/prisma'

export default async function MessagesPage() {
  let messages: Awaited<ReturnType<typeof prisma.contactMessage.findMany>> = []
  try {
    messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  } catch {
    messages = []
  }

  return (
    <div>
      <h1 className="font-playfair text-3xl mb-8" style={{ color: 'var(--body)' }}>
        Messages
      </h1>
      <ul className="space-y-6 max-w-3xl">
        {messages.map((m) => (
          <li key={m.id} className="border-b pb-6" style={{ borderColor: 'rgba(42,37,32,0.08)' }}>
            <p className="font-playfair text-lg text-body">{m.subject}</p>
            <p className="ui-label mt-1" style={{ color: 'var(--muted)' }}>
              {m.name} · {m.email} · {new Date(m.createdAt).toLocaleString('en-GB')}
            </p>
            <p className="body-sm mt-3 whitespace-pre-wrap">{m.message}</p>
          </li>
        ))}
      </ul>
      {messages.length === 0 && (
        <p className="ui-label" style={{ color: 'var(--muted)' }}>
          No messages yet.
        </p>
      )}
    </div>
  )
}
