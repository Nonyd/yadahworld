'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle({
  className = '',
  variant = 'public',
}: {
  className?: string
  /** Public navbar vs admin chrome */
  variant?: 'public' | 'admin'
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'
  const base =
    variant === 'admin'
      ? 'rounded-md border border-admin-border bg-admin-surface px-2.5 py-1.5 text-admin-text hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
      : 'rounded-full border border-[rgba(201,168,76,0.35)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)] backdrop-blur-sm hover:border-[rgba(201,168,76,0.55)] hover:text-[var(--body)]'

  if (!mounted) {
    return (
      <span
        className={`inline-flex h-9 min-w-[5.5rem] items-center justify-center ${base} ${className}`}
        aria-hidden
      />
    )
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 transition-colors ${base} ${className}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">{isDark ? 'Light mode' : 'Dark mode'}</span>
      {isDark ? (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1zm0 15a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zm7-8a1 1 0 0 0-1-1h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1zM7 12a1 1 0 0 0-1-1H5a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1zm11.657-6.657a1 1 0 0 0-1.414 0l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414zM8.464 15.536a1 1 0 0 0-1.414 0l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414zm10.607 0a1 1 0 0 0-1.414-1.414l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414zM8.464 8.464a1 1 0 0 0 1.414-1.414l-.707-.707A1 1 0 1 0 7.757 7.05l.707.707a1 1 0 0 0 0 1.414zM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
        </svg>
      ) : (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
