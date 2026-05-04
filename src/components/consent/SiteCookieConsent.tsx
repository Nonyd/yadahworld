'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  readCookieConsent,
  type CookieConsentChoice,
  writeCookieConsent,
} from '@/lib/cookie-consent'

export default function SiteCookieConsent() {
  const pathname = usePathname()
  const hideBanner = pathname?.startsWith('/admin') ?? false
  const [ready, setReady] = useState(false)
  const [choice, setChoice] = useState<CookieConsentChoice | null>(null)

  useEffect(() => {
    setChoice(readCookieConsent())
    setReady(true)
    const onChange = () => setChoice(readCookieConsent())
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange)
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, onChange)
  }, [])

  const showBanner = ready && !hideBanner && choice === null
  const allowAnalytics = choice === 'analytics'

  const pick = (c: CookieConsentChoice) => {
    writeCookieConsent(c)
    setChoice(c)
  }

  return (
    <>
      {allowAnalytics ? <Analytics /> : null}
      {showBanner ? (
        <div
          className="fixed inset-x-0 bottom-0 z-[10200] border-t border-[rgba(13,11,8,0.08)] bg-[var(--surface)] px-5 py-5 shadow-[0_-8px_32px_rgba(13,11,8,0.12)] md:px-10 dark:border-[rgba(201,168,76,0.1)]"
          role="region"
          aria-labelledby="cookie-consent-title"
        >
          <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
            <div className="min-w-0 flex-1">
              <h2
                id="cookie-consent-title"
                className="font-playfair text-lg font-normal tracking-tight text-[var(--body)] md:text-xl"
              >
                Cookies &amp; privacy
              </h2>
              <p className="mt-2 font-baskerville text-sm leading-relaxed text-[var(--muted)] md:text-[15px]">
                We use essential cookies so the site works. If you choose &ldquo;Accept all,&rdquo; we also load privacy-friendly
                analytics (Vercel Analytics) to see aggregate traffic — not for ads. You can change this anytime via{' '}
                <span className="whitespace-nowrap text-[var(--body)]">Cookie settings</span> in the footer.
              </p>
              <p className="mt-2 font-jost text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                <Link href="/cookie-policy" className="text-[var(--accent)] underline-offset-2 hover:underline">
                  Cookie Policy
                </Link>
                <span className="mx-2 opacity-40" aria-hidden>
                  ·
                </span>
                <Link href="/privacy-policy" className="text-[var(--accent)] underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center md:flex-col md:items-stretch lg:flex-row">
              <button
                type="button"
                className="btn-outline order-2 justify-center px-5 py-2.5 sm:order-1"
                onClick={() => pick('essential')}
              >
                Essential only
              </button>
              <button
                type="button"
                className="btn-primary order-1 justify-center px-5 py-2.5 sm:order-2"
                onClick={() => pick('analytics')}
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
