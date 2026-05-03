export type YadahLogoTreatment = 'onDarkHero' | 'inDarkPill' | 'admin'

const treatmentText: Record<YadahLogoTreatment, string> = {
  onDarkHero: 'text-[var(--white)]',
  inDarkPill: 'text-[var(--body)] dark:text-[var(--white)]',
  admin: 'text-admin-text',
}

/**
 * Vector wordmark — no bitmap, no white box. Color follows theme via `currentColor`.
 */
export default function YadahLogo({
  alt = 'Yadah',
  treatment,
  className = '',
  height = 40,
  priority: _priority,
}: {
  alt?: string
  treatment: YadahLogoTreatment
  className?: string
  /** Approximate cap height in px */
  height?: number
  /** Ignored — kept for call-site compatibility with the old Next/Image logo. */
  priority?: boolean
}) {
  void _priority
  const w = Math.round(height * 3.2)

  return (
    <svg
      role="img"
      aria-label={alt}
      width={w}
      height={height}
      viewBox="0 0 200 52"
      className={`shrink-0 overflow-visible ${treatmentText[treatment]} ${className}`.trim()}
      style={{ height, width: 'auto' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{alt}</title>
      <text
        x="0"
        y="40"
        fontFamily="var(--font-playfair), 'Playfair Display', Georgia, serif"
        fontSize="44"
        fontStyle="italic"
        fontWeight="500"
        letterSpacing="-0.02em"
        fill="currentColor"
      >
        Yadah
      </text>
    </svg>
  )
}
