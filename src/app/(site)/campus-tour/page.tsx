import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Campus Tour',
  description:
    'Campus Tour — a ministry expression with Yadah: worship, the gospel, and encountering Jesus on campuses and beyond.',
}

export default function CampusTourPage() {
  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <p className="eyebrow mb-6">Ministry</p>
        <h1 className="display-2 text-[var(--body)] mb-10">
          Campus
          <br />
          <em className="font-playfair italic text-[var(--accent)]">Tour.</em>
        </h1>

        <div className="max-w-2xl space-y-6 body-sm text-[var(--muted)]">
          <p>
            Campus Tour is a ministry expression — taking worship, the good news of Jesus, and the presence of God into
            campuses and communities. It sits alongside other outreaches such as{' '}
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
    </div>
  )
}
