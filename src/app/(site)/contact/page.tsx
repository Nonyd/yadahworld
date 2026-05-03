import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from '@/components/contact/ContactForm'
import { getCopyString } from '@/lib/site-copy'
import { getPublicBranding, getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = { title: 'Contact' }

export default async function ContactPage() {
  const [copy, branding] = await Promise.all([getSiteCopy(), getPublicBranding()])
  const c = (k: string) => getCopyString(copy, `contactPage.${k}`)
  const body = c('body')
  const bookingToken = '{{booking}}'
  const [bodyBefore, bodyAfter] = body.includes(bookingToken)
    ? body.split(bookingToken)
    : [body, '']

  const location = branding.locationDisplay?.trim() || 'Abuja, Nigeria'
  const phone = branding.contactPhone?.trim() || '+234 808 188 1365'
  const email = branding.contactEmail?.trim() || 'yadahsings@gmail.com'

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <p className="eyebrow mb-6">{c('eyebrow')}</p>
        <h1 className="display-2 text-[var(--body)] mb-20">{c('title')}</h1>

        <div className="grid md:grid-cols-[3fr_5fr] gap-20">
          <div>
            <p className="body-sm mb-8">
              {body.includes(bookingToken) ? (
                <>
                  {bodyBefore}
                  <Link href="/booking" className="link-underline text-accent">
                    {c('bookingLinkLabel')}
                  </Link>
                  {bodyAfter}
                </>
              ) : (
                body
              )}
            </p>
            <div className="flex flex-col gap-6">
              {[
                { label: c('labelLocation'), value: location },
                { label: c('labelPhone'), value: phone },
                { label: c('labelEmail'), value: email },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="eyebrow mb-1">{label}</p>
                  <p className="font-jost text-[var(--body)]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <ContactForm copy={copy} />
        </div>
      </div>
    </div>
  )
}
