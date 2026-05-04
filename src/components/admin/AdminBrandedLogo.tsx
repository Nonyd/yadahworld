'use client'

import type { CSSProperties } from 'react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTheme } from 'next-themes'

/**
 * Site logo asset is tuned for dark backgrounds (light mark). Admin chrome is mostly light
 * surfaces, so we invert to a dark mark unless the user has switched admin to dark theme.
 */
export default function AdminBrandedLogo({
  logoUrl,
  siteName,
  className,
  width,
  height,
  priority,
}: {
  logoUrl: string
  siteName: string
  className?: string
  width: number
  height: number
  priority?: boolean
}) {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const style: CSSProperties | undefined = isDark ? undefined : { filter: 'brightness(0)' }

  return (
    <Image
      src={logoUrl}
      alt={siteName}
      width={width}
      height={height}
      className={className}
      style={style}
      priority={priority}
    />
  )
}
