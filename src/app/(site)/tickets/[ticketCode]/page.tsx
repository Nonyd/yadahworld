import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { generateQRCodeDataUrl } from '@/lib/qrcode'
import { verifyPaystackChargeAndFinalize } from '@/lib/event-paystack-finalize'

export default async function TicketPage({
  params,
  searchParams,
}: {
  params: { ticketCode: string }
  searchParams?: { verify?: string; reference?: string; trxref?: string }
}) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null)

  let registration = await prisma.eventRegistration.findUnique({
    where: { ticketCode: params.ticketCode },
    include: { event: true, tier: true },
  })

  if (!registration) notFound()

  if (searchParams?.verify === 'true' && registration.paymentStatus === 'PENDING') {
    const ref =
      searchParams.reference?.trim() ||
      searchParams.trxref?.trim() ||
      registration.orderGroupId ||
      registration.ticketCode
    if (ref) {
      await verifyPaystackChargeAndFinalize(ref, settings)
      registration = await prisma.eventRegistration.findUniqueOrThrow({
        where: { ticketCode: params.ticketCode },
        include: { event: true, tier: true },
      })
    }
  }

  const qrDataUrl = await generateQRCodeDataUrl(params.ticketCode)

  const isPaid = registration.paymentStatus === 'PAID'
  const isFree = registration.paymentStatus === 'FREE'
  const isValid = isPaid || isFree

  const eventDate = new Date(registration.event.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen py-20 px-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-lg mx-auto">
        {!isValid && (
          <div
            className="mb-8 p-4 text-center"
            style={{
              background: 'rgba(107,39,55,0.08)',
              border: '1px solid var(--accent)',
            }}
          >
            <p className="ui-label text-[var(--accent)]">
              Payment Pending — This ticket is not yet confirmed
            </p>
          </div>
        )}

        <div
          className="border manuscript-frame overflow-hidden"
          style={{ borderColor: 'rgba(139,105,20,0.2)' }}
        >
          <div className="p-8 text-center" style={{ background: '#0D0B08' }}>
            <img
              src="https://res.cloudinary.com/dxliuat50/image/upload/v1777837569/Yadah_White_4x_cd09dg.png"
              alt="Yadah"
              style={{ height: '32px', width: 'auto', margin: '0 auto 16px' }}
            />
            {isValid && (
              <span
                className="ui-label px-3 py-1"
                style={{
                  background: 'rgba(40,100,40,0.3)',
                  color: '#6FCF97',
                  border: '1px solid rgba(111,207,151,0.3)',
                }}
              >
                ✓ Valid Ticket
              </span>
            )}
          </div>

          {registration.event.bannerImage && (
            <div style={{ height: '160px', overflow: 'hidden' }}>
              <img
                src={registration.event.bannerImage}
                alt={registration.event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <div className="p-8" style={{ background: 'var(--bg)' }}>
            <p className="eyebrow mb-3">Your Ticket</p>
            <h1 className="font-playfair text-2xl font-normal mb-2" style={{ color: 'var(--body)' }}>
              {registration.event.title}
            </h1>
            <p className="font-baskerville italic text-lg mb-8" style={{ color: 'var(--muted)' }}>
              {registration.fullName}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: 'Date', value: eventDate },
                { label: 'Ticket Type', value: registration.tier.name },
                {
                  label: 'Venue',
                  value: registration.event.venueName ?? (registration.event.isOnline ? 'Online' : 'TBA'),
                },
                {
                  label: 'Amount',
                  value:
                    registration.tier.price === 0
                      ? 'Free'
                      : `${registration.tier.currency} ${(registration.tier.price / 100).toLocaleString()}`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="pb-4 border-b" style={{ borderColor: 'rgba(42,37,32,0.08)' }}>
                  <p className="eyebrow mb-1">{label}</p>
                  <p className="font-baskerville text-sm" style={{ color: 'var(--body)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {isValid && (
              <div
                className="text-center py-6 border-t border-b mb-6"
                style={{ borderColor: 'rgba(42,37,32,0.08)' }}
              >
                <p className="eyebrow mb-4">Present at entrance</p>
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  style={{
                    width: '180px',
                    height: '180px',
                    margin: '0 auto',
                    display: 'block',
                  }}
                />
                <p
                  className="ui-label mt-4"
                  style={{
                    color: 'var(--muted)',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em',
                  }}
                >
                  {registration.ticketCode.toUpperCase()}
                </p>
              </div>
            )}

            {registration.event.dressCode && (
              <div
                className="p-4 mb-4"
                style={{
                  background: 'rgba(139,105,20,0.06)',
                  borderLeft: '2px solid var(--gold)',
                }}
              >
                <p className="eyebrow mb-1">Dress Code</p>
                <p className="font-baskerville text-sm" style={{ color: 'var(--body)' }}>
                  {registration.event.dressCode}
                </p>
              </div>
            )}

            <p className="ui-label text-center" style={{ color: 'var(--muted)', opacity: 0.5 }}>
              Ticket issued by Yadah · yadahworld.com
            </p>
          </div>
        </div>

        <p className="text-center mt-6 ui-label" style={{ color: 'var(--muted)' }}>
          Questions? Email info@yadahworld.com
        </p>
      </div>
    </div>
  )
}
