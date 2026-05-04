import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import PublicHrefLink from '@/components/ui/PublicHrefLink'
import { bookingHrefFromCopy, getCopyString } from '@/lib/site-copy'
import { formatReleaseDateDisplay } from '@/lib/release-date'
import { releaseDateThenType, releaseTypeDateLine, releaseTypeUpperThenDate } from '@/lib/release-display'
import { getPublicReleases, getReleaseBySlug } from '@/lib/site-content'
import { getPublicBranding, getSiteCopy } from '@/lib/site-settings'
import { extractYoutubeVideoId } from '@/lib/youtube'
import { proseHtmlFromStored } from '@/lib/rich-text-display'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const release = await getReleaseBySlug(params.slug)
  const branding = await getPublicBranding()
  if (!release) return { title: 'Release' }
  const suffix = branding.metaTitleSuffix?.trim() || '| Yadah'
  return {
    title: `${release.title} ${suffix}`.trim(),
    description:
      release.description?.trim() ||
      `${release.title} — ${release.type} (${formatReleaseDateDisplay(release.releasedAt) || release.year})`,
    openGraph: release.cover ? { images: [{ url: release.cover, width: 1200, height: 1200 }] } : undefined,
  }
}

export default async function ReleaseDetailPage({ params }: Props) {
  const release = await getReleaseBySlug(params.slug)
  if (!release) notFound()

  const [all, copy] = await Promise.all([getPublicReleases(), getSiteCopy()])
  const more = all.filter((r) => r.slug !== release.slug).slice(0, 3)
  const bookingHref = bookingHrefFromCopy(copy)
  const d = (k: string) => getCopyString(copy, `releaseDetail.${k}`)
  const badgeNew = getCopyString(copy, 'releases.badgeNew')

  const typeUpper = release.type.toUpperCase()
  const musicVideoId = release.musicVideoYoutube ? extractYoutubeVideoId(release.musicVideoYoutube) : null
  const bodyHtml = proseHtmlFromStored(release.description?.trim() || d('bodyFallback'))

  return (
    <article className="min-h-screen bg-bg pb-28 pt-32 md:px-20 px-8">
      <div className="mx-auto max-w-screen-lg">
        <Link href="/releases" className="ui-label text-muted hover:text-accent transition-colors">
          {d('backLink')}
        </Link>
        <p className="eyebrow mb-2 mt-8">{d('eyebrow')}</p>
        <p className="ui-label mb-10 text-muted">{releaseTypeUpperThenDate(typeUpper, release)}</p>

        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:items-start">
          <div>
            <div className="manuscript-frame relative aspect-square w-full max-w-md overflow-hidden shadow-[0_4px_24px_rgba(13,11,8,0.08)]">
              <Image src={release.cover} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" priority />
              {release.isNew && (
                <span className="absolute left-4 top-4 bg-accent px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-ivory">
                  {badgeNew}
                </span>
              )}
            </div>
            <div className="mt-8 flex flex-col gap-3">
              {release.spotify?.trim() && (
                <a
                  href={release.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full max-w-sm items-center justify-center rounded-full bg-[#1DB954] px-5 py-3 font-jost text-[11px] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-95"
                >
                  {d('listenSpotify')}
                </a>
              )}
              {release.apple?.trim() && (
                <a
                  href={release.apple}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full max-w-sm items-center justify-center rounded-full bg-black px-5 py-3 font-jost text-[11px] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
                >
                  {d('listenApple')}
                </a>
              )}
              {release.youtube?.trim() && (
                <a
                  href={release.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full max-w-sm items-center justify-center rounded-full bg-[#FF0000] px-5 py-3 font-jost text-[11px] font-medium uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-95"
                >
                  {d('listenYoutube')}
                </a>
              )}
              {release.streamingLinks.map((link) => (
                <a
                  key={`${link.url}-${link.label}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full max-w-sm items-center justify-center rounded-full border border-gold-light/35 bg-transparent px-5 py-3 font-jost text-[11px] font-medium uppercase tracking-[0.12em] text-body transition-colors hover:border-accent hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h1 className="display-2 text-body text-balance">{release.title}</h1>
            {release.feat?.trim() && (
              <p className="mt-4 font-serif text-xl italic text-muted" style={{ fontFamily: 'Baskerville, Georgia, serif' }}>
                {release.feat}
              </p>
            )}
            <p className="ui-label mt-4 text-muted">{releaseDateThenType(release)}</p>

            {release.spotifyEmbed?.trim() && (
              <div className="mb-10 max-w-xl">
                <h2 className="eyebrow mb-4">{d('spotifyEmbedHeading')}</h2>
                <div className="overflow-hidden rounded-lg border border-gold-light/20 bg-surface shadow-[0_4px_24px_rgba(13,11,8,0.06)]">
                  <iframe
                    title="Spotify player"
                    src={release.spotifyEmbed}
                    width="100%"
                    height="352"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="block w-full border-0"
                  />
                </div>
              </div>
            )}

            <div className="prose max-w-xl text-muted" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

            {musicVideoId && (
              <div className="mt-10 max-w-3xl">
                <h2 className="eyebrow mb-4">{d('musicVideoHeading')}</h2>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gold-light/20 bg-black shadow-[0_4px_24px_rgba(13,11,8,0.08)]">
                  <iframe
                    title="YouTube music video"
                    src={`https://www.youtube.com/embed/${musicVideoId}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            )}

            <p className="body-sm mt-12 max-w-md text-muted">
              {d('bookingTeaserBefore')}
              <PublicHrefLink href={bookingHref} className="link-underline text-accent">
                {d('bookingTeaserLink')}
              </PublicHrefLink>
              {d('bookingTeaserAfter')}
            </p>
          </div>
        </div>

        {more.length > 0 && (
          <section className="mt-24 border-t border-[rgba(42,37,32,0.1)] pt-16">
            <p className="eyebrow mb-6">{d('moreEyebrow')}</p>
            <h2 className="display-2 mb-12 text-body">{d('moreTitle')}</h2>
            <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-3">
              {more.map((r) => (
                <li key={r.slug}>
                  <Link href={`/releases/${r.slug}`} className="group block">
                    <div className="manuscript-frame relative mb-4 aspect-square overflow-hidden shadow-[0_4px_24px_rgba(13,11,8,0.06)]">
                      <Image
                        src={r.cover}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      {r.isNew && (
                        <span className="absolute left-3 top-3 bg-accent px-2 py-1 text-[10px] text-ivory">{badgeNew}</span>
                      )}
                    </div>
                    <p className="font-playfair text-base text-body transition-colors group-hover:text-accent">{r.title}</p>
                    <p className="ui-label mt-1 text-muted">{releaseTypeDateLine(r)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  )
}
