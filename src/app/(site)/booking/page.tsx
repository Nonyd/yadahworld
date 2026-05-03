import type { Metadata } from 'next'
import BookingForm from '@/components/booking/BookingForm'

export const metadata: Metadata = { title: 'Booking' }

export default function BookingPage() {
  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <div className="mb-20">
          <p className="eyebrow mb-6">Invitations</p>
          <h1 className="display-1 text-[var(--body)] mb-6">
            Book
            <br />
            <em className="font-playfair italic text-[var(--accent)]">Yadah.</em>
          </h1>
          <p className="body-lg max-w-lg">
            Yadah is always glad to be a blessing to the body of Christ. Please provide all necessary information about
            your event below.
          </p>
          <p className="ui-label mt-3" style={{ color: 'var(--muted)' }}>
            Note: This form is for scheduling purposes only and does not confirm an event.
          </p>
        </div>

        <div className="h-px mb-16" style={{ background: 'var(--gold-light)', opacity: 0.25 }} />

        <BookingForm />
      </div>
    </div>
  )
}
