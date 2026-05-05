'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export type InboxMessage = {
  id: string
  createdAt: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  replies: {
    id: string
    createdAt: string
    subject: string
    message: string
    sentByEmail: string
  }[]
}

export default function MessagesInbox({ messages }: { messages: InboxMessage[] }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [markAllBusy, setMarkAllBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null)
  const [replySubject, setReplySubject] = useState<Record<string, string>>({})
  const [replyMessage, setReplyMessage] = useState<Record<string, string>>({})
  const [replyBusyId, setReplyBusyId] = useState<string | null>(null)
  const [replyMsg, setReplyMsg] = useState<Record<string, string>>({})
  const selectAllRef = useRef<HTMLInputElement>(null)

  const allSelected = messages.length > 0 && selectedIds.length === messages.length
  const someSelected = selectedIds.length > 0 && !allSelected

  useEffect(() => {
    const el = selectAllRef.current
    if (el) el.indeterminate = someSelected
  }, [someSelected])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([])
    else setSelectedIds(messages.map((m) => m.id))
  }

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

  const deleteOne = async (id: string) => {
    if (!confirm('Delete this message? This cannot be undone.')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setSelectedIds((prev) => prev.filter((x) => x !== id))
      if (expanded === id) setExpanded(null)
      router.refresh()
    } finally {
      setBusyId(null)
    }
  }

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} message(s)? This cannot be undone.`)) return
    setDeleteBusy(true)
    try {
      const res = await fetch('/api/admin/messages/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      if (!res.ok) throw new Error()
      setSelectedIds([])
      setExpanded(null)
      router.refresh()
    } finally {
      setDeleteBusy(false)
    }
  }

  const colCount = 7

  const sendReply = async (message: InboxMessage) => {
    const subject = replySubject[message.id] ?? `Re: ${message.subject}`
    const body = replyMessage[message.id] ?? `Dear ${message.name},\n\n`
    setReplyBusyId(message.id)
    setReplyMsg((prev) => ({ ...prev, [message.id]: '' }))
    try {
      const res = await fetch(`/api/admin/messages/${message.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message: body }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error || 'Could not send reply.')
      }
      setReplyMsg((prev) => ({ ...prev, [message.id]: `Reply sent to ${message.email}.` }))
      setReplyOpenId(null)
      router.refresh()
    } catch (error) {
      setReplyMsg((prev) => ({
        ...prev,
        [message.id]: error instanceof Error ? error.message : 'Could not send reply.',
      }))
    } finally {
      setReplyBusyId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={deleteBusy || selectedIds.length === 0}
          onClick={() => void deleteSelected()}
          className="admin-btn admin-btn-secondary text-[10px] text-red-800 ring-1 ring-red-200 hover:bg-red-50"
        >
          Delete selected{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
        </button>
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
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border text-[10px] font-medium uppercase tracking-wider text-admin-muted">
              <th className="w-10 px-2 py-3 sm:px-3">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-admin-border"
                  aria-label="Select all"
                />
              </th>
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
                    <td className="px-2 py-3 sm:px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleSelect(m.id)}
                        className="h-4 w-4 rounded border-admin-border"
                        aria-label={`Select message from ${m.name}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-admin-muted">{m.createdAt}</td>
                    <td className="px-4 py-3 text-admin-text">{m.name}</td>
                    <td className="px-4 py-3 text-admin-muted">{m.email}</td>
                    <td className={`px-4 py-3 ${!m.read ? 'font-semibold text-admin-text' : 'text-admin-text'}`}>{m.subject}</td>
                    <td className="px-4 py-3 text-admin-muted">{m.read ? 'Read' : 'Unread'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-admin-muted">{open ? 'Close' : 'Open'}</span>
                        <button
                          type="button"
                          disabled={busyId === m.id || deleteBusy}
                          onClick={(e) => {
                            e.stopPropagation()
                            void deleteOne(m.id)
                          }}
                          className="text-[10px] font-medium uppercase tracking-wider text-red-700 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {open && (
                    <tr className="border-b border-admin-border bg-admin-bg/40">
                      <td colSpan={colCount} className="px-4 py-6">
                        <div className="space-y-3">
                          <div className="rounded-lg border border-admin-border bg-white p-4">
                            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted">From {m.name}</p>
                            <blockquote className="border-l-2 border-admin-border pl-4 text-sm leading-relaxed text-admin-text/90 whitespace-pre-wrap">
                              {m.message}
                            </blockquote>
                            <p className="mt-2 text-[11px] text-admin-muted">{m.createdAt}</p>
                          </div>
                          {m.replies.map((reply) => (
                            <div key={reply.id} className="rounded-lg border border-admin-border bg-admin-bg/20 p-4">
                              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted">
                                Admin reply{reply.sentByEmail ? ` • ${reply.sentByEmail}` : ''}
                              </p>
                              <p className="text-xs text-admin-muted">{reply.subject}</p>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-admin-text/90">{reply.message}</p>
                              <p className="mt-2 text-[11px] text-admin-muted">{reply.createdAt}</p>
                            </div>
                          ))}
                        </div>
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
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation()
                              setReplyOpenId((id) => (id === m.id ? null : m.id))
                              setReplySubject((prev) => ({
                                ...prev,
                                [m.id]: prev[m.id] ?? `Re: ${m.subject}`,
                              }))
                              setReplyMessage((prev) => ({
                                ...prev,
                                [m.id]: prev[m.id] ?? `Dear ${m.name},\n\n`,
                              }))
                            }}
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            disabled={busyId === m.id || deleteBusy}
                            onClick={(e) => {
                              e.stopPropagation()
                              void deleteOne(m.id)
                            }}
                            className="admin-btn admin-btn-ghost text-[10px] text-red-700"
                          >
                            Delete message
                          </button>
                        </div>
                        {replyMsg[m.id] && <p className="mt-3 text-sm text-admin-muted">{replyMsg[m.id]}</p>}
                        {replyOpenId === m.id && (
                          <form
                            className="mt-4 space-y-3 border-t border-admin-border pt-4"
                            onSubmit={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              void sendReply(m)
                            }}
                          >
                            <div>
                              <label className="admin-label">Reply subject</label>
                              <input
                                className="admin-input"
                                value={replySubject[m.id] ?? ''}
                                onChange={(e) =>
                                  setReplySubject((prev) => ({
                                    ...prev,
                                    [m.id]: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="admin-label">Reply message</label>
                              <textarea
                                className="admin-input min-h-[120px] resize-y"
                                rows={5}
                                value={replyMessage[m.id] ?? ''}
                                onChange={(e) =>
                                  setReplyMessage((prev) => ({
                                    ...prev,
                                    [m.id]: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <button type="submit" disabled={replyBusyId === m.id} className="admin-btn admin-btn-primary text-[10px]">
                              {replyBusyId === m.id ? 'Sending…' : 'Send reply'}
                            </button>
                          </form>
                        )}
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
