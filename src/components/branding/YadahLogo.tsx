import Image from 'next/image'

const LOGO_SRC = '/branding/yadah-logo.png'

export type YadahLogoTreatment = 'onDarkHero' | 'inDarkPill' | 'admin'

/** Transparent white wordmark: plain on dark hero; dark glyph on light chrome via brightness in light mode only */
const treatmentClass: Record<YadahLogoTreatment, string> = {
  onDarkHero: '',
  inDarkPill: 'brightness-0 dark:brightness-100',
  admin: 'brightness-0 dark:brightness-100',
}

export default function YadahLogo({
  alt = 'Yadah',
  treatment,
  className = '',
  height = 32,
  priority = false,
}: {
  alt?: string
  treatment: YadahLogoTreatment
  className?: string
  /** CSS height in px for the image */
  height?: number
  priority?: boolean
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={alt}
      width={320}
      height={120}
      className={`w-auto ${treatmentClass[treatment]} ${className}`.trim()}
      style={{ height, width: 'auto' }}
      priority={priority}
    />
  )
}
