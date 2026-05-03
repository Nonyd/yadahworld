'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
const ADMIN_LINKS: { label: string; href: string; icon: React.ReactNode; badgeKey?: 'bookings' | 'messages' }[] = [
  {
    label: 'Overview',
    href: '/admin',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Bookings',
    href: '/admin/bookings',
    badgeKey: 'bookings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/admin/messages',
    badgeKey: 'messages',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: 'Site settings',
    href: '/admin/settings',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Media preview',
    href: '/admin/media',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    label: 'Videos',
    href: '/admin/videos',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9A2.25 2.25 0 0021.75 15v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 6v9A2.25 2.25 0 004.5 18.75z" />
      </svg>
    ),
  },
  {
    label: 'Releases',
    href: '/admin/releases',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a21.444 21.444 0 01-5.185 0l-1.32-.377a2.25 2.25 0 01-1.632-2.163v-3.75zM9 9V6.75A2.25 2.25 0 0111.25 4.5h9A2.25 2.25 0 0122.5 6.75V9M9 9h6.75A2.25 2.25 0 0118 11.25v6.75M9 9H6.75A2.25 2.25 0 004.5 11.25v6.75" />
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: <span className="text-lg font-normal leading-none text-current">◈</span>,
  },
  {
    label: 'Events',
    href: '/admin/events',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
]

function linkActive(path: string, href: string) {
  if (href === '/admin') return path === '/admin' || path === '/admin/'
  return path === href || path.startsWith(`${href}/`)
}

export default function AdminSidebar({
  onNavigate,
  userLabel,
  pendingBookingsCount = 0,
  unreadMessagesCount = 0,
}: {
  onNavigate?: () => void
  userLabel?: string | null
  pendingBookingsCount?: number
  unreadMessagesCount?: number
}) {
  const path = usePathname()

  const badgeFor = (key?: 'bookings' | 'messages') => {
    if (key === 'bookings' && pendingBookingsCount > 0) return pendingBookingsCount
    if (key === 'messages' && unreadMessagesCount > 0) return unreadMessagesCount
    return 0
  }

  return (
    <aside className="flex h-full min-h-screen flex-col border-admin-border bg-admin-surface shadow-admin-sidebar lg:min-h-0 lg:border-r">
      <div className="border-b border-admin-border px-5 py-6">
        <Link
          href="/admin"
          className="inline-block font-playfair text-2xl font-medium italic text-admin-text"
          aria-label="Admin home"
        >
          Yadah
        </Link>
        <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-admin-muted">Studio</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {ADMIN_LINKS.map(({ label, href, icon, badgeKey }) => {
          const active = linkActive(path, href)
          const n = badgeFor(badgeKey)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onNavigate?.()}
              className={`
                relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${
                  active
                    ? 'bg-admin-accent/15 text-admin-accent ring-1 ring-admin-accent/25'
                    : 'text-admin-text/90 hover:bg-black/[0.03] hover:text-admin-text dark:text-admin-text/85 dark:hover:bg-white/[0.06]'
                }
              `}
            >
              <span className={active ? 'text-admin-accent' : 'text-admin-muted'}>{icon}</span>
              {label}
              {n > 0 ? (
                <span className="absolute right-2 top-1/2 flex h-[18px] min-w-[18px] -translate-y-1/2 items-center justify-center rounded-full bg-accent px-1 font-jost text-[10px] font-medium leading-none text-white">
                  {n > 99 ? '99+' : n}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-admin-border p-4">
        {userLabel && <p className="mb-3 truncate px-1 text-xs text-admin-muted">{userLabel}</p>}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="admin-btn admin-btn-ghost w-full justify-center text-[10px]"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
