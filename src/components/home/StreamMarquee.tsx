import { getCopyString, type SiteCopy } from '@/lib/site-copy'

export default function StreamMarquee({ copy }: { copy: SiteCopy }) {
  const raw = getCopyString(copy, 'home.streamMarqueeLines')
  const items = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  if (!items.length) return null

  return (
    <section style={{ background: 'var(--surface)' }} className="py-6 overflow-hidden">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={`${item}-${i}`} className="px-8 whitespace-nowrap">
            {item.startsWith('·') ? (
              <span className="ui-label" style={{ color: 'var(--gold)' }}>
                {item}
              </span>
            ) : (
              <span className="font-playfair italic text-lg" style={{ color: 'var(--body)', opacity: 0.5 }}>
                {item}
              </span>
            )}
          </span>
        ))}
      </div>
    </section>
  )
}
