import type { Metadata } from 'next'
import Link from 'next/link'
import { getCopyString } from '@/lib/site-copy'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = { title: 'Unsubscribed' }

export default async function UnsubscribedPage() {
  const copy = await getSiteCopy()
  const u = (k: string) => getCopyString(copy, `unsubscribedPage.${k}`)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-8 text-center"
      style={{ background: 'var(--bg)' }}
    >
      <p className="eyebrow mb-4">{u('eyebrow')}</p>
      <h1 className="display-2 text-[var(--body)] mb-6">{u('title')}</h1>
      <p className="body-lg max-w-sm mb-10">{u('body')}</p>
      <Link href="/" className="btn-ghost">
        <span className="arrow-line" />
        {u('ctaHome')}
      </Link>
    </div>
  )
}
