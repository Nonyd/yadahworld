'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminBrandedLogo from '@/components/admin/AdminBrandedLogo'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminAppShell({
  children,
  userLabel,
  pendingBookingsCount = 0,
  newCampusTourCount = 0,
  unreadMessagesCount = 0,
  logoUrl,
  siteName = 'Yadah',
}: {
  children: React.ReactNode
  userLabel?: string | null
  pendingBookingsCount?: number
  newCampusTourCount?: number
  unreadMessagesCount?: number
  logoUrl: string
  siteName?: string
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
        <Link href="/admin" className="flex shrink-0 justify-center" aria-label="Admin home">
          <AdminBrandedLogo logoUrl={logoUrl} siteName={siteName} width={200} height={48} className="h-8 w-auto" priority />
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
            newCampusTourCount={newCampusTourCount}
            unreadMessagesCount={unreadMessagesCount}
            logoUrl={logoUrl}
            siteName={siteName}
          />
        </div>

        <main className="min-w-0 flex-1 bg-bg px-4 py-8 text-body sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
