'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import YadahLogo from '@/components/branding/YadahLogo'
import ThemeToggle from '@/components/ui/ThemeToggle'

const MAIN_LINKS: { label: string; href: string; icon: React.ReactNode }[] = [
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
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/admin/messages',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
]

const PAGE_LINKS: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: 'Home page',
    href: '/admin/pages/home',
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: 'Media',
    href: '/admin/pages/media',
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    label: 'About',
    href: '/admin/pages/about',
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    label: 'Contact',
    href: '/admin/pages/contact',
    icon: (
      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
]

const CATALOG_LINKS: { label: string; href: string; icon: React.ReactNode }[] = [
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
    label: 'Videos',
    href: '/admin/videos',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9A2.25 2.25 0 0021.75 15v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 6v9A2.25 2.25 0 004.5 18.75z" />
      </svg>
    ),
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
  {
    label: 'Media preview',
    href: '/admin/media',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
]

function linkActive(path: string, href: string) {
  if (href === '/admin') return path === '/admin' || path === '/admin/'
  return path === href || path.startsWith(`${href}/`)
}

function pagesSectionActive(path: string) {
  return PAGE_LINKS.some(({ href }) => linkActive(path, href))
}

export default function AdminSidebar({
  onNavigate,
  userLabel,
}: {
  onNavigate?: () => void
  userLabel?: string | null
}) {
  const path = usePathname()
  const [pagesOpen, setPagesOpen] = useState(true)

  useEffect(() => {
    if (path?.startsWith('/admin/pages')) setPagesOpen(true)
  }, [path])

  const renderLink = (href: string, label: string, icon: React.ReactNode, nested = false) => {
    const active = linkActive(path, href)
    return (
      <Link
        key={href}
        href={href}
        onClick={() => onNavigate?.()}
        className={`
          flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-colors
          ${nested ? 'pl-2 pr-3' : 'px-3'}
          ${
            active
              ? 'bg-admin-accent/15 text-admin-accent ring-1 ring-admin-accent/25'
              : nested
                ? 'text-admin-text/90 hover:bg-white/[0.05] hover:text-admin-text dark:text-admin-text/85'
                : 'text-admin-muted hover:bg-black/[0.03] hover:text-admin-text dark:hover:bg-white/[0.06]'
          }
        `}
      >
        <span className={active ? 'text-admin-accent' : nested ? 'text-admin-muted' : 'text-admin-muted'}>{icon}</span>
        {label}
      </Link>
    )
  }

  return (
    <aside className="flex h-full min-h-screen flex-col border-admin-border bg-admin-surface shadow-admin-sidebar lg:min-h-0 lg:border-r">
      <div className="border-b border-admin-border px-5 py-6">
        <Link href="/admin" className="inline-block" aria-label="Admin home">
          <YadahLogo alt="Yadah Studio" treatment="admin" height={26} />
        </Link>
        <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-admin-muted">Studio</p>
        <div className="mt-4">
          <ThemeToggle variant="admin" />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {MAIN_LINKS.map(({ label, href, icon }) => renderLink(href, label, icon))}

        <div className="mt-3 border-t border-admin-border pt-3">
          <button
            type="button"
            onClick={() => setPagesOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold tracking-wide text-admin-text"
            aria-expanded={pagesOpen}
          >
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5 text-admin-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Pages
            </span>
            <svg
              className={`h-4 w-4 shrink-0 text-admin-muted transition-transform ${pagesOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {pagesOpen && (
            <div
              className={`mt-1 space-y-0.5 border-l-2 pl-3 ${pagesSectionActive(path) ? 'border-admin-accent/50' : 'border-admin-border'}`}
              style={{ marginLeft: '10px' }}
            >
              {PAGE_LINKS.map(({ label, href, icon }) => renderLink(href, label, icon, true))}
            </div>
          )}
        </div>

        <div className="mt-3 border-t border-admin-border pt-3">
          <p className="mb-2 px-3 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-admin-muted">Catalogue</p>
          {CATALOG_LINKS.map(({ label, href, icon }) => renderLink(href, label, icon))}
        </div>

        <div className="mt-3 border-t border-admin-border pt-3">{renderLink('/admin/settings', 'All settings', (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ))}</div>
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
