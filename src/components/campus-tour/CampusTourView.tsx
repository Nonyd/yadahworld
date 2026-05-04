import Image from 'next/image'
import Link from 'next/link'
import PublicHrefLink from '@/components/ui/PublicHrefLink'
import type { CampusTourVisuals } from '@/lib/site-settings'
import { bookingHrefFromCopy, getCopyString, roomForYouHrefFromCopy, type SiteCopy } from '@/lib/site-copy'
import { proseHtmlFromStored } from '@/lib/rich-text-display'

function MarqueeStrip({ urls, reverse }: { urls: string[]; reverse?: boolean }) {
  if (!urls.length) return null
  const loop = [...urls, ...urls]
  return (
    <div className="overflow-hidden py-2">
      <div className={`campus-marquee-row px-2 ${reverse ? 'campus-marquee-row--reverse' : ''}`}>
        {loop.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-48 w-[min(85vw,22rem)] shrink-0 overflow-hidden rounded-md border border-[rgba(42,37,32,0.1)] shadow-[0_4px_20px_rgba(13,11,8,0.06)] sm:h-52 sm:w-96"
          >
            <Image src={src} alt="" fill className="object-cover" sizes="(max-width:640px)85vw,384px" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CampusTourView({
  portraitUrl,
  marqueeRow1,
  marqueeRow2,
  copy,
}: CampusTourVisuals & { copy: SiteCopy }) {
  const c = (k: string) => getCopyString(copy, `campusTour.${k}`)
  const roomForYouHref = roomForYouHrefFromCopy(copy)
  const bookingHref = bookingHrefFromCopy(copy)
  const body1 = c('body1')
  const hasRfyToken = body1.includes('{{rfy}}')
  const [beforeRfy, afterRfy] = hasRfyToken ? body1.split('{{rfy}}') : [body1, '']

  return (
    <>
      <div className="min-h-screen pt-40 pb-16 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto grid max-w-screen-xl gap-12 md:grid-cols-2 md:items-center md:gap-16 lg:gap-20">
          <div className="order-2 md:order-1">
            <p className="eyebrow mb-6">{c('eyebrow')}</p>
            <h1 className="display-2 text-[var(--body)] mb-10">
              {c('headingLine1')}
              <br />
              <em className="font-playfair italic text-[var(--accent)]">{c('headingLine2')}</em>
            </h1>

            <div className="max-w-xl space-y-6 text-[var(--muted)]">
              {hasRfyToken ? (
                <>
                  {beforeRfy.trim() ? (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: proseHtmlFromStored(beforeRfy) }} />
                  ) : null}
                  <p className="body-sm">
                    <PublicHrefLink href={roomForYouHref} className="link-underline text-accent">
                      {c('rfyLinkLabel')}
                    </PublicHrefLink>
                  </p>
                  {afterRfy.trim() ? (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: proseHtmlFromStored(afterRfy) }} />
                  ) : null}
                </>
              ) : (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: proseHtmlFromStored(body1) }} />
              )}
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: proseHtmlFromStored(c('body2')) }} />
            </div>

            <div className="mt-14 flex flex-wrap gap-6">
              <PublicHrefLink href={bookingHref} className="btn-primary">
                {c('bookCta')}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M1 7h12M7 1l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </PublicHrefLink>
              <Link href="/contact" className="btn-ghost">
                <span className="arrow-line" />
                {c('contactCta')}
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-lg border border-[rgba(42,37,32,0.1)] shadow-[0_12px_48px_rgba(13,11,8,0.1)] md:max-w-none md:ml-auto md:mr-0">
              <Image
                src={portraitUrl}
                alt="Yadah — Campus Tour"
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width:768px)100vw,45vw"
              />
            </div>
          </div>
        </div>
      </div>

      <section
        className="relative left-1/2 w-screen -translate-x-1/2 border-y border-[var(--gold-light)]/20 py-6 md:py-8"
        style={{ background: 'var(--surface)' }}
        aria-label="Campus tour gallery"
      >
        <MarqueeStrip urls={marqueeRow1} />
        <MarqueeStrip urls={marqueeRow2} reverse />
      </section>
    </>
  )
}
