import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import MessageCard from '@/components/admin/messages/MessageCard'

export default async function MessagesPage() {
  let messages: Awaited<ReturnType<typeof prisma.contactMessage.findMany>> = []
  try {
    messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  } catch {
    messages = []
  }

  return (
    <div>
      <AdminPageHeader title="Messages" description="Contact form submissions from the public site." />
      <ul className="space-y-4">
        {messages.map((m) => (
          <li key={m.id}>
            <MessageCard
              id={m.id}
              subject={m.subject}
              name={m.name}
              email={m.email}
              createdAt={new Date(m.createdAt).toLocaleString('en-GB')}
              message={m.message}
              read={m.read}
            />
          </li>
        ))}
      </ul>
      {messages.length === 0 && <p className="text-sm text-admin-muted">No messages yet.</p>}
    </div>
  )
}
