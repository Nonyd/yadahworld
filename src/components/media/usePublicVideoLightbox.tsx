'use client'

import { useCallback, useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import type { PublicVideo } from '@/lib/site-content'
import { extractYoutubeVideoId } from '@/lib/youtube'

export function usePublicVideoLightbox(videos: PublicVideo[]) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const prepared = useMemo(
    () =>
      videos.map((v) => ({
        video: v,
        youtubeId: extractYoutubeVideoId(v.youtubeUrl),
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
        on={{ view: ({ index: i }) => setIndex(i) }}
        carousel={{ finite: true, padding: '4%', spacing: '4%' }}
        render={{
          slide: ({ slide, offset, rect }) => {
            if (slide.type !== 'youtube') return undefined
            const autoplay = offset === 0 ? 1 : 0
            return (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ maxWidth: rect.width, maxHeight: rect.height }}
              >
                <div className="relative aspect-video w-full max-w-[min(100%,960px)] overflow-hidden rounded-sm bg-black shadow-lg">
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
          },
        }}
      />
    ) : null

  return { openAtVideoIndex, videoLightbox }
}
