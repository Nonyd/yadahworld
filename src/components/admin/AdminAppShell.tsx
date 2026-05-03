'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminAppShell({
  children,
  userLabel,
  pendingBookingsCount = 0,
  unreadMessagesCount = 0,
}: {
  children: React.ReactNode
  userLabel?: string | null
  pendingBookingsCount?: number
  unreadMessagesCount?: number
}) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="admin-app min-h-screen">
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-admin-border bg-admin-surface/95 px-4 py-3 backdrop-blur-md shadow-sm">
        <button
          type="button"
          className="admin-btn admin-btn-secondary px-3 py-2 text-[10px]"
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar"
          onClick={() => setMobileOpen((o) => !o)}
        >
          Menu
        </button>
        <Link
          href="/admin"
          className="flex shrink-0 justify-center font-playfair text-2xl font-medium italic text-admin-text"
          aria-label="Admin home"
        >
          Yadah
        </Link>
        <span className="w-10 shrink-0" aria-hidden />
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-deep/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        <div
          id="admin-sidebar"
          className={`
            fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] transform transition-transform duration-200 ease-out lg:relative lg:z-0 lg:w-56 lg:translate-x-0 lg:shrink-0
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <AdminSidebar
            onNavigate={() => setMobileOpen(false)}
            userLabel={userLabel}
            pendingBookingsCount={pendingBookingsCount}
            unreadMessagesCount={unreadMessagesCount}
          />
        </div>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
