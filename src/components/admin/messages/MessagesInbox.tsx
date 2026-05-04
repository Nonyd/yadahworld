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
}

export default function MessagesInbox({ messages }: { messages: InboxMessage[] }) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [markAllBusy, setMarkAllBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
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
