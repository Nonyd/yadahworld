'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'

export type InboxMessage = {
  id: string
  createdAt: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
}

export default function MessagesInbox({ messages }: { messages: InboxMessage[] }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [markAllBusy, setMarkAllBusy] = useState(false)

  const markRead = async (id: string, read: boolean) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  const markAllRead = async () => {
    setMarkAllBusy(true)
    try {
      const res = await fetch('/api/admin/messages/mark-all-read', { method: 'POST' })
      if (!res.ok) throw new Error()
      router.refresh()
    } finally {
      setMarkAllBusy(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          disabled={markAllBusy}
          onClick={() => void markAllRead()}
          className="admin-btn admin-btn-secondary text-[10px]"
        >
          {markAllBusy ? 'Updating…' : 'Mark all as read'}
        </button>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-wider text-admin-muted">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => {
              const open = expanded === m.id
              return (
                <Fragment key={m.id}>
                  <tr
                    onClick={() => setExpanded((id) => (id === m.id ? null : m.id))}
                    className={`cursor-pointer border-b border-admin-border/80 transition-colors hover:bg-admin-bg/60 ${
                      !m.read ? 'border-l-4 border-l-admin-accent bg-admin-accent/[0.04]' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-admin-muted">{m.createdAt}</td>
                    <td className="px-4 py-3 text-admin-text">{m.name}</td>
                    <td className="px-4 py-3 text-admin-muted">{m.email}</td>
                    <td className={`px-4 py-3 ${!m.read ? 'font-semibold text-admin-text' : 'text-admin-text'}`}>{m.subject}</td>
                    <td className="px-4 py-3 text-admin-muted">{m.read ? 'Read' : 'Unread'}</td>
                    <td className="px-4 py-3 text-right text-[10px] uppercase tracking-wider text-admin-muted">{open ? 'Close' : 'Open'}</td>
                  </tr>
                  {open && (
                    <tr className="border-b border-admin-border bg-admin-bg/40">
                      <td colSpan={6} className="px-4 py-6">
                        <blockquote className="border-l-2 border-admin-border pl-4 text-sm leading-relaxed text-admin-text/90 whitespace-pre-wrap">
                          {m.message}
                        </blockquote>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={busyId === m.id || m.read}
                            onClick={(e) => {
                              e.stopPropagation()
                              void markRead(m.id, true)
                            }}
                            className="admin-btn admin-btn-secondary text-[10px]"
                          >
                            Mark as read
                          </button>
                          <a
                            href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject}`)}`}
                            className="admin-btn admin-btn-ghost text-[10px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Reply
                          </a>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
