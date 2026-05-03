import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <p className="eyebrow mb-6">Get in Touch</p>
        <h1 className="display-2 text-[var(--body)] mb-20">Contact.</h1>

        <div className="grid md:grid-cols-[3fr_5fr] gap-20">
          <div>
            <p className="body-sm mb-8">
              For general enquiries, press, partnerships, or questions about Yadah&apos;s ministry. For event bookings,
              please use the{' '}
              <Link href="/booking" className="link-underline text-accent">
                Booking page
              </Link>
              .
            </p>
            <div className="flex flex-col gap-6">
              {[
                { label: 'Location', value: 'Abuja, Nigeria' },
                { label: 'Phone', value: '+234 808 188 1365' },
                { label: 'Email', value: 'yadahsings@gmail.com' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="eyebrow mb-1">{label}</p>
                  <p className="font-jost text-[var(--body)]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  )
}
