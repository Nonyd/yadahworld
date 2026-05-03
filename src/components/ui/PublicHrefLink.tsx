import Link from 'next/link'

/** Internal Next `Link`, or external `<a>` when `href` is absolute http(s). */
export default function PublicHrefLink({
  href,
  className,
  style,
  children,
  ...rest
}: {
  href: string
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const h = href.trim() || '#'
  if (/^https?:\/\//i.test(h)) {
    return (
      <a href={h} target="_blank" rel="noopener noreferrer" className={className} style={style}>
        {children}
      </a>
    )
  }
  return (
    <Link href={h} className={className} style={style}>
      {children}
    </Link>
  )
}
