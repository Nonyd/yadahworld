import type { Metadata } from 'next'
import BookingForm from '@/components/booking/BookingForm'
import { getCopyString } from '@/lib/site-copy'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = { title: 'Booking' }

export default async function BookingPage() {
  const copy = await getSiteCopy()
  const b = (k: string) => getCopyString(copy, `bookingPage.${k}`)

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <div className="mb-20">
          <p className="eyebrow mb-6">{b('eyebrow')}</p>
          <h1 className="display-1 text-[var(--body)] mb-6">
            {b('heading1')}
            <br />
            <em className="font-playfair italic text-[var(--accent)]">{b('heading2')}</em>
          </h1>
          <p className="body-lg max-w-lg">{b('intro')}</p>
          <p className="ui-label mt-3" style={{ color: 'var(--muted)' }}>
            {b('note')}
          </p>
        </div>

        <div className="h-px mb-16" style={{ background: 'var(--gold-light)', opacity: 0.25 }} />

        <BookingForm />
      </div>
    </div>
  )
}
