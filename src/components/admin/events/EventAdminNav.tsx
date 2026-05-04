'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { EventStatus } from '@prisma/client'

function navClass(active: boolean) {
  return `text-[10px] font-medium uppercase tracking-[0.14em] px-3 py-2 rounded-md transition-colors ${
    active ? 'bg-admin-accent/15 text-admin-accent ring-1 ring-admin-accent/20' : 'text-admin-muted hover:text-admin-text'
  }`
}

export default function EventAdminNav({ eventId, status }: { eventId: string; status: EventStatus }) {
  const path = usePathname()
  const base = `/admin/events/${eventId}`
  const [hash, setHash] = useState('')

  useEffect(() => {
    setHash(typeof window !== 'undefined' ? window.location.hash : '')
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [path])

  const items: { href: string; label: string; isActive: (p: string, h: string) => boolean }[] = [
    {
      href: base,
      label: 'Overview',
      isActive: (p, h) => p === base && h !== '#email-blast',
    },
    {
      href: `${base}/registrations`,
      label: 'Registrations',
      isActive: (p) => p.startsWith(`${base}/registrations`),
    },
    {
      href: `${base}/checkin`,
      label: 'Check-in',
      isActive: (p) => p.startsWith(`${base}/checkin`),
    },
    {
      href: `${base}#email-blast`,
      label: 'Email blast',
      isActive: (p, h) => p === base && h === '#email-blast',
    },
  ]

  if (status === 'COMING_SOON') {
    items.push({
      href: `${base}/interests`,
      label: 'Interested',
      isActive: (p) => p.startsWith(`${base}/interests`),
    })
  }

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-admin-border pb-4">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className={navClass(item.isActive(path, hash))}>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
