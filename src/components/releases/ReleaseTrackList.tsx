'use client'

import { useEffect, useRef, useState } from 'react'
import type { PublicReleaseTrack } from '@/lib/site-content'

function formatDuration(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return '—'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function ReleaseTrackList({ tracks }: { tracks: PublicReleaseTrack[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio

    const onTime = () => {
      if (!audio.duration || !Number.isFinite(audio.duration)) {
        setProgress(0)
        return
      }
      setProgress(audio.currentTime / audio.duration)
    }
    const onEnded = () => {
      setPlayingId(null)
      setProgress(0)
    }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audioRef.current = null
    }
  }, [])

  const toggle = async (track: PublicReleaseTrack) => {
    const audio = audioRef.current
    const url = track.previewUrl?.trim()
    if (!audio || !url) return

    if (playingId === track.id) {
      audio.pause()
      setPlayingId(null)
      setProgress(0)
      return
    }

    audio.pause()
    audio.src = url
    setPlayingId(track.id)
    setProgress(0)
    try {
      await audio.play()
    } catch {
      setPlayingId(null)
      setProgress(0)
    }
  }

  if (!tracks.length) return null

  return (
    <div className="mb-10 max-w-xl">
      <h2 className="eyebrow mb-4">Tracks</h2>
      <ol className="divide-y divide-[rgba(42,37,32,0.1)] border-y border-[rgba(42,37,32,0.1)]">
        {tracks.map((track) => {
          const canPlay = Boolean(track.previewUrl?.trim())
          const isPlaying = playingId === track.id
          return (
            <li key={track.id} className="flex items-center gap-3 py-3">
              <span className="w-6 shrink-0 font-jost text-[11px] tabular-nums text-muted">
                {track.trackNumber}
              </span>
              {canPlay ? (
                <button
                  type="button"
                  onClick={() => void toggle(track)}
                  aria-label={isPlaying ? `Pause ${track.name}` : `Preview ${track.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold-light/40 text-accent transition-colors hover:border-accent hover:bg-accent/5"
                >
                  {isPlaying ? (
                    <span className="flex gap-0.5" aria-hidden>
                      <span className="h-3 w-0.5 bg-accent" />
                      <span className="h-3 w-0.5 bg-accent" />
                    </span>
                  ) : (
                    <span
                      className="ml-0.5 block h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-accent"
                      aria-hidden
                    />
                  )}
                </button>
              ) : (
                <span className="h-8 w-8 shrink-0" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-jost text-sm text-body">{track.name}</p>
                {isPlaying && (
                  <div className="mt-1.5 h-0.5 overflow-hidden rounded-full bg-[rgba(42,37,32,0.1)]">
                    <div
                      className="h-full bg-accent transition-[width] duration-150 ease-linear"
                      style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                    />
                  </div>
                )}
              </div>
              <span className="shrink-0 font-jost text-[11px] tabular-nums text-muted">
                {formatDuration(track.durationMs)}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
