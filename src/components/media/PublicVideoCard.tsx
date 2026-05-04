'use client'

import Image from 'next/image'
import type { PublicVideo } from '@/lib/site-content'
import { parseYoutubeIsoDuration } from '@/lib/video-duration'

function formatPublishedShort(iso: string | null | undefined) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export default function PublicVideoCard({
  video,
  videoIndex,
  onPlayClick,
  thumbnailSizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
}: {
  video: PublicVideo
  videoIndex: number
  onPlayClick: (index: number) => void
  thumbnailSizes?: string
}) {
  const durationLabel = parseYoutubeIsoDuration(video.durationIso)
  const publishedLabel = formatPublishedShort(video.publishedAtIso)

  return (
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
        sizes={thumbnailSizes}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-deep/85 via-deep/25 to-transparent" />
      {durationLabel ? (
        <span className="absolute right-3 top-3 rounded bg-deep/80 px-2 py-0.5 font-jost text-[10px] font-medium uppercase tracking-wider text-ivory">
          {durationLabel}
        </span>
      ) : null}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ivory bg-ivory/15 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl">
          <svg className="ml-1 h-6 w-6 fill-deep" viewBox="0 0 24 24" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 p-4 pt-12">
        <p className="font-playfair text-left text-base leading-snug text-ivory md:text-lg">{video.title}</p>
        {publishedLabel ? (
          <p className="shrink-0 font-jost text-[10px] uppercase tracking-wider text-ivory/70">{publishedLabel}</p>
        ) : null}
      </div>
    </button>
  )
}
