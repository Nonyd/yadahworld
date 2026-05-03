import Image from 'next/image'

const LOGO_SRC = '/branding/yadah-logo.png'

export type YadahLogoTreatment = 'onDarkHero' | 'inDarkPill' | 'admin'

const treatmentClass: Record<YadahLogoTreatment, string> = {
  /** White-on-black asset blends into dark photography / hero */
  onDarkHero: 'mix-blend-screen',
  /** Logo sits on a near-black chip (works on light or dark chrome) */
  inDarkPill: '',
  /** Admin chrome — same pill idea, sized for sidebar */
  admin: '',
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
  const img = (
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

  if (treatment === 'inDarkPill' || treatment === 'admin') {
    const pad = treatment === 'admin' ? 'px-3 py-2' : 'px-3 py-1.5'
    return (
      <span className={`inline-flex items-center justify-center rounded-md bg-[#0d0b08] ${pad}`} aria-hidden={false}>
        {img}
      </span>
    )
  }

  return img
}
