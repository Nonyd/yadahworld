import { prisma } from '@/lib/prisma'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import MessagesInbox, { type InboxMessage } from '@/components/admin/messages/MessagesInbox'

export default async function MessagesPage() {
  let messages: Awaited<ReturnType<typeof prisma.contactMessage.findMany>> = []
  try {
    messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  } catch {
    messages = []
  }

  const rows: InboxMessage[] = messages.map((m) => ({
    id: m.id,
    createdAt: new Date(m.createdAt).toLocaleString('en-GB'),
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    read: m.read,
    replies: m.replies.map((r) => ({
      id: r.id,
      createdAt: new Date(r.createdAt).toLocaleString('en-GB'),
      subject: r.subject,
      message: r.message,
      sentByEmail: r.sentByEmail ?? '',
    })),
  }))

  return (
    <div>
      <AdminPageHeader title="Messages" description="Contact form submissions from the public site." />
      {messages.length === 0 ? (
        <p className="text-sm text-admin-muted">No messages yet.</p>
      ) : (
        <MessagesInbox messages={rows} />
      )}
    </div>
  )
}
