import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Privacy Policy' }

const section = 'font-playfair text-2xl font-normal mt-12 mb-4 text-[var(--body)]'
const body = 'body-lg mb-6 !font-baskerville text-[var(--body)]'
const list = 'body-lg mb-6 space-y-2 pl-1 !font-baskerville text-[var(--body)] list-disc list-inside'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg pt-40 pb-32 px-8 md:px-20">
      <div className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="font-playfair text-[clamp(1.8rem,4vw,3.5rem)] font-normal leading-[1.15] text-[var(--body)]">
          Privacy Policy.
        </h1>
        <p className="body-sm mt-4 text-[var(--muted)]">Last updated: May 2026</p>
        <div className="h-px w-full mt-8 mb-10" style={{ background: 'var(--gold-light)', opacity: 0.35 }} aria-hidden />

        <h2 className={section}>Introduction</h2>
        <p className={body}>
          Yadah (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), managed by SonsHub Media, is committed to protecting your personal
          information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you visit yadahworld.com (the &quot;Site&quot;), including any purchases you make through our shop.
        </p>
        <p className={body}>
          Please read this policy carefully. If you disagree with its terms, please discontinue use of the Site.
        </p>
        <p className={body}>
          This policy complies with the Nigeria Data Protection Regulation (NDPR) 2019 and, where applicable to users in the
          European Economic Area and United Kingdom, the General Data Protection Regulation (GDPR).
        </p>

        <h2 className={section}>1. Information We Collect</h2>
        <p className={body}>We collect information you voluntarily provide to us when you:</p>
        <ul className={list}>
          <li>
            Submit a booking request (name, email, phone number, organisation name, event details)
          </li>
          <li>Send us a contact or enquiry message (name, email, subject, message)</li>
          <li>Subscribe to our newsletter (email address)</li>
          <li>
            Make a purchase from our shop (name, email, shipping address, payment information)
          </li>
        </ul>
        <p className={body}>
          We do not collect sensitive personal data such as racial or ethnic origin, political opinions, religious beliefs, health
          data, or biometric data.
        </p>
        <p className={body}>
          We do not use cookies for tracking, advertising, or analytics purposes. We only use essential cookies required for the Site
          to function correctly (see our{' '}
          <Link href="/cookie-policy" className="link-underline text-accent">
            Cookie Policy
          </Link>
          ).
        </p>

        <h2 className={section}>2. How We Use Your Information</h2>
        <p className={body}>We use the information we collect to:</p>
        <ul className={list}>
          <li>Process and manage booking requests from churches, organisations, and event planners</li>
          <li>Respond to your enquiries and contact messages</li>
          <li>Process shop orders, including payment and delivery</li>
          <li>Send ministry updates and newsletters (only where you have opted in)</li>
          <li>Improve and maintain the Site</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p className={body}>
          We will never sell, trade, or rent your personal information to third parties for marketing purposes.
        </p>

        <h2 className={section}>3. Legal Basis for Processing (GDPR)</h2>
        <p className={body}>For users in the EEA and UK, we process your personal data on the following legal bases:</p>
        <ul className={list}>
          <li>Contractual necessity — to process shop orders and booking requests</li>
          <li>Legitimate interests — to respond to enquiries and improve our services</li>
          <li>Consent — to send newsletters and ministry updates (you may withdraw consent at any time)</li>
          <li>Legal obligation — where required by applicable law</li>
        </ul>

        <h2 className={section}>4. Payment Processing</h2>
        <p className={body}>
          All payments on yadahworld.com are processed securely through Paystack and Flutterwave. We do not store your payment card
          details on our servers. These payment processors are PCI-DSS compliant and operate under their own privacy policies:
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

        <h2 className={section}>5. Newsletter &amp; Email Communications</h2>
        <p className={body}>
          If you subscribe to our newsletter, we collect your email address for the purpose of sending you ministry updates, new
          releases, and event information from Yadah.
        </p>
        <p className={body}>
          You may unsubscribe at any time by clicking the &quot;unsubscribe&quot; link in any email, or by contacting us at{' '}
          <a href="mailto:info@yadahworld.com" className="link-underline text-accent">
            info@yadahworld.com
          </a>
          .
        </p>
        <p className={body}>
          We process newsletter subscriptions under your consent. Withdrawing consent does not affect the lawfulness of processing
          carried out before withdrawal.
        </p>

        <h2 className={section}>6. Data Sharing &amp; Third Parties</h2>
        <p className={body}>
          We do not sell or share your personal data with third parties except in the following circumstances:
        </p>
        <ul className={list}>
          <li>Payment processors (Paystack, Flutterwave) to process transactions</li>
          <li>Shipping partners to fulfil physical orders</li>
          <li>Email service providers to deliver newsletters and transactional emails</li>
          <li>Legal authorities, if required by law</li>
        </ul>
        <p className={body}>
          All third parties we work with are required to respect the security of your personal data and to treat it in accordance with
          applicable law.
        </p>

        <h2 className={section}>7. International Data Transfers</h2>
        <p className={body}>
          Your information may be transferred to and processed in countries outside Nigeria. Where this occurs, we ensure appropriate
          safeguards are in place in accordance with the NDPR and GDPR requirements.
        </p>

        <h2 className={section}>8. Data Retention</h2>
        <p className={body}>
          We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy, or as required by
          law:
        </p>
        <ul className={list}>
          <li>Booking requests: 2 years</li>
          <li>Contact messages: 1 year</li>
          <li>Shop orders: 7 years (for financial records)</li>
          <li>Newsletter subscriptions: Until you unsubscribe</li>
        </ul>

        <h2 className={section}>9. Your Rights</h2>
        <p className={body}>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul className={list}>
          <li>Right to access — request a copy of your personal data</li>
          <li>Right to rectification — request correction of inaccurate data</li>
          <li>Right to erasure — request deletion of your data (&quot;right to be forgotten&quot;)</li>
          <li>Right to restrict processing — request that we limit how we use your data</li>
          <li>Right to data portability — receive your data in a portable format</li>
          <li>Right to object — object to our processing of your data</li>
          <li>Right to withdraw consent — at any time, where processing is based on consent</li>
        </ul>
        <p className={body}>
          To exercise any of these rights, please contact us at{' '}
          <a href="mailto:info@yadahworld.com" className="link-underline text-accent">
            info@yadahworld.com
          </a>
          . We will respond within 30 days.
        </p>
        <p className={body}>
          Nigerian users may also contact the National Information Technology Development Agency (NITDA) regarding data protection
          matters.
        </p>

        <h2 className={section}>10. Data Security</h2>
        <p className={body}>
          We implement appropriate technical and organisational measures to protect your personal information against unauthorised
          access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we
          cannot guarantee absolute security.
        </p>

        <h2 className={section}>11. Children&apos;s Privacy</h2>
        <p className={body}>
          Our Site is not directed at children under the age of 13. We do not knowingly collect personal information from children. If
          you believe we have inadvertently collected such information, please contact us immediately at{' '}
          <a href="mailto:info@yadahworld.com" className="link-underline text-accent">
            info@yadahworld.com
          </a>
          .
        </p>

        <h2 className={section}>12. Changes to This Policy</h2>
        <p className={body}>
          We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &quot;Last
          updated&quot; date at the top of this page. We encourage you to review this policy periodically.
        </p>

        <h2 className={section}>13. Contact Us</h2>
        <p className={body}>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>

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
