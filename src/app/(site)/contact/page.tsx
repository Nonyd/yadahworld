import type { Metadata } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'
import ContactForm from '@/components/contact/ContactForm'
import { bookingHrefFromCopy, getCopyString, splitCopyByToken } from '@/lib/site-copy'
import { buildSocialLinks, getPublicBranding, getSiteCopy, getSiteSettingsRow } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Contact — Reach Out to Yadah',
  description:
    "Contact Yadah's ministry team for bookings, press enquiries, or general questions. Book one of Nigeria's top female gospel music ministers for your church, conference, or worship event.",
  alternates: { canonical: 'https://yadahworld.com/contact' },
}

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

  const c = (k: string) => getCopyString(copy, `contactPage.${k}`)
  const bookingHref = bookingHrefFromCopy(copy)
  const bookingPromptParts = splitCopyByToken(c('bookingPrompt'), '{{booking}}')

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <p className="eyebrow mb-6">{c('eyebrow')}</p>
        <h1 className="display-2 text-[var(--body)] mb-6">{c('title')}</h1>
        <p className="font-baskerville italic text-lg text-[var(--muted)] max-w-2xl mb-4">{c('intro')}</p>
        <p className="body-sm text-[var(--muted)] mb-16 max-w-2xl">
          {bookingPromptParts.map((part, i) => (
            <Fragment key={i}>
              {part}
              {i < bookingPromptParts.length - 1 ? (
                <Link href={bookingHref} className="link-underline text-accent">
                  {c('bookingLinkLabel')}
                </Link>
              ) : null}
            </Fragment>
          ))}
        </p>

        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          <div className="space-y-12">
            <section>
              <p className="eyebrow mb-4">{c('officeEyebrow')}</p>
              <ul className="space-y-4 font-jost text-[var(--body)]">
                <li>
                  <span className="ui-label block mb-1 text-muted">{c('labelLocation')}</span>
                  {location}
                </li>
                <li>
                  <span className="ui-label block mb-1 text-muted">{c('labelEmail')}</span>
                  <a href={`mailto:${email}`} className="link-underline text-accent">
                    {email}
                  </a>
                </li>
                <li>
                  <span className="ui-label block mb-1 text-muted">{c('labelPhone')}</span>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="link-underline text-accent">
                    {phone}
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <p className="eyebrow mb-4">{c('connectEyebrow')}</p>
              <ul className="flex flex-col gap-2 font-jost text-[var(--body)]">
                <li>
                  <a href={ig} target="_blank" rel="noopener noreferrer" className="link-underline text-accent w-fit">
                    {c('connectLabelInstagram')}
                  </a>
                </li>
                <li>
                  <a href={yt} target="_blank" rel="noopener noreferrer" className="link-underline text-accent w-fit">
                    {c('connectLabelYoutube')}
                  </a>
                </li>
                <li>
                  <a href={sp} target="_blank" rel="noopener noreferrer" className="link-underline text-accent w-fit">
                    {c('connectLabelSpotify')}
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <p className="eyebrow mb-3">{c('prayerEyebrow')}</p>
              <p className="font-baskerville italic text-sm text-[var(--muted)] leading-relaxed max-w-md">
                {c('prayerBody')}
              </p>
            </section>
          </div>

          <div>
            <ContactForm
              copy={copy}
              subjectPlaceholder={getCopyString(copy, 'contactForm.pageSubjectPlaceholder')}
              submitLabel={getCopyString(copy, 'contactForm.pageSubmitLabel')}
              simpleSubmit
            />
          </div>
        </div>
      </div>
    </div>
  )
}
