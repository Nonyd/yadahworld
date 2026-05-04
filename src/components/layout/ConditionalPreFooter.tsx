'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Hides the pre-footer CTA strip on pages where it would duplicate in-page content (e.g. /gospel). */
export default function ConditionalPreFooter({ children }: { children: ReactNode }) {
  const path = usePathname()
  if (path === '/gospel' || path === '/gospel/') return null
  return <>{children}</>
}
