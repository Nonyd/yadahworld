'use client'

import Image from 'next/image'
import type { PublicVideo } from '@/lib/site-content'
import { formatViewCount } from '@/lib/format'

function formatPublishedShort(iso: string | null | undefined) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function StackedVideoCard({
  video,
  videoIndex,
  onPlayClick,
}: {
  video: PublicVideo
  videoIndex: number
  onPlayClick: (index: number) => void
}) {
  const publishedLabel = formatPublishedShort(video.publishedAtIso)
  const viewsLabel = formatViewCount(video.viewCount)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-label={`Play video: ${video.title}`}
        onClick={() => onPlayClick(videoIndex)}
        className="group relative aspect-video w-full cursor-pointer overflow-hidden text-left manuscript-frame border border-[rgba(42,37,32,0.08)] shadow-[0_4px_24px_rgba(13,11,8,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Image
          src={video.thumbnail}
          alt=""
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[var(--white)] bg-[var(--white)]/15 shadow-lg backdrop-blur-sm">
            <svg className="ml-0.5 h-5 w-5 fill-[var(--deep)]" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </button>
      <p className="mt-3 font-baskerville text-sm text-[var(--body)]">{video.title}</p>
      {publishedLabel ? <p className="mt-1 ui-label text-[var(--muted)]">{publishedLabel}</p> : null}
      {viewsLabel ? <p className="mt-1 ui-label text-[var(--muted)]">{viewsLabel}</p> : null}
    </div>
  )
}
