import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Cookie Policy' }

const section = 'font-playfair text-2xl font-normal mt-12 mb-4 text-[var(--body)]'
const sub = 'font-playfair text-xl font-normal mt-8 mb-3 text-[var(--body)]'
const body = 'body-lg mb-6 !font-baskerville text-[var(--body)]'
const list = 'body-lg mb-6 space-y-2 pl-1 !font-baskerville text-[var(--body)] list-disc list-inside'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-bg pt-40 pb-32 px-8 md:px-20">
      <div className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="font-playfair text-[clamp(1.8rem,4vw,3.5rem)] font-normal leading-[1.15] text-[var(--body)]">
          Cookie Policy.
        </h1>
        <p className="body-sm mt-4 text-[var(--muted)]">Last updated: May 2026</p>
        <div className="h-px w-full mt-8 mb-10" style={{ background: 'var(--gold-light)', opacity: 0.35 }} aria-hidden />

        <h2 className={section}>Introduction</h2>
        <p className={body}>
          This Cookie Policy explains how Yadah (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), managed by SonsHub Media, uses cookies and similar
          technologies on yadahworld.com.
        </p>

        <h2 className={section}>1. What Are Cookies?</h2>
        <p className={body}>
          Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website.
          They are widely used to make websites work efficiently and to provide information to website owners.
        </p>

        <h2 className={section}>2. How We Use Cookies</h2>
        <p className={body}>We keep our cookie usage minimal and privacy-focused. We only use cookies that are strictly necessary for the Site to function.</p>
        <p className={body}>We do NOT use:</p>
        <ul className={list}>
          <li>Analytics cookies (e.g. Google Analytics)</li>
          <li>Advertising or targeting cookies</li>
          <li>Social media tracking cookies</li>
          <li>Third-party marketing cookies</li>
        </ul>

        <h2 className={section}>3. Cookies We Use</h2>

        <h3 className={sub}>Essential Cookies Only</h3>
        <p className={body}>
          These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to
          actions made by you, such as:
        </p>
        <ul className={list}>
          <li>Authentication — keeping you logged in to secure areas of the Site</li>
          <li>Session management — maintaining your session as you browse</li>
          <li>Security — protecting against cross-site request forgery (CSRF)</li>
        </ul>
        <p className={body}>
          These cookies do not track you across other websites and do not store any personally identifiable information beyond what is
          necessary for site functionality.
        </p>

        <h2 className={section}>4. Payment Processor Cookies</h2>
        <p className={body}>
          When you make a purchase, our payment processors (Paystack and Flutterwave) may set cookies on your device to facilitate secure
          payment processing. These cookies are governed by the respective privacy policies of:
        </p>
        <ul className={list}>
          <li>
            Paystack:{' '}
            <a
              href="https://paystack.com/privacy"
              className="link-underline text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://paystack.com/privacy
            </a>
          </li>
          <li>
            Flutterwave:{' '}
            <a
              href="https://flutterwave.com/us/privacy-policy"
              className="link-underline text-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://flutterwave.com/us/privacy-policy
            </a>
          </li>
        </ul>

        <h2 className={section}>5. Future Use of Cookies</h2>
        <p className={body}>
          We may in the future introduce analytics or other non-essential cookies to help us understand how visitors use our Site. If we
          do, we will:
        </p>
        <ul className={list}>
          <li>Update this Cookie Policy</li>
          <li>Seek your consent before placing non-essential cookies</li>
          <li>Provide clear options to accept or decline</li>
        </ul>

        <h2 className={section}>6. Managing Cookies</h2>
        <p className={body}>You can control and manage cookies in several ways:</p>

        <h3 className={sub}>Browser Settings</h3>
        <p className={body}>Most browsers allow you to:</p>
        <ul className={list}>
          <li>View what cookies are stored and delete them individually</li>
          <li>Block third-party cookies</li>
          <li>Block all cookies from specific sites</li>
          <li>Block all cookies entirely</li>
          <li>Delete all cookies when you close your browser</li>
        </ul>
        <p className={body}>Please note that disabling essential cookies may affect the functionality of the Site.</p>
        <p className={body}>Browser-specific guidance:</p>
        <ul className={list}>
          <li>Chrome: Settings → Privacy and Security → Cookies</li>
          <li>Firefox: Options → Privacy &amp; Security</li>
          <li>Safari: Preferences → Privacy</li>
          <li>Edge: Settings → Cookies and Site Permissions</li>
        </ul>

        <h2 className={section}>7. Your Consent</h2>
        <p className={body}>
          By continuing to use yadahworld.com, you consent to our use of essential cookies as described in this policy.
        </p>
        <p className={body}>
          As we do not use non-essential cookies at this time, no cookie consent banner is required. Should this change, we will implement
          appropriate consent mechanisms.
        </p>

        <h2 className={section}>8. Changes to This Policy</h2>
        <p className={body}>
          We may update this Cookie Policy from time to time. We will notify you of changes by updating the &quot;Last updated&quot; date at the top
          of this page.
        </p>

        <h2 className={section}>9. Contact Us</h2>
        <p className={body}>If you have questions about our use of cookies, please contact us:</p>

        <div className="mt-12 p-6 border border-[var(--gold-light)]/20 bg-[var(--surface)]">
          <p className="eyebrow mb-4">Contact</p>
          <p className={`${body} mb-4`}>Yadah / SonsHub Media</p>
          <p className={`${body} mb-4`}>Abuja, Nigeria</p>
          <p className={`${body} mb-4`}>
            Email:{' '}
            <a href="mailto:info@yadahworld.com" className="link-underline text-accent">
              info@yadahworld.com
            </a>
          </p>
          <p className={body}>
            Website:{' '}
            <a href="https://yadahworld.com" className="link-underline text-accent" target="_blank" rel="noopener noreferrer">
              yadahworld.com
            </a>
          </p>
        </div>

        <p className="ui-label mt-12 flex flex-wrap items-center gap-x-2 gap-y-1 text-[var(--muted)]">
          <span>See also:</span>
          <Link href="/privacy-policy" className="link-underline text-accent">
            Privacy Policy
          </Link>
          <span aria-hidden className="text-[var(--muted)]">
            ·
          </span>
          <Link href="/refund-policy" className="link-underline text-accent">
            Refund &amp; Returns
          </Link>
          <span aria-hidden className="text-[var(--muted)]">
            ·
          </span>
          <Link href="/cookie-policy" className="link-underline text-accent">
            Cookie Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
