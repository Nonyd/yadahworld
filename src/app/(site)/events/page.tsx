import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import type { Event, TicketTier } from '@prisma/client'
import type { Metadata } from 'next'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Events — Yadah',
}

type EventListRow = Event & {
  tiers: TicketTier[]
  _count: {
    registrations: number
  }
}

export default async function EventsPage() {
  const now = new Date()

  const [events, past, copy] = await Promise.all([
    prisma.event.findMany({
    where: {
      status: { in: ['PUBLISHED', 'COMING_SOON'] },
    },
    include: {
      tiers: { where: { isActive: true } },
      _count: {
        select: {
          registrations: {
            where: { paymentStatus: { in: ['PAID', 'FREE'] } },
          },
        },
      },
    },
    orderBy: { date: 'asc' },
  }),
    prisma.event.findMany({
      where: {
        status: { in: ['PUBLISHED', 'PAST'] },
        date: { lt: now },
      },
      include: {
        tiers: { where: { isActive: true } },
        _count: {
          select: {
            registrations: {
              where: { paymentStatus: { in: ['PAID', 'FREE'] } },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 6,
    }),
    getSiteCopy(),
  ])

  const upcoming = events.filter((e) => e.status === 'COMING_SOON' || new Date(e.date) >= now)

  const ev = (k: string) => getCopyString(copy, `eventsPage.${k}`)

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-6">{ev('eyebrow')}</p>
        <h1 className="display-1 text-[var(--body)] mb-4">{ev('title')}</h1>
        <p className="body-lg max-w-lg mb-20">{ev('intro')}</p>

        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-24">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} copy={copy} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border" style={{ borderColor: 'rgba(139,105,20,0.15)' }}>
            <p className="font-playfair italic text-2xl mb-4" style={{ color: 'var(--body)' }}>
              {ev('emptyTitle')}
            </p>
            <p className="body-sm">{ev('emptyBody')}</p>
          </div>
        )}

        {past.length > 0 && (
          <>
            <div className="section-rule mb-16" />
            <p className="eyebrow mb-8">{ev('pastEyebrow')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {past.map((event) => (
                <EventCard key={event.id} event={event} copy={copy} past />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, past = false, copy }: { event: EventListRow; past?: boolean; copy: SiteCopy }) {
  const ev = (k: string) => getCopyString(copy, `eventsPage.${k}`)
  const isComingSoon = event.status === 'COMING_SOON'
  const eventDate = new Date(event.date)
  const isSoldOut = event.totalCapacity !== null && event._count.registrations >= event.totalCapacity

  return (
    <Link href={`/events/${event.slug}`} style={{ textDecoration: 'none' }}>
      <div className="group cursor-pointer" style={{ opacity: past ? 0.6 : 1 }}>
        <div className="relative aspect-[16/9] overflow-hidden manuscript-frame mb-5">
          {event.bannerImage ? (
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface)' }}>
              <span className="font-playfair italic text-2xl" style={{ color: 'var(--muted)' }}>
                Yadah
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3">
            {isComingSoon && (
              <span className="ui-label px-3 py-1" style={{ background: 'rgba(139,105,20,0.9)', color: 'white' }}>
                {ev('badgeComingSoon')}
              </span>
            )}
            {isSoldOut && !isComingSoon && (
              <span className="ui-label px-3 py-1" style={{ background: 'rgba(107,39,55,0.9)', color: 'white' }}>
                {ev('badgeSoldOut')}
              </span>
            )}
            {event.type === 'ONLINE' && !isComingSoon && (
              <span className="ui-label px-3 py-1" style={{ background: 'rgba(13,11,8,0.8)', color: 'rgba(253,250,245,0.8)' }}>
                {ev('badgeOnline')}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-2" style={{ color: 'var(--gold)' }}>
            {isComingSoon
              ? ev('badgeComingSoon')
              : eventDate.toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
          </p>
          <h2
            className="font-playfair text-xl font-normal mb-2 group-hover:text-[var(--accent)] transition-colors"
            style={{ color: 'var(--body)' }}
          >
            {event.title}
          </h2>
          <p className="ui-label" style={{ color: 'var(--muted)' }}>
            {event.venueName
              ? `${event.venueName}${event.venueCity ? ` · ${event.venueCity}` : ''}`
              : event.isOnline
                ? ev('badgeOnline')
                : ev('venueTba')}
          </p>

          {!isComingSoon && event.tiers?.length > 0 && (
            <p className="ui-label mt-2" style={{ color: 'var(--gold)' }}>
              {event.tiers.some((t) => t.price === 0)
                ? ev('tierFree')
                : `${ev('tierFromPrefix')} ${event.tiers[0]?.currency} ${(
                    Math.min(...event.tiers.map((t) => t.price)) / 100
                  ).toLocaleString()}`}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
