import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SyncAllYoutubeButton from '@/components/admin/cms/SyncAllYoutubeButton'
import { formatRelativeTimeAgo } from '@/lib/relative-time'

export default async function AdminOverview() {
  let bookings = 0
  let messages = 0
  let pendingBookings = 0
  let releases = 0
  let events = 0
  let playlists = 0
  let cachedVideos = 0
  let lastSync: Date | null = null

  const safeCount = async (fn: () => Promise<number>) => {
    try {
      return await fn()
    } catch {
      return 0
    }
  }

  const safeMaxSync = async () => {
    try {
      const agg = await prisma.youTubePlaylist.aggregate({
        _max: { lastSyncedAt: true },
      })
      return agg._max.lastSyncedAt
    } catch {
      return null
    }
  }

  bookings = await safeCount(() => prisma.bookingRequest.count())
  messages = await safeCount(() => prisma.contactMessage.count())
  pendingBookings = await safeCount(() => prisma.bookingRequest.count({ where: { status: 'PENDING' } }))
  releases = await safeCount(() => prisma.siteRelease.count())
  events = await safeCount(() => prisma.siteEvent.count())
  playlists = await safeCount(() => prisma.youTubePlaylist.count())
  cachedVideos = await safeCount(() => prisma.cachedVideo.count())
  lastSync = await safeMaxSync()

  const stats = [
    { label: 'Bookings', value: bookings, hint: `${pendingBookings} pending`, href: '/admin/bookings' },
    { label: 'Messages', value: messages, hint: 'Inbox', href: '/admin/messages' },
    { label: 'Releases', value: releases, hint: 'Discography pages', href: '/admin/releases' },
    { label: 'Events', value: events, hint: 'On the road', href: '/admin/events' },
    { label: 'Playlists', value: playlists, hint: 'YouTube sources', href: '/admin/playlists' },
    { label: 'Cached videos', value: cachedVideos, hint: 'Synced from YouTube', href: '/admin/videos' },
  ]

  return (
    <div>
      <header className="mb-10">
        <h1 className="font-playfair text-3xl font-normal tracking-tight text-admin-text md:text-[2rem]">Overview</h1>
        <p className="mt-2 text-sm text-admin-muted">Welcome back. Here is a snapshot of your studio.</p>
        <p className="mt-3 text-sm text-admin-muted">
          Last YouTube sync:{' '}
          <span className="font-medium text-admin-text">{formatRelativeTimeAgo(lastSync)}</span>
        </p>
        <div className="mt-4">
          <SyncAllYoutubeButton className="admin-btn admin-btn-secondary text-[10px]" />
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {stats.map(({ label, value, hint, href }) => (
          <Link
            key={label}
            href={href}
            className="admin-card group block p-6 transition-shadow hover:shadow-md"
          >
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-admin-muted">{label}</p>
            <p className="mt-3 font-playfair text-4xl font-normal text-admin-accent">{value}</p>
            <p className="mt-2 text-xs text-admin-muted">{hint}</p>
            <span className="mt-4 inline-flex items-center text-[10px] font-medium uppercase tracking-wider text-admin-accent opacity-0 transition-opacity group-hover:opacity-100">
              Open →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="admin-card p-6">
          <h2 className="font-playfair text-lg text-admin-text">Content checklist</h2>
          <ul className="mt-4 space-y-3 text-sm text-admin-muted">
            <li className="flex gap-2">
              <span className="text-admin-accent">·</span>
              If the database is new, run <code className="rounded bg-admin-bg px-1 font-mono text-[11px] text-admin-text">npm run db:seed</code> after{' '}
              <code className="rounded bg-admin-bg px-1 font-mono text-[11px] text-admin-text">npx prisma db push</code> to load default releases, events, and YouTube playlists.
            </li>
            <li className="flex gap-2">
              <span className="text-admin-accent">·</span>
              Configure <code className="rounded bg-admin-bg px-1 font-mono text-[11px] text-admin-text">YOUTUBE_API_KEY</code> and use Playlists → Sync all to pull videos into the site.
            </li>
            <li className="flex gap-2">
              <span className="text-admin-accent">·</span>
              Add or edit releases under Releases; use release date for /releases order, and check “Show on homepage” for the home music grid (up to four, by homepage order).
            </li>
            <li className="flex gap-2">
              <span className="text-admin-accent">·</span>
              Keep events dated and toggled active when you want them live.
            </li>
            <li className="flex gap-2">
              <span className="text-admin-accent">·</span>
              Mark contact messages as read after you respond.
            </li>
          </ul>
        </div>
        <div className="admin-card p-6">
          <h2 className="font-playfair text-lg text-admin-text">Shortcuts</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/admin/playlists" className="admin-btn admin-btn-secondary text-[10px]">
              Manage playlists
            </Link>
            <Link href="/admin/releases/new" className="admin-btn admin-btn-secondary text-[10px]">
              New release
            </Link>
            <Link href="/admin/events/new" className="admin-btn admin-btn-secondary text-[10px]">
              New event
            </Link>
            <Link href="/admin/media" className="admin-btn admin-btn-secondary text-[10px]">
              Media preview
            </Link>
            <Link href="/admin/settings" className="admin-btn admin-btn-secondary text-[10px]">
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
