import type { Metadata } from 'next'
import ReleasesIndexGrid from '@/components/releases/ReleasesIndexGrid'
import { getCopyString } from '@/lib/site-copy'
import { getPublicReleases } from '@/lib/site-content'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Releases — Yadah Gospel Music Discography',
  description:
    "Explore Yadah's full gospel music discography. Songs include Beyond Me, Never Seen, Onye Nwere Jesus, Free of Charge, Na Your Hand, God in All Seasons, and more.",
  alternates: { canonical: 'https://yadahworld.com/releases' },
}

export default async function ReleasesIndexPage() {
  const [releases, copy] = await Promise.all([getPublicReleases(), getSiteCopy()])
  const r = (k: string) => getCopyString(copy, `releases.${k}`)
  const badgeNew = r('badgeNew')

  return (
    <div className="min-h-screen bg-bg pt-36 pb-24 px-8 md:px-20">
      <div className="mx-auto max-w-screen-xl">
        <p className="eyebrow mb-4">{r('eyebrow')}</p>
        <h1 className="display-2 mb-4 text-body">{r('title')}</h1>
        <p className="body-lg mb-14 max-w-xl">{r('intro')}</p>

        <ReleasesIndexGrid releases={releases} badgeNew={badgeNew} />
      </div>
    </div>
  )
}
