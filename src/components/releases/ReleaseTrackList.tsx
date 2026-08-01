'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { PublicReleaseTrack } from '@/lib/site-content'
import { isApplePreviewUrl } from '@/lib/preview-source'

function formatDuration(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return '—'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function formatClock(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function ReleaseTrackList({
  tracks,
  cover,
  releaseTitle,
}: {
  tracks: PublicReleaseTrack[]
  cover: string
  releaseTitle: string
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [active, setActive] = useState<PublicReleaseTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentSec, setCurrentSec] = useState(0)
  const [durationSec, setDurationSec] = useState(30)

  const activeIsApple = isApplePreviewUrl(active?.previewUrl)
  const anyApplePreview = tracks.some((t) => isApplePreviewUrl(t.previewUrl))

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio

    const onTime = () => {
      if (!audio.duration || !Number.isFinite(audio.duration) || audio.duration <= 0) {
        setProgress(0)
        setCurrentSec(audio.currentTime || 0)
        return
      }
      setProgress(audio.currentTime / audio.duration)
      setCurrentSec(audio.currentTime)
      setDurationSec(audio.duration)
    }
    const onEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentSec(0)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audioRef.current = null
    }
  }, [])

  const playTrack = async (track: PublicReleaseTrack) => {
    const audio = audioRef.current
    const url = track.previewUrl?.trim()
    if (!audio || !url) return

    if (active?.id === track.id) {
      if (audio.paused) {
        try {
          await audio.play()
        } catch {
          setIsPlaying(false)
        }
      } else {
        audio.pause()
      }
      return
    }

    audio.pause()
    audio.src = url
    setActive(track)
    setProgress(0)
    setCurrentSec(0)
    setDurationSec(30)
    try {
      await audio.play()
    } catch {
      setIsPlaying(false)
    }
  }

  const toggleFooterPlay = async () => {
    const audio = audioRef.current
    if (!audio || !active?.previewUrl) return
    if (audio.paused) {
      try {
        await audio.play()
      } catch {
        setIsPlaying(false)
      }
    } else {
      audio.pause()
    }
  }

  const closeFooter = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
    }
    setActive(null)
    setIsPlaying(false)
    setProgress(0)
    setCurrentSec(0)
  }

  if (!tracks.length) return null

  return (
    <>
      <div className={`mb-10 max-w-xl ${active ? 'pb-24' : ''}`}>
        <h2 className="eyebrow mb-4">Tracks</h2>
        <p className="mb-3 font-jost text-[11px] text-muted">
          Tap a track for a 30-second preview. Full songs play in the Spotify player below.
          {anyApplePreview ? <> Some previews courtesy of Apple Music.</> : null}
        </p>
        <ol className="divide-y divide-[rgba(42,37,32,0.1)] border-y border-[rgba(42,37,32,0.1)]">
          {tracks.map((track) => {
            const canPlay = Boolean(track.previewUrl?.trim())
            const isActive = active?.id === track.id
            const rowClass = canPlay
              ? 'group flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-[rgba(139,38,53,0.04)]'
              : 'flex w-full items-center gap-3 py-3 text-left opacity-70'

            const content = (
              <>
                <span className="w-6 shrink-0 font-jost text-[11px] tabular-nums text-muted">
                  {track.trackNumber}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    canPlay
                      ? isActive && isPlaying
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-gold-light/40 text-accent group-hover:border-accent'
                      : 'border-transparent'
                  }`}
                  aria-hidden
                >
                  {canPlay ? (
                    isActive && isPlaying ? (
                      <span className="flex gap-0.5">
                        <span className="h-3 w-0.5 bg-accent" />
                        <span className="h-3 w-0.5 bg-accent" />
                      </span>
                    ) : (
                      <span className="ml-0.5 block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-accent" />
                    )
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate font-jost text-sm ${isActive ? 'text-accent' : 'text-body'}`}
                  >
                    {track.name}
                  </span>
                </span>
                <span className="shrink-0 font-jost text-[11px] tabular-nums text-muted">
                  {formatDuration(track.durationMs)}
                </span>
              </>
            )

            return (
              <li key={track.id}>
                {canPlay ? (
                  <button
                    type="button"
                    className={rowClass}
                    onClick={() => void playTrack(track)}
                    aria-label={
                      isActive && isPlaying
                        ? `Pause preview of ${track.name}`
                        : `Preview ${track.name} (30 seconds)`
                    }
                  >
                    {content}
                  </button>
                ) : (
                  <div className={rowClass} title="Preview unavailable">
                    {content}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      {active && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 border-t border-gold-light/25 bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] shadow-[0_-8px_32px_rgba(13,11,8,0.12)] backdrop-blur-md"
          role="region"
          aria-label="Track preview player"
        >
          <div className="mx-auto flex max-w-screen-lg items-center gap-3 px-4 py-3 md:gap-5 md:px-8">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-surface md:h-14 md:w-14">
              <Image src={cover} alt="" fill className="object-cover" sizes="56px" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-playfair text-sm text-body md:text-base">{active.name}</p>
              <p className="truncate font-jost text-[10px] uppercase tracking-[0.12em] text-muted">
                {activeIsApple ? (
                  <>Previews courtesy of Apple Music · {releaseTitle}</>
                ) : (
                  <>
                    {releaseTitle} · 30s preview
                  </>
                )}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="w-8 shrink-0 font-jost text-[10px] tabular-nums text-muted">
                  {formatClock(currentSec)}
                </span>
                <div className="h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[rgba(42,37,32,0.12)]">
                  <div
                    className="h-full bg-accent transition-[width] duration-150 ease-linear"
                    style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-jost text-[10px] tabular-nums text-muted">
                  {formatClock(durationSec)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void toggleFooterPlay()}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-ivory transition-opacity hover:opacity-90"
            >
              {isPlaying ? (
                <span className="flex gap-1" aria-hidden>
                  <span className="h-3.5 w-0.5 bg-ivory" />
                  <span className="h-3.5 w-0.5 bg-ivory" />
                </span>
              ) : (
                <span
                  className="ml-0.5 block h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-ivory"
                  aria-hidden
                />
              )}
            </button>

            <button
              type="button"
              onClick={closeFooter}
              aria-label="Close preview player"
              className="ui-label shrink-0 px-1 text-muted transition-colors hover:text-accent"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
