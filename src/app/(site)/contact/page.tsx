import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/contact/ContactForm'
import { buildSocialLinks, getPublicBranding, getSiteCopy, getSiteSettingsRow } from '@/lib/site-settings'

export const metadata: Metadata = { title: 'Contact' }

export default async function ContactPage() {
  const [branding, copy, settingsRow] = await Promise.all([
    getPublicBranding(),
    getSiteCopy(),
    getSiteSettingsRow(),
  ])
  const social = buildSocialLinks(settingsRow)
  const hrefFor = (label: string) => social.find((s) => s.label === label)?.href ?? '#'

  const location = branding.locationDisplay?.trim() || 'Abuja, Nigeria'
  const phone = branding.contactPhone?.trim() || '+234 808 188 1365'
  const email = branding.contactEmail?.trim() || 'yadahsings@gmail.com'
  const ig = hrefFor('IG')
  const yt = hrefFor('YT')
  const sp = hrefFor('SP')

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <p className="eyebrow mb-6">Reach Out</p>
        <h1 className="display-2 text-[var(--body)] mb-6">Let&apos;s Connect.</h1>
        <p className="font-baskerville italic text-lg text-[var(--muted)] max-w-2xl mb-4">
          Whether you have a testimony to share, a question about the ministry, or simply want to say hello — Yadah&apos;s
          team would love to hear from you.
        </p>
        <p className="body-sm text-[var(--muted)] mb-16 max-w-2xl">
          For event bookings, please visit the{' '}
          <Link href="/booking" className="link-underline text-accent">
            Booking page
          </Link>{' '}
          instead.
        </p>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          <div className="space-y-12">
            <section>
              <p className="eyebrow mb-4">Ministry Office</p>
              <ul className="space-y-4 font-jost text-[var(--body)]">
                <li>
                  <span className="ui-label block mb-1 text-muted">Location</span>
                  {location}
                </li>
                <li>
                  <span className="ui-label block mb-1 text-muted">Email</span>
                  <a href={`mailto:${email}`} className="link-underline text-accent">
                    {email}
                  </a>
                </li>
                <li>
                  <span className="ui-label block mb-1 text-muted">Phone</span>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="link-underline text-accent">
                    {phone}
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <p className="eyebrow mb-4">Connect Online</p>
              <ul className="flex flex-col gap-2 font-jost text-[var(--body)]">
                <li>
                  <a href={ig} target="_blank" rel="noopener noreferrer" className="link-underline text-accent w-fit">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href={yt} target="_blank" rel="noopener noreferrer" className="link-underline text-accent w-fit">
                    YouTube
                  </a>
                </li>
                <li>
                  <a href={sp} target="_blank" rel="noopener noreferrer" className="link-underline text-accent w-fit">
                    Spotify
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <p className="eyebrow mb-3">Prayer Requests</p>
              <p className="font-baskerville italic text-sm text-[var(--muted)] leading-relaxed max-w-md">
                Have a testimony or prayer request? We read every message and believe in the power of prayer.
              </p>
            </section>
          </div>

          <div>
            <ContactForm
              copy={copy}
              subjectPlaceholder="Testimony, prayer request, general enquiry..."
              submitLabel="SEND"
              simpleSubmit
            />
          </div>
        </div>
      </div>
    </div>
  )
}
