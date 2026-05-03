'use client'

import Image from 'next/image'
import type { PublicVideo } from '@/lib/site-content'
import { extractYoutubeVideoId, youtubeWatchUrl } from '@/lib/youtube'

/**
 * Shared layout: thumbnail + play (opens lightbox via `onPlayClick`) with title and
 * “Watch on YouTube” below — same pattern as /media.
 */
export default function PublicVideoCard({
  video,
  videoIndex,
  onPlayClick,
  watchYoutubeLabel,
  thumbnailSizes = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw',
}: {
  video: PublicVideo
  /** Index in the full `videos` array passed to `usePublicVideoLightbox` */
  videoIndex: number
  onPlayClick: (index: number) => void
  watchYoutubeLabel: string
  thumbnailSizes?: string
}) {
  const yid = extractYoutubeVideoId(video.youtubeUrl)
  const watch = yid ? youtubeWatchUrl(yid) : video.youtubeUrl

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        aria-label={`Play video: ${video.title}`}
        onClick={() => onPlayClick(videoIndex)}
        className="relative group aspect-video w-full cursor-pointer overflow-hidden text-left manuscript-frame border border-[rgba(42,37,32,0.08)] shadow-[0_4px_24px_rgba(13,11,8,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Image
          src={video.thumbnail}
          alt=""
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes={thumbnailSizes}
        />
        <div className="absolute inset-0 bg-deep/35 transition-all duration-500 group-hover:bg-deep/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ivory bg-ivory/10 backdrop-blur-sm transition-colors group-hover:border-gold-light/60">
            <svg className="ml-1 h-6 w-6 fill-ivory" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </button>
      <div>
        <p className="font-playfair text-lg text-body">{video.title}</p>
        <a
          href={watch}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block ui-label text-muted hover:text-accent"
        >
          {watchYoutubeLabel}
        </a>
      </div>
    </div>
  )
}
