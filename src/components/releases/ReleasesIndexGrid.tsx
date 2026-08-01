'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { releaseTypeDateLine } from '@/lib/release-display'
import type { PublicRelease } from '@/lib/site-content'

export default function ReleasesIndexGrid({
  releases,
  badgeNew,
}: {
  releases: PublicRelease[]
  badgeNew: string
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingSlug, setPlayingSlug] = useState<string | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio
    const onEnded = () => setPlayingSlug(null)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.pause()
      audio.removeEventListener('ended', onEnded)
      audioRef.current = null
    }
  }, [])

  const togglePreview = async (e: React.MouseEvent, slug: string, url: string) => {
    e.preventDefault()
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return

    if (playingSlug === slug) {
      audio.pause()
      setPlayingSlug(null)
      return
    }

    audio.pause()
    audio.src = url
    setPlayingSlug(slug)
    try {
      await audio.play()
    } catch {
      setPlayingSlug(null)
    }
  }

  return (
    <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
      {releases.map((rel) => {
        const preview = rel.previewUrl?.trim()
        const isPlaying = playingSlug === rel.slug
        return (
          <li key={rel.slug}>
            <Link href={`/releases/${rel.slug}`} className="group block">
              <div className="manuscript-frame relative mb-4 aspect-square overflow-hidden shadow-[0_4px_24px_rgba(13,11,8,0.06)]">
                <Image
                  src={rel.cover}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {rel.isNew && (
                  <span className="ui-label absolute left-3 top-3 bg-accent px-2 py-1 text-[10px] text-ivory">
                    {badgeNew}
                  </span>
                )}
              </div>
              <p className="font-playfair text-base text-body transition-colors group-hover:text-accent">
                {rel.title}
              </p>
              <p className="ui-label mt-1 text-muted">{releaseTypeDateLine(rel)}</p>
            </Link>
            {preview ? (
              <button
                type="button"
                onClick={(e) => void togglePreview(e, rel.slug, preview)}
                className="ui-label mt-2 inline-flex items-center gap-1.5 text-[10px] text-muted transition-colors hover:text-accent"
                aria-label={isPlaying ? `Pause preview of ${rel.title}` : `Preview ${rel.title}`}
              >
                <span aria-hidden>{isPlaying ? '❚❚' : '▶'}</span>
                {isPlaying ? 'Playing' : 'Preview'}
              </button>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
