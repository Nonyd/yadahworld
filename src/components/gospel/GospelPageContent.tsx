import Link from 'next/link'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'

function ScriptureQuote({ text, cite }: { text: string; cite: string }) {
  return (
    <blockquote className="border-l-2 border-[var(--gold)] pl-6 my-8 font-baskerville italic text-lg text-[var(--body)]">
      {text}
      <cite className="font-jost text-xs tracking-widest uppercase text-[var(--gold)] mt-3 block not-italic">{cite}</cite>
    </blockquote>
  )
}

export default function GospelPageContent({ copy }: { copy: SiteCopy }) {
  const g = (k: string) => getCopyString(copy, `gospelPage.${k}`)

  return (
    <div className="min-h-screen" style={{ background: 'var(--white)' }}>
      <article className="mx-auto max-w-2xl pt-40 pb-32 px-8 text-[var(--body)]">
        <header className="text-center mb-20">
          <p className="eyebrow mb-6">{g('heroEyebrow')}</p>
          <h1 className="font-playfair text-[clamp(2.25rem,6vw,3.5rem)] font-normal leading-tight text-[var(--body)]">
            {g('heroTitle')}
          </h1>
        </header>

        <section>
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)]">{g('section1Body')}</p>
          <ScriptureQuote text={g('scripture1Text')} cite={g('scripture1Cite')} />
        </section>

        <section className="mt-16">
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)]">{g('section2Body')}</p>
          <ScriptureQuote text={g('scripture2Text')} cite={g('scripture2Cite')} />
        </section>

        <section className="mt-16">
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)]">{g('section3Body')}</p>
          <ScriptureQuote text={g('scripture3Text')} cite={g('scripture3Cite')} />
        </section>

        <section className="mt-20 border-t border-[rgba(42,37,32,0.12)] pt-16 text-center">
          <p className="eyebrow mb-8">{g('prayerEyebrow')}</p>
          <p
            className="font-playfair text-xl md:text-2xl font-normal italic leading-relaxed text-[var(--body)] max-w-xl mx-auto whitespace-pre-line"
          >
            {g('prayerBody')}
          </p>
        </section>

        <section className="mt-20">
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)] mb-6">{g('closingBody1')}</p>
          <p className="font-baskerville text-lg leading-relaxed text-[var(--body)] mb-10">{g('closingBody2')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact" className="btn-primary">
              {g('ctaContact')}
            </Link>
            <Link href="/releases" className="btn-ghost">
              <span className="arrow-line" />
              {g('ctaMusic')}
            </Link>
          </div>
          <ScriptureQuote text={g('scripture4Text')} cite={g('scripture4Cite')} />
        </section>
      </article>
    </div>
  )
}
