import Link from 'next/link'
import Image from 'next/image'
import { getCopyString } from '@/lib/site-copy'
import { releaseTypeDateLine } from '@/lib/release-display'
import { getPublicReleases } from '@/lib/site-content'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata = {
  title: 'Releases',
}

export default async function ReleasesIndexPage() {
  const [releases, copy] = await Promise.all([getPublicReleases(), getSiteCopy()])
  const r = (k: string) => getCopyString(copy, `releases.${k}`)
  const badgeNew = r('badgeNew')

  return (
    <div className="min-h-screen bg-bg pt-36 pb-24 px-8 md:px-20">
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-4">{r('eyebrow')}</p>
        <h1 className="display-2 text-body mb-4">{r('title')}</h1>
        <p className="body-lg max-w-xl mb-14">{r('intro')}</p>

        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {releases.map((rel) => (
            <li key={rel.slug}>
              <Link href={`/releases/${rel.slug}`} className="group block">
                <div className="manuscript-frame relative aspect-square overflow-hidden mb-4 shadow-[0_4px_24px_rgba(13,11,8,0.06)]">
                  <Image
                    src={rel.cover}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  {rel.isNew && (
                    <span className="absolute top-3 left-3 ui-label px-2 py-1 text-[10px] bg-accent text-ivory">{badgeNew}</span>
                  )}
                </div>
                <p className="font-playfair text-base text-body group-hover:text-accent transition-colors">{rel.title}</p>
                <p className="ui-label text-muted mt-1">{releaseTypeDateLine(rel)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
