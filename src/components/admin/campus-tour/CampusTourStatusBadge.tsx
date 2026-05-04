'use client'

import { useEffect, useState } from 'react'
import type { CampusTourStatus } from '@prisma/client'

const STATUSES: CampusTourStatus[] = ['NEW', 'REVIEWING', 'CONFIRMED', 'DECLINED']

export default function CampusTourStatusBadge({ status: initial, id }: { status: CampusTourStatus; id: string }) {
  const [status, setStatus] = useState(initial)

  useEffect(() => {
    setStatus(initial)
  }, [initial])
  const [busy, setBusy] = useState(false)

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as CampusTourStatus
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/campus-tour/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) setStatus(next)
      else e.target.value = status
    } catch {
      e.target.value = status
    } finally {
      setBusy(false)
    }
  }

  return (
    <select
      value={status}
      onChange={onChange}
      disabled={busy}
      className="admin-input max-w-[10rem] py-1.5 text-xs"
      aria-label="Application status"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
