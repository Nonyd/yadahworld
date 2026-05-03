'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const ADMIN_LINKS = [
  { label: 'Overview', href: '/admin', icon: '◉' },
  { label: 'Bookings', href: '/admin/bookings', icon: '◈' },
  { label: 'Messages', href: '/admin/messages', icon: '◇' },
  { label: 'Media', href: '/admin/media', icon: '◫' },
  { label: 'Releases', href: '/admin/releases', icon: '◎' },
  { label: 'Events', href: '/admin/events', icon: '◆' },
  { label: 'Settings', href: '/admin/settings', icon: '◻' },
]

function linkActive(path: string, href: string) {
  if (href === '/admin') return path === '/admin'
  return path === href || path.startsWith(`${href}/`)
}

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside
      className="w-64 min-h-screen shrink-0 flex flex-col px-6 py-8 border-r"
      style={{ background: '#EDE8DF', borderColor: 'rgba(201,168,76,0.2)' }}
    >
      <div className="mb-12">
        <p className="font-playfair text-2xl italic" style={{ color: 'var(--body)' }}>
          Yadah
        </p>
        <p className="ui-label mt-1" style={{ color: 'var(--muted)' }}>
          Admin Dashboard
        </p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {ADMIN_LINKS.map(({ label, href, icon }) => {
          const active = linkActive(path, href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded transition-colors"
              style={{
                background: active ? 'rgba(107,39,55,0.08)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              <span className="text-sm">{icon}</span>
              <span className="ui-label">{label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="btn-ghost mt-8 self-start"
        style={{ color: 'var(--muted)' }}
      >
        Sign Out
      </button>
    </aside>
  )
}
