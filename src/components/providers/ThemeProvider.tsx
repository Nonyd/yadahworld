'use client'

/** Site is light-only; no theme switching (next-themes removed). */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
