import Image from 'next/image'

const LOGO_SRC = '/branding/yadah-logo.png'

export type YadahLogoTreatment = 'onDarkHero' | 'inDarkPill' | 'admin'

/** Asset is white-on-black. Hero: as-is. Light chrome: invert → black-on-white; dark theme: restore original. */
const treatmentClass: Record<YadahLogoTreatment, string> = {
  onDarkHero: '',
  inDarkPill: 'invert dark:invert-0',
  admin: 'invert dark:invert-0',
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
