'use client'

import type { CSSProperties } from 'react'
import { clearCookieConsent } from '@/lib/cookie-consent'

type Props = {
  children: React.ReactNode
  className?: string
  style?: CSSProperties
}

/** Clears stored consent and reloads so the banner appears again. */
export default function CookiePreferencesButton({ children, className, style }: Props) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => {
        clearCookieConsent()
        window.location.reload()
      }}
    >
      {children}
    </button>
  )
}
