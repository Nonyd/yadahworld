import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EventRegistrationForm from '@/components/events/EventRegistrationForm'
import EventInterestForm from '@/components/events/EventInterestForm'
import type { EventSpeaker } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const event = await prisma.event.findFirst({
    where: { slug: params.slug },
  })
  if (!event) return {}
  return {
    title: `${event.title} — Yadah Events`,
    description: event.description?.replace(/<[^>]+>/g, '').slice(0, 160) ?? undefined,
  }
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await prisma.event.findFirst({
    where: {
      slug: params.slug,
      status: { in: ['PUBLISHED', 'COMING_SOON', 'CANCELLED'] },
    },
    include: {
      tiers: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
      speakers: { orderBy: { order: 'asc' } },
      _count: { select: { registrations: true, interests: true } },
    },
  })

  if (!event) notFound()

  const isComingSoon = event.status === 'COMING_SOON'
  const isCancelled = event.status === 'CANCELLED'
  const isPast = new Date(event.date) < new Date() && event.status !== 'COMING_SOON'

  const totalSold = await prisma.eventRegistration.count({
    where: {
      eventId: event.id,
      paymentStatus: { in: ['PAID', 'FREE'] },
    },
  })

  const isSoldOut = event.totalCapacity !== null && totalSold >= event.totalCapacity

  const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const eventTime = new Date(event.date).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div style={{ background: 'var(--bg)' }}>
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        {event.bannerImage ? (
          <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: '#0D0B08' }} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(13,11,8,0.85) 0%, rgba(13,11,8,0.3) 60%, transparent 100%)',
          }}
        />

        <div className="absolute top-8 left-8 md:left-20 flex gap-3 flex-wrap">
          {isComingSoon && (
            <span className="ui-label px-4 py-2" style={{ background: 'rgba(139,105,20,0.9)', color: 'white' }}>
              Coming Soon
            </span>
          )}
          {isCancelled && (
            <span className="ui-label px-4 py-2" style={{ background: 'rgba(107,39,55,0.9)', color: 'white' }}>
              Cancelled
            </span>
          )}
          {isSoldOut && !isComingSoon && !isCancelled && (
            <span className="ui-label px-4 py-2" style={{ background: 'rgba(107,39,55,0.9)', color: 'white' }}>
              Sold Out
            </span>
          )}
          {event.type === 'ONLINE' && (
            <span
              className="ui-label px-4 py-2"
              style={{
                background: 'rgba(13,11,8,0.8)',
                color: 'rgba(253,250,245,0.8)',
                border: '1px solid rgba(253,250,245,0.2)',
              }}
            >
              Online Event
            </span>
          )}
        </div>

        <div className="absolute bottom-8 left-8 md:left-20 right-8 md:right-20">
          <p className="eyebrow mb-3" style={{ color: 'rgba(201,168,76,0.8)' }}>
            {isComingSoon ? 'Coming Soon' : eventDate}
          </p>
          <h1 className="display-2" style={{ color: '#FDFAF5' }}>
            {event.title}
          </h1>
        </div>
      </div>

      <div className="px-8 md:px-20 py-16 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-[3fr_2fr] gap-16">
          <div>
            <div
              className="grid grid-cols-2 gap-6 mb-12 pb-12 border-b"
              style={{ borderColor: 'rgba(139,105,20,0.15)' }}
            >
              {[
                {
                  label: 'Date',
                  value: isComingSoon ? 'To Be Announced' : eventDate,
                },
                {
                  label: 'Time',
                  value: isComingSoon ? 'To Be Announced' : `${eventTime}${event.doorsOpen ? ` (Doors: ${event.doorsOpen})` : ''}`,
                },
                {
                  label: 'Venue',
                  value: event.isOnline ? 'Online / Livestream' : event.venueName ?? 'To Be Announced',
                  sub: event.venueAddress ? `${event.venueAddress}, ${event.venueCity}` : undefined,
                },
                {
                  label: 'Type',
                  value:
                    event.type === 'PHYSICAL' ? 'Physical Event' : event.type === 'ONLINE' ? 'Online / Livestream' : 'Hybrid Event',
                },
              ].map(({ label, value, sub }) => (
                <div key={label}>
                  <p className="eyebrow mb-1">{label}</p>
                  <p className="font-baskerville text-sm" style={{ color: 'var(--body)' }}>
                    {value}
                  </p>
                  {sub && (
                    <p className="font-baskerville text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      {sub}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {event.description && (
              <div className="prose mb-12" dangerouslySetInnerHTML={{ __html: event.description }} />
            )}

            {event.dressCode && (
              <div className="p-6 mb-8" style={{ background: 'rgba(139,105,20,0.06)', borderLeft: '2px solid var(--gold)' }}>
                <p className="eyebrow mb-2">Dress Code</p>
                <p className="font-baskerville" style={{ color: 'var(--body)' }}>
                  {event.dressCode}
                </p>
              </div>
            )}

            {event.requirements && (
              <div className="prose mb-12" dangerouslySetInnerHTML={{ __html: event.requirements }} />
            )}

            {event.speakers.length > 0 && (
              <div className="mb-12">
                <p className="eyebrow mb-8">Ministers & Speakers</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {event.speakers.map((speaker: EventSpeaker) => (
                    <div key={speaker.id} className="text-center">
                      {speaker.photo ? (
                        <div
                          className="aspect-square overflow-hidden manuscript-frame mb-3"
                          style={{ width: '80px', margin: '0 auto 12px' }}
                        >
                          <img src={speaker.photo} alt={speaker.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid rgba(139,105,20,0.2)',
                          }}
                        >
                          <span className="font-playfair text-xl" style={{ color: 'var(--muted)' }}>
                            {speaker.name[0]}
                          </span>
                        </div>
                      )}
                      <p className="font-baskerville text-sm font-bold" style={{ color: 'var(--body)' }}>
                        {speaker.name}
                      </p>
                      {speaker.role && (
                        <p className="eyebrow mt-1" style={{ color: 'var(--gold)' }}>
                          {speaker.role}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-28">
              {isComingSoon ? (
                <EventInterestForm slug={event.slug} eventTitle={event.title} interestCount={event._count.interests} />
              ) : isCancelled ? (
                <div className="p-8 border text-center" style={{ borderColor: 'rgba(107,39,55,0.3)', background: 'rgba(107,39,55,0.05)' }}>
                  <p className="font-playfair italic text-xl mb-3" style={{ color: 'var(--body)' }}>
                    This event has been cancelled.
                  </p>
                  <p className="body-sm">We apologise for any inconvenience. Please check back for future events.</p>
                </div>
              ) : isSoldOut ? (
                <div className="p-8 border text-center" style={{ borderColor: 'rgba(139,105,20,0.2)' }}>
                  <p className="font-playfair italic text-xl mb-3" style={{ color: 'var(--body)' }}>
                    This event is sold out.
                  </p>
                  <p className="body-sm">All tickets have been claimed. Stay connected for future events.</p>
                </div>
              ) : isPast ? (
                <div className="p-8 border text-center" style={{ borderColor: 'rgba(139,105,20,0.2)' }}>
                  <p className="font-playfair italic text-xl mb-3" style={{ color: 'var(--body)' }}>
                    This event has passed.
                  </p>
                </div>
              ) : (
                <EventRegistrationForm slug={event.slug} tiers={event.tiers} totalCapacity={event.totalCapacity} totalSold={totalSold} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
