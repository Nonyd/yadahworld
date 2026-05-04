import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Refund & Returns Policy' }

const section = 'font-playfair text-2xl font-normal mt-12 mb-4 text-[var(--body)]'
const sub = 'font-playfair text-xl font-normal mt-8 mb-3 text-[var(--body)]'
const body = 'body-lg mb-6 !font-baskerville text-[var(--body)]'
const list = 'body-lg mb-6 space-y-2 pl-1 !font-baskerville text-[var(--body)] list-disc list-inside'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-bg pt-40 pb-32 px-8 md:px-20">
      <div className="max-w-3xl mx-auto">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="font-playfair text-[clamp(1.8rem,4vw,3.5rem)] font-normal leading-[1.15] text-[var(--body)]">
          Refund &amp; Returns.
        </h1>
        <p className="body-sm mt-4 text-[var(--muted)]">Last updated: May 2026</p>

        <h2 className={`${section} mt-10`}>Introduction</h2>
        <p className={body}>
          At Yadah, we want you to be completely satisfied with your purchase. This Refund and Returns Policy outlines your rights and
          our obligations when you shop at yadahworld.com.
        </p>

        <h2 className={section}>1. Physical Merchandise</h2>

        <h3 className={sub}>Eligibility for Returns</h3>
        <p className={body}>You may request a return for physical merchandise within 24 days of receiving your order, provided:</p>
        <ul className={list}>
          <li>The item is unused and in its original condition</li>
          <li>The item is in its original packaging</li>
          <li>You have proof of purchase (order confirmation email)</li>
        </ul>
        <p className={body}>The following items are not eligible for return:</p>
        <ul className={list}>
          <li>Items marked as final sale</li>
          <li>Customised or personalised items</li>
          <li>Items that have been worn, washed, or damaged after delivery</li>
        </ul>

        <h3 className={sub}>How to Request a Return</h3>
        <p className={body}>
          To initiate a return, please contact us at{' '}
          <a href="mailto:info@yadahworld.com" className="link-underline text-accent">
            info@yadahworld.com
          </a>{' '}
          within 24 days of receiving your order. Include:
        </p>
        <ul className={list}>
          <li>Your order number</li>
          <li>The item(s) you wish to return</li>
          <li>The reason for the return</li>
          <li>Photos of the item if damaged or defective</li>
        </ul>
        <p className={body}>We will respond within 3 business days with return instructions.</p>

        <h3 className={sub}>Return Shipping</h3>
        <ul className={list}>
          <li>For defective or incorrect items: we will cover the cost of return shipping</li>
          <li>For change-of-mind returns: the customer is responsible for return shipping costs</li>
        </ul>
        <p className={body}>
          Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund.
        </p>

        <h2 className={section}>2. Refunds</h2>

        <h3 className={sub}>Approved Refunds</h3>
        <p className={body}>
          If your return is approved, your refund will be processed within 7–10 business days to your original payment method:
        </p>
        <ul className={list}>
          <li>Paystack payments: refunded to original card or account</li>
          <li>Flutterwave payments: refunded to original card or account</li>
        </ul>
        <p className={body}>
          Please note that your bank or payment provider may take additional time to post the refund to your account.
        </p>

        <h3 className={sub}>Partial Refunds</h3>
        <p className={body}>Partial refunds may be granted where:</p>
        <ul className={list}>
          <li>An item is returned in a condition other than original (wear, damage, missing packaging)</li>
          <li>Only part of an order is returned</li>
        </ul>

        <h2 className={section}>3. Digital Products</h2>
        <p className={body}>
          Digital products (digital music downloads, digital content) are non-refundable once downloaded or accessed, except where:
        </p>
        <ul className={list}>
          <li>The file is defective or corrupted and we are unable to provide a replacement</li>
          <li>The product was significantly different from its description</li>
        </ul>

        <h2 className={section}>4. Event Tickets</h2>
        <p className={body}>Event ticket purchases are non-refundable except in the following circumstances:</p>
        <ul className={list}>
          <li>The event is cancelled by the organiser</li>
          <li>The event is significantly rescheduled (more than 30 days from original date)</li>
        </ul>
        <p className={body}>
          In the case of cancellation or significant reschedulement, a full refund will be issued within 14 business days.
        </p>

        <h2 className={section}>5. Damaged or Defective Items</h2>
        <p className={body}>
          If you receive a damaged or defective item, please contact us at{' '}
          <a href="mailto:info@yadahworld.com" className="link-underline text-accent">
            info@yadahworld.com
          </a>{' '}
          within 7 days of receipt with:
        </p>
        <ul className={list}>
          <li>Your order number</li>
          <li>A description of the defect</li>
          <li>Clear photographs of the damage</li>
        </ul>
        <p className={body}>We will arrange a replacement or full refund at no additional cost to you.</p>

        <h2 className={section}>6. Order Cancellations</h2>

        <h3 className={sub}>Physical Merchandise</h3>
        <p className={body}>
          Orders may be cancelled within 24 hours of placement, provided the order has not yet been dispatched. Contact us immediately at{' '}
          <a href="mailto:info@yadahworld.com" className="link-underline text-accent">
            info@yadahworld.com
          </a>{' '}
          if you need to cancel.
        </p>

        <h3 className={sub}>Digital Products</h3>
        <p className={body}>Digital product orders cannot be cancelled once the download link has been delivered.</p>

        <h2 className={section}>7. International Orders</h2>
        <p className={body}>For international orders, please note:</p>
        <ul className={list}>
          <li>Return shipping costs for international returns are the customer&apos;s responsibility unless the item is defective</li>
          <li>Customs duties and import taxes paid are non-refundable</li>
          <li>Refund processing times may be longer for international transactions</li>
        </ul>

        <h2 className={section}>8. Contact Us</h2>
        <p className={body}>For all refund and returns enquiries:</p>

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
          <p className={body}>Response time: within 3 business days</p>
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
