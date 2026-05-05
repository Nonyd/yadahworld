'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

type ScanState = 'idle' | 'SUCCESS' | 'INVALID' | 'ALREADY_CHECKED_IN' | 'UNPAID' | 'WRONG_EVENT'

function extractTicketCode(raw: string): string {
  const t = raw.trim()
  try {
    const u = new URL(t)
    const parts = u.pathname.split('/').filter(Boolean)
    const i = parts.indexOf('tickets')
    if (i >= 0 && parts[i + 1]) return parts[i + 1]
    return parts[parts.length - 1] ?? t
  } catch {
    return t
  }
}

export default function CheckInScanner({
  eventId,
  initialCheckedInToday,
  initialTotalRegistered,
}: {
  eventId: string
  initialCheckedInToday: number
  initialTotalRegistered: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const busyRef = useRef(false)
  const handlerRef = useRef<(raw: string) => Promise<void>>(async () => {})

  const [scanState, setScanState] = useState<ScanState>('idle')
  const [detail, setDetail] = useState('')
  const [manual, setManual] = useState('')
  const [checkedToday, setCheckedToday] = useState(initialCheckedInToday)

  handlerRef.current = async (raw: string) => {
    if (busyRef.current) return
    const ticketCode = extractTicketCode(raw)
    if (!ticketCode) return
    busyRef.current = true
    try {
      const res = await fetch('/api/admin/events/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode, eventId }),
      })
      const json = (await res.json()) as {
        success?: boolean
        status?: string
        message?: string
        name?: string
        tier?: string
      }
      if (json.success && json.status === 'SUCCESS') {
        setScanState('SUCCESS')
        setDetail(`${json.name ?? ''} · ${json.tier ?? ''}`.trim())
        setCheckedToday((n) => n + 1)
      } else if (json.status === 'ALREADY_CHECKED_IN') {
        setScanState('ALREADY_CHECKED_IN')
        setDetail(json.name ?? json.message ?? '')
      } else if (json.status === 'UNPAID') {
        setScanState('UNPAID')
        setDetail(json.name ?? json.message ?? '')
      } else if (json.status === 'WRONG_EVENT') {
        setScanState('WRONG_EVENT')
        setDetail(json.message ?? '')
      } else {
        setScanState('INVALID')
        setDetail(json.message ?? 'Invalid ticket')
      }
    } catch {
      setScanState('INVALID')
      setDetail('Request failed')
    }
    setTimeout(() => {
      setScanState('idle')
      setDetail('')
      busyRef.current = false
    }, 3000)
  }

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    const videoEl = videoRef.current
    if (!videoEl) return

    let cancelled = false

    const run = async () => {
      try {
        await reader.decodeFromVideoDevice(null, videoEl, (result) => {
          if (cancelled || busyRef.current || !result) return
          void handlerRef.current(result.getText())
        })
      } catch (e) {
        console.error(e)
      }
    }

    void run()

    return () => {
      cancelled = true
      reader.reset()
    }
  }, [eventId])

  const overlayColor =
    scanState === 'SUCCESS'
      ? 'rgba(40,100,40,0.85)'
      : scanState === 'idle'
        ? 'transparent'
        : scanState === 'WRONG_EVENT'
          ? 'rgba(139,105,20,0.88)'
          : scanState === 'ALREADY_CHECKED_IN'
            ? 'rgba(180,130,20,0.88)'
            : 'rgba(107,39,55,0.88)'

  return (
    <div className="flex min-h-[70vh] flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-admin-border bg-black/[0.03] p-4 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">Checked in today</p>
          <p className="font-playfair text-3xl text-admin-accent">{checkedToday}</p>
        </div>
        <div className="rounded-lg border border-admin-border bg-black/[0.03] p-4 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted">Total registered (confirmed)</p>
          <p className="font-playfair text-3xl text-admin-text">{initialTotalRegistered}</p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-lg border border-admin-border bg-black">
        <video ref={videoRef} className="aspect-[4/3] w-full object-cover" muted playsInline />
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center transition-colors duration-300"
          style={{ background: overlayColor }}
        >
          {scanState !== 'idle' && (
            <>
              <p className="text-lg font-medium text-white">
                {scanState === 'SUCCESS' && '✓ Check-in successful'}
                {scanState === 'ALREADY_CHECKED_IN' && 'Already checked in'}
                {scanState === 'UNPAID' && 'Payment pending'}
                {scanState === 'INVALID' && 'Invalid ticket'}
                {scanState === 'WRONG_EVENT' && 'Wrong event'}
              </p>
              {detail && <p className="text-sm text-white/90">{detail}</p>}
            </>
          )}
        </div>
      </div>

      <form
        className="mx-auto flex w-full max-w-lg gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          void handlerRef.current(manual)
          setManual('')
        }}
      >
        <input
          className="admin-input flex-1"
          placeholder="Enter ticket code manually"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
        />
        <button type="submit" className="admin-btn admin-btn-primary shrink-0 text-[10px]">
          Submit
        </button>
      </form>
      <p className="text-center text-xs text-admin-muted">
        Scanner accepts QR URLs or raw ticket codes for this event only. (Total confirmed: {initialTotalRegistered})
      </p>
    </div>
  )
}
