import Image from 'next/image'
import Link from 'next/link'
import type { CampusTourVisuals } from '@/lib/site-settings'

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

export default function CampusTourView({ portraitUrl, marqueeRow1, marqueeRow2 }: CampusTourVisuals) {
  return (
    <>
      <div className="min-h-screen pt-40 pb-16 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
        <div className="mx-auto grid max-w-screen-xl gap-12 md:grid-cols-2 md:items-center md:gap-16 lg:gap-20">
          <div className="order-2 md:order-1">
            <p className="eyebrow mb-6">Ministry</p>
            <h1 className="display-2 text-[var(--body)] mb-10">
              Campus
              <br />
              <em className="font-playfair italic text-[var(--accent)]">Tour.</em>
            </h1>

            <div className="max-w-xl space-y-6 body-sm text-[var(--muted)]">
              <p>
                Campus Tour is a ministry expression — taking worship, the good news of Jesus, and the presence of God
                into campuses and communities. It sits alongside other outreaches such as{' '}
                <a
                  href="https://rfyglobal.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-accent"
                >
                  Room For You
                </a>
                , pointing people to salvation, discipleship, and a life with Christ.
              </p>
              <p>
                Details for upcoming Campus Tour stops, cities, and how to host or partner are shared through official
                channels. For ministry bookings and appearances, use the booking form — we will respond with next steps.
              </p>
            </div>

            <div className="mt-14 flex flex-wrap gap-6">
              <Link href="/booking" className="btn-primary">
                Book Yadah
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M1 7h12M7 1l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link href="/contact" className="btn-ghost">
                <span className="arrow-line" />
                Contact
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
