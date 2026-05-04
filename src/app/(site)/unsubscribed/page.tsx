import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Unsubscribed' }

export default function UnsubscribedPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'var(--bg)' }}
    >
      <p className="eyebrow mb-4">Newsletter</p>
      <h1 className="display-2 text-[var(--body)] mb-6">You have been unsubscribed.</h1>
      <p className="body-lg max-w-sm mb-10">
        You will no longer receive ministry updates from Yadah. We are sorry to see you go. God bless you.
      </p>
      <Link href="/" className="btn-ghost">
        <span className="arrow-line" />
        Return Home
      </Link>
    </div>
  )
}
