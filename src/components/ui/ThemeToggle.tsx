'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

type Props = {
  className?: string
  /** Navbar uses compact chrome; site = footer / inline; admin = dashboard */
  variant?: 'navbar' | 'site' | 'admin'
  /** When true, icon reads on dark hero (light icon) */
  onDarkBackdrop?: boolean
}

export default function ThemeToggle({ className = '', variant = 'site', onDarkBackdrop }: Props) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  const cycle = () => setTheme(isDark ? 'light' : 'dark')

  const base =
    variant === 'navbar'
      ? `inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
          onDarkBackdrop
            ? 'border-white/25 text-[var(--white)] hover:bg-white/10'
            : 'border-[var(--body)]/15 text-[var(--body)] hover:bg-[var(--surface)]'
        }`
      : variant === 'admin'
        ? 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-admin-border bg-admin-surface text-admin-text shadow-sm transition-colors hover:bg-admin-bg'
        : 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--body)_14%,transparent)] bg-[var(--surface)] text-[var(--body)] shadow-sm transition-colors hover:border-[color-mix(in_srgb,var(--body)_22%,transparent)]'

  if (!mounted) {
    return (
      <span
        className={`${base} ${className}`.trim()}
        aria-hidden
        style={{ width: 36, height: 36 }}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={cycle}
      className={`${base} ${className}`.trim()}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      )}
    </button>
  )
}
