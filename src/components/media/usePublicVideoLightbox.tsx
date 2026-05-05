'use client'

import { useCallback, useMemo, useState } from 'react'
import Lightbox, { useController } from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { PublicVideo } from '@/lib/site-content'
import { extractYoutubeVideoId } from '@/lib/youtube'

/** Fixed close control — must render inside `<Lightbox>` (uses `useController`). */
function LightboxFloatingClose() {
  const { close } = useController()
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={() => close()}
      className="yarl__button fixed right-3 top-3 z-[10050] flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-[rgba(253,250,245,0.35)] bg-[rgba(13,11,8,0.65)] text-ivory shadow-lg backdrop-blur-md transition-colors hover:bg-[rgba(13,11,8,0.85)] md:right-5 md:top-5 md:h-12 md:w-12"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  )
}

type YoutubeSlide = {
  type: 'youtube'
  youtubeId: string
  title?: string | null
}

function YoutubeSlideView({
  slide,
  offset,
  rect,
}: {
  slide: YoutubeSlide
  offset: number
  rect: { width: number; height: number }
}) {
  const { close } = useController()
  const autoplay = offset === 0 ? 1 : 0

  const dismissIfBackdrop = useCallback(
    (e: React.MouseEvent | React.PointerEvent) => {
      if (e.target === e.currentTarget) close()
    },
    [close],
  )

  return (
    <div
      className="flex h-full w-full cursor-default items-center justify-center bg-transparent p-3 md:p-5"
      style={{ maxWidth: rect.width, maxHeight: rect.height }}
      onClick={dismissIfBackdrop}
      onPointerUp={dismissIfBackdrop}
    >
      <div
        role="presentation"
        className="relative aspect-video w-full max-w-[min(100%,960px)] overflow-hidden rounded-sm bg-black shadow-lg"
        onClick={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
      >
        <iframe
          key={`${slide.youtubeId}-${offset}-${autoplay}`}
          title={slide.title ?? 'YouTube video'}
          src={`https://www.youtube.com/embed/${slide.youtubeId}?rel=0&autoplay=${autoplay}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  )
}

export function usePublicVideoLightbox(videos: PublicVideo[]) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const prepared = useMemo(
    () =>
      videos.map((v) => ({
        video: v,
        youtubeId: extractYoutubeVideoId(v.youtubeUrl) || v.youtubeVideoId?.trim() || null,
      })),
    [videos],
  )

  const slides = useMemo(
    () =>
      prepared
        .filter((p): p is (typeof p & { youtubeId: string }) => Boolean(p.youtubeId))
        .map((p) => ({
          type: 'youtube' as const,
          youtubeId: p.youtubeId,
          poster: p.video.thumbnail,
          title: p.video.title,
        })),
    [prepared],
  )

  const openAtVideoIndex = useCallback(
    (videoIndex: number) => {
      const p = prepared[videoIndex]
      if (!p) return
      if (!p.youtubeId) {
        window.open(p.video.youtubeUrl, '_blank', 'noopener,noreferrer')
        return
      }
      const slideIndex = slides.findIndex((s) => s.youtubeId === p.youtubeId)
      if (slideIndex < 0) return
      setIndex(slideIndex)
      setOpen(true)
    },
    [prepared, slides],
  )

  const videoLightbox =
    slides.length > 0 ? (
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
          closeOnEscape: true,
        }}
        on={{ view: ({ index: i }) => setIndex(i) }}
        carousel={{ finite: true, padding: '4%', spacing: '4%' }}
        toolbar={{ buttons: [] }}
        render={{
          controls: () => <LightboxFloatingClose />,
          slide: ({ slide, offset, rect }) => {
            if (slide.type !== 'youtube') return undefined
            return <YoutubeSlideView slide={slide as YoutubeSlide} offset={offset} rect={rect} />
          },
        }}
      />
    ) : null

  return { openAtVideoIndex, videoLightbox }
}
