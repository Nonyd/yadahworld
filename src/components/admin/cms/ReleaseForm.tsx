'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SiteRelease } from '@prisma/client'
import { slugify } from '@/lib/slug'
import { toDateInputValue } from '@/lib/release-date'
import { normalizeStreamingLinksJson } from '@/lib/streaming-links'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'

type Mode = 'create' | 'edit'

export default function ReleaseForm({ mode, initial }: { mode: Mode; initial?: SiteRelease }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [feat, setFeat] = useState(initial?.feat ?? '')
  const [type, setType] = useState(initial?.type ?? 'Single')
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear().toString())
  const [cover, setCover] = useState(initial?.cover ?? '')
  const [spotify, setSpotify] = useState(initial?.spotify ?? '')
  const [spotifyEmbed, setSpotifyEmbed] = useState(initial?.spotifyEmbed ?? '')
  const [apple, setApple] = useState(initial?.apple ?? '')
  const [youtube, setYoutube] = useState(initial?.youtube ?? '')
  const [musicVideoYoutube, setMusicVideoYoutube] = useState(initial?.musicVideoYoutube ?? '')
  const [streamingLinks, setStreamingLinks] = useState<{ label: string; url: string }[]>(() =>
    normalizeStreamingLinksJson(initial?.streamingLinks ?? undefined),
  )
  const [isNew, setIsNew] = useState(initial?.isNew ?? false)
  const [releasedAt, setReleasedAt] = useState(toDateInputValue(initial?.releasedAt))
  const [showOnHomepage, setShowOnHomepage] = useState(initial?.showOnHomepage ?? false)
  const [order, setOrder] = useState(initial?.order ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const generateSlug = () => setSlug(slugify(title))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cover.trim()) {
      setError('Add cover art (upload or URL).')
      return
    }
    setSaving(true)
    setError('')
    const basePayload = {
      title,
      description: description.trim() || null,
      feat: feat || null,
      type,
      year,
      cover,
      spotify: spotify || null,
      spotifyEmbed: spotifyEmbed.trim() || null,
      apple: apple || null,
      youtube: youtube || null,
      musicVideoYoutube: musicVideoYoutube.trim() || null,
      streamingLinks: streamingLinks
        .map(({ label, url }) => ({ label: label.trim(), url: url.trim() }))
        .filter((l) => l.label && l.url),
      isNew,
      order: Number(order) || 0,
      releasedAt,
      showOnHomepage,
    }
    try {
      if (mode === 'create') {
        const payload = {
          ...basePayload,
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        }
        const res = await fetch('/api/admin/releases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.error || 'Failed to create')
        }
        router.push('/admin/releases')
        router.refresh()
        return
      }
      if (!initial?.id) return
      const res = await fetch(`/api/admin/releases/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basePayload,
          ...(slug.trim() ? { slug: slug.trim() } : {}),
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      router.push('/admin/releases')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-2xl space-y-6 p-6 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="admin-label">Title</label>
          <input className="admin-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="admin-label">URL slug</label>
            <input className="admin-input font-mono text-sm" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from title if empty" />
            <p className="mt-1 text-xs text-admin-muted">Public page: /releases/your-slug</p>
          </div>
          <button type="button" className="admin-btn admin-btn-secondary shrink-0 text-[10px]" onClick={generateSlug}>
            Generate from title
          </button>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Description (optional)</label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            minHeight="180px"
            placeholder="Release description..."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Featuring (optional)</label>
          <input className="admin-input" value={feat} onChange={(e) => setFeat(e.target.value)} placeholder="ft. Artist" />
        </div>
        <div>
          <label className="admin-label">Type</label>
          <input className="admin-input" value={type} onChange={(e) => setType(e.target.value)} required />
        </div>
        <div>
          <label className="admin-label">Year (display)</label>
          <input className="admin-input" value={year} onChange={(e) => setYear(e.target.value)} required />
          <p className="mt-1 text-xs text-admin-muted">Shown as “Type · Year” on the site. Sorting uses release date below.</p>
        </div>
        <div>
          <label className="admin-label">Release date (catalog)</label>
          <input
            type="date"
            className="admin-input"
            value={releasedAt}
            onChange={(e) => setReleasedAt(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-admin-muted">Exact date — controls order on the public /releases page (newest first).</p>
        </div>
        <div className="sm:col-span-2">
          <AdminImageUpload
            label="Cover art"
            value={cover}
            onChange={setCover}
            folder="releases"
            hint="Upload a square image (recommended 1200×1200 or larger). Stored as a Cloudinary URL, or paste any image URL."
          />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Spotify URL</label>
          <input className="admin-input" value={spotify} onChange={(e) => setSpotify(e.target.value)} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Spotify embed (optional)</label>
          <textarea
            className="admin-input min-h-[120px] resize-y font-mono text-xs"
            value={spotifyEmbed}
            onChange={(e) => setSpotifyEmbed(e.target.value)}
            placeholder={'Paste the embed iframe from Spotify (Share → Embed), or a URL like https://open.spotify.com/embed/track/…'}
          />
          <p className="mt-1 text-xs text-admin-muted">
            Only Spotify embed URLs are stored. Invalid paste is ignored on save.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Apple Music URL</label>
          <input className="admin-input" value={apple} onChange={(e) => setApple(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">YouTube URL</label>
          <input className="admin-input" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="Channel / search / watch link for the “YouTube” button" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Music video (YouTube, optional)</label>
          <input
            className="admin-input"
            value={musicVideoYoutube}
            onChange={(e) => setMusicVideoYoutube(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=… for the official video embed on this page"
          />
        </div>

        <div className="sm:col-span-2 space-y-3 border-t border-admin-border pt-6">
          <div>
            <label className="admin-label">More streaming links</label>
            <p className="mt-1 text-xs text-admin-muted">
              Add any platform (Audiomack, Boomplay, Deezer, etc.). <strong>Label</strong> is the button text (e.g.{' '}
              <span className="font-mono">Listen on Audiomack</span> or <span className="font-mono">Audiomack</span>).{' '}
              <strong>URL</strong> must start with <span className="font-mono">https://</span>.
            </p>
          </div>
          {streamingLinks.map((row, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border border-admin-border/80 bg-black/[0.02] p-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label className="admin-label text-[10px]">Button label</label>
                <input
                  className="admin-input"
                  value={row.label}
                  onChange={(e) => {
                    const v = e.target.value
                    setStreamingLinks((rows) => rows.map((r, j) => (j === i ? { ...r, label: v } : r)))
                  }}
                  placeholder="e.g. Audiomack"
                />
              </div>
              <div className="min-w-0 flex-[2]">
                <label className="admin-label text-[10px]">URL</label>
                <input
                  className="admin-input font-mono text-xs"
                  value={row.url}
                  onChange={(e) => {
                    const v = e.target.value
                    setStreamingLinks((rows) => rows.map((r, j) => (j === i ? { ...r, url: v } : r)))
                  }}
                  placeholder="https://..."
                />
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost shrink-0 self-end text-[10px] sm:self-auto"
                onClick={() => setStreamingLinks((rows) => rows.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-secondary text-[10px]"
            onClick={() => setStreamingLinks((rows) => [...rows, { label: '', url: '' }])}
          >
            Add streaming link
          </button>
        </div>

        <div className="sm:col-span-2 border-t border-admin-border pt-6">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-admin-text">
            <input
              type="checkbox"
              checked={showOnHomepage}
              onChange={(e) => setShowOnHomepage(e.target.checked)}
              className="h-4 w-4 rounded border-admin-border text-admin-accent"
            />
            Show on homepage (music section)
          </label>
          <p className="mt-2 text-xs text-admin-muted pl-7">
            Checked releases are candidates for the home music grid. Only the first four are shown, sorted by homepage order (then release date — newer first when order matches).
          </p>
        </div>
        <div>
          <label className="admin-label">Homepage order</label>
          <input
            type="number"
            className="admin-input"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-admin-muted">Lower numbers first among homepage picks (ties broken by newer release date).</p>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-admin-text">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="h-4 w-4 rounded border-admin-border text-admin-accent" />
            Show “New” badge
          </label>
        </div>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? 'Saving…' : mode === 'create' ? 'Create release' : 'Save changes'}
        </button>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  )
}
