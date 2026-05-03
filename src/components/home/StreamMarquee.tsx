export default function StreamMarquee() {
  const items = [
    'Beyond Me',
    '· 100M+ Streams ·',
    'Onye Nwere Jesus',
    '· God in All Seasons ·',
    'Fathered By The Best',
    '· Never Seen ·',
    'Free of Charge',
    '· Na Your Hand ·',
  ]

  return (
    <section style={{ background: 'var(--surface)' }} className="py-6 overflow-hidden border-y border-[var(--gold-light)]/20">
      <div className="marquee-track">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="px-8 whitespace-nowrap">
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
