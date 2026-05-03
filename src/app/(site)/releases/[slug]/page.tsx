import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getReleaseBySlug } from '@/lib/site-content'
import { getPublicBranding } from '@/lib/site-settings'
import { extractYoutubeVideoId } from '@/lib/youtube'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const release = await getReleaseBySlug(params.slug)
  const branding = await getPublicBranding()
  if (!release) return { title: 'Release' }
  const suffix = branding.metaTitleSuffix?.trim() || '| Yadah'
  return {
    title: `${release.title} ${suffix}`.trim(),
    description: release.description?.trim() || `${release.title} — ${release.type} (${release.year})`,
    openGraph: release.cover ? { images: [{ url: release.cover, width: 1200, height: 1200 }] } : undefined,
  }
}

export default async function ReleaseDetailPage({ params }: Props) {
  const release = await getReleaseBySlug(params.slug)
  if (!release) notFound()

  const links = [
    { label: 'Spotify', href: release.spotify },
    { label: 'Apple Music', href: release.apple },
    { label: 'YouTube', href: release.youtube },
  ].filter((x): x is { label: string; href: string } => !!x.href?.trim())

  const musicVideoId = release.musicVideoYoutube ? extractYoutubeVideoId(release.musicVideoYoutube) : null

  return (
    <article className="min-h-screen bg-bg pt-32 pb-24 px-8 md:px-20">
      <div className="max-w-screen-lg mx-auto">
        <Link href="/releases" className="ui-label text-muted hover:text-accent transition-colors">
          ← All releases
        </Link>

        <div className="mt-10 grid gap-12 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
          <div className="manuscript-frame relative aspect-square w-full max-w-sm overflow-hidden shadow-[0_4px_24px_rgba(13,11,8,0.08)]">
            <Image src={release.cover} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" priority />
            {release.isNew && (
              <span className="absolute top-4 left-4 ui-label px-2 py-1 text-[10px] bg-accent text-ivory">New</span>
            )}
          </div>

          <div>
            <p className="eyebrow mb-4">{release.type}</p>
            <h1 className="font-playfair text-4xl md:text-5xl font-normal text-body leading-tight">
              {release.title}
              {release.feat && <span className="font-jost block text-lg font-light italic text-muted mt-2">{release.feat}</span>}
            </h1>
            <p className="ui-label text-muted mt-4">{release.year}</p>

            {release.description && <p className="body-lg mt-8 max-w-xl whitespace-pre-wrap">{release.description}</p>}

            {release.spotifyEmbed && (
              <div className="mt-10 max-w-xl">
                <h2 className="eyebrow mb-4">Listen on Spotify</h2>
                <div className="overflow-hidden rounded-lg border border-gold-light/20 bg-[var(--surface)] shadow-[0_4px_24px_rgba(13,11,8,0.06)]">
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

            {musicVideoId && (
              <div className="mt-10 max-w-3xl">
                <h2 className="eyebrow mb-4">Music video</h2>
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

            {links.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-3">
                {links.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-[10px] py-3 px-6"
                  >
                    {label}
                    <span aria-hidden className="ml-1">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            )}

            <p className="body-sm mt-12 max-w-md">
              Looking for a live experience?{' '}
              <Link href="/booking" className="link-underline text-accent">
                Book Yadah
              </Link>{' '}
              for your event.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
