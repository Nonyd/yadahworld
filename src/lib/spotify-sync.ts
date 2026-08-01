import { Prisma } from '@prisma/client'
import { images } from '@/lib/imagePlaceholders'
import { prisma } from '@/lib/prisma'
import { uniqueReleaseSlug } from '@/lib/site-content'
import { getSpotifyConfig } from '@/lib/site-settings'
import { slugify } from '@/lib/slug'
import { spotifyFetch } from '@/lib/spotify'

export type SyncSpotifyResult = {
  ok: boolean
  created: number
  updated: number
  note: string
}

type SpotifyImage = { url: string; height: number | null; width: number | null }

type SpotifyAlbumSimplified = {
  id: string
  name: string
  album_type: string
  release_date: string
  release_date_precision?: string
  external_urls?: { spotify?: string }
  images?: SpotifyImage[]
  artists?: { id: string; name: string }[]
}

type SpotifyPaging<T> = {
  items: T[]
  next: string | null
}

type SpotifyTrackSimplified = {
  id: string
  name: string
  track_number: number
  duration_ms: number
  preview_url: string | null
}

type ItunesAlbumResult = {
  collectionName?: string
  collectionViewUrl?: string
  artistName?: string
  collectionId?: number
}

type ItunesSongResult = {
  trackName?: string
  previewUrl?: string
  collectionName?: string
  artistName?: string
  wrapperType?: string
  kind?: string
}

/** Sync-owned field keys stored in `lockedFields`. */
export const SPOTIFY_SYNC_LOCK_FIELDS = ['title', 'type', 'date', 'cover', 'spotify', 'apple'] as const
export type SpotifySyncLockField = (typeof SPOTIFY_SYNC_LOCK_FIELDS)[number]

export function parseLockedFields(value: unknown): Set<string> {
  if (!Array.isArray(value)) return new Set()
  return new Set(value.filter((x): x is string => typeof x === 'string' && x.length > 0))
}

function isLocked(locked: Set<string>, field: SpotifySyncLockField): boolean {
  return locked.has(field)
}

function mapAlbumType(albumType: string): string {
  const t = albumType.trim().toLowerCase()
  if (t === 'single') return 'Single'
  return 'Album'
}

function largestImageUrl(images: SpotifyImage[] | undefined): string | null {
  if (!images?.length) return null
  const sorted = [...images].sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
  return sorted[0]?.url?.trim() || null
}

function parseSpotifyReleaseDate(releaseDate: string, precision?: string): Date {
  const raw = releaseDate.trim()
  if (!raw) return new Date()
  if (precision === 'year' || /^\d{4}$/.test(raw)) {
    return new Date(`${raw}-01-01T12:00:00.000Z`)
  }
  if (precision === 'month' || /^\d{4}-\d{2}$/.test(raw)) {
    return new Date(`${raw}-01T12:00:00.000Z`)
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T12:00:00.000Z`)
  }
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

function yearFromDate(d: Date): string {
  return String(d.getUTCFullYear())
}

/** Lowercase, strip punctuation and feat./ft. suffixes for Apple Music matching. */
export function normalizeMusicTitle(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s*[\(\[]\s*(feat\.?|ft\.?|featuring)\b[^\)\]]*[\)\]]/gi, '')
    .replace(/\s+(feat\.?|ft\.?|featuring)\b.*$/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchAllArtistAlbums(artistId: string): Promise<SpotifyAlbumSimplified[]> {
  const albums: SpotifyAlbumSimplified[] = []
  // Spotify caps this endpoint at limit=10 (default 5) — higher values return 400 "Invalid limit".
  let path: string | null =
    `/v1/artists/${encodeURIComponent(artistId)}/albums?include_groups=album,single&market=NG&limit=10`

  while (path) {
    const page: SpotifyPaging<SpotifyAlbumSimplified> =
      await spotifyFetch<SpotifyPaging<SpotifyAlbumSimplified>>(path)
    albums.push(...(page.items ?? []))
    // spotifyFetch accepts absolute next URLs from the API.
    path = page.next
  }

  // Deduplicate by album id (appears once per market/group sometimes).
  const seen = new Set<string>()
  return albums.filter((a) => {
    if (!a.id || seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })
}

async function fetchAlbumTracks(albumId: string): Promise<SpotifyTrackSimplified[]> {
  const tracks: SpotifyTrackSimplified[] = []
  let path: string | null =
    `/v1/albums/${encodeURIComponent(albumId)}/tracks?limit=50&market=NG`

  while (path) {
    const page: SpotifyPaging<SpotifyTrackSimplified> =
      await spotifyFetch<SpotifyPaging<SpotifyTrackSimplified>>(path)
    tracks.push(...(page.items ?? []))
    path = page.next
  }
  return tracks
}

async function findAppleMusicUrl(artistName: string, title: string): Promise<string | null> {
  const term = encodeURIComponent(`${artistName} ${title}`.trim())
  const url = `https://itunes.apple.com/search?term=${term}&entity=album&country=NG&limit=5`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as { results?: ItunesAlbumResult[] }
    const want = normalizeMusicTitle(title)
    if (!want) return null
    for (const row of data.results ?? []) {
      const name = row.collectionName?.trim()
      const link = row.collectionViewUrl?.trim()
      if (!name || !link) continue
      if (normalizeMusicTitle(name) === want) return link
    }
  } catch {
    // silent skip
  }
  return null
}

/**
 * Build a map of normalized track title → Apple 30s preview URL for an album.
 * One search per album (not per track) to stay kind to the iTunes API.
 */
async function fetchApplePreviewMap(
  artistName: string,
  albumTitle: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const term = encodeURIComponent(`${artistName} ${albumTitle}`.trim())
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&country=NG&limit=50`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return map
    const data = (await res.json()) as { results?: ItunesSongResult[] }
    const wantAlbum = normalizeMusicTitle(albumTitle)
    for (const row of data.results ?? []) {
      if (row.kind && row.kind !== 'song') continue
      const trackName = row.trackName?.trim()
      const preview = row.previewUrl?.trim()
      if (!trackName || !preview) continue
      // Prefer rows that match this album when collectionName is present.
      if (row.collectionName && wantAlbum) {
        const gotAlbum = normalizeMusicTitle(row.collectionName)
        if (gotAlbum && gotAlbum !== wantAlbum) continue
      }
      const key = normalizeMusicTitle(trackName)
      if (key && !map.has(key)) map.set(key, preview)
    }
  } catch {
    // silent skip — Spotify previews still apply
  }
  return map
}

/** Per-track Apple search when album-scoped search missed a title. */
async function findAppleTrackPreview(
  artistName: string,
  trackName: string,
): Promise<string | null> {
  const term = encodeURIComponent(`${artistName} ${trackName}`.trim())
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&country=NG&limit=5`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as { results?: ItunesSongResult[] }
    const want = normalizeMusicTitle(trackName)
    if (!want) return null
    for (const row of data.results ?? []) {
      if (row.kind && row.kind !== 'song') continue
      const name = row.trackName?.trim()
      const preview = row.previewUrl?.trim()
      if (!name || !preview) continue
      if (normalizeMusicTitle(name) === want) return preview
    }
  } catch {
    // silent skip
  }
  return null
}

async function upsertTracks(
  releaseId: string,
  albumId: string,
  artistName: string,
  albumTitle: string,
): Promise<void> {
  const tracks = await fetchAlbumTracks(albumId)
  const needsApple = tracks.some((t) => t.id && !t.preview_url?.trim())
  const appleMap = needsApple ? await fetchApplePreviewMap(artistName, albumTitle) : new Map<string, string>()

  for (const t of tracks) {
    if (!t.id) continue
    let previewUrl = t.preview_url?.trim() || null
    if (!previewUrl) {
      const key = normalizeMusicTitle(t.name)
      previewUrl = (key && appleMap.get(key)) || null
      if (!previewUrl) {
        previewUrl = await findAppleTrackPreview(artistName, t.name)
      }
    }

    await prisma.releaseTrack.upsert({
      where: { spotifyTrackId: t.id },
      create: {
        releaseId,
        spotifyTrackId: t.id,
        name: t.name,
        trackNumber: t.track_number,
        durationMs: t.duration_ms ?? null,
        previewUrl,
      },
      update: {
        releaseId,
        name: t.name,
        trackNumber: t.track_number,
        durationMs: t.duration_ms ?? null,
        // Prefer Spotify; fall back to Apple; omit previewUrl when neither found so existing Apple URL is kept.
        ...(previewUrl ? { previewUrl } : {}),
      },
    })
  }
}

async function writeSyncMeta(note: string, at: Date = new Date()): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      spotifyLastSyncAt: at,
      spotifyLastSyncNote: note,
    },
    update: {
      spotifyLastSyncAt: at,
      spotifyLastSyncNote: note,
    },
  })
}

export async function syncSpotify(): Promise<SyncSpotifyResult> {
  let created = 0
  let updated = 0

  try {
    const config = await getSpotifyConfig()
    if (!config.enabled || !config.clientId || !config.clientSecret || !config.artistId) {
      return { ok: false, created: 0, updated: 0, note: 'Spotify sync not configured' }
    }

    const artist = await spotifyFetch<{ name?: string }>(
      `/v1/artists/${encodeURIComponent(config.artistId)}`,
    )
    const artistName = artist.name?.trim() || 'Yadah'

    const albums = await fetchAllArtistAlbums(config.artistId)
    const now = new Date()

    for (const album of albums) {
      const existing = await prisma.siteRelease.findUnique({
        where: { spotifyAlbumId: album.id },
      })

      // Manual releases (no spotifyAlbumId) are never touched — we only key on spotifyAlbumId.
      const locked = parseLockedFields(existing?.lockedFields)
      const title = album.name?.trim() || 'Untitled'
      const type = mapAlbumType(album.album_type || 'album')
      const releasedAt = parseSpotifyReleaseDate(album.release_date, album.release_date_precision)
      const year = yearFromDate(releasedAt)
      const coverUrl = largestImageUrl(album.images)
      const spotifyUrl = album.external_urls?.spotify?.trim() || `https://open.spotify.com/album/${album.id}`
      const spotifyEmbed = `https://open.spotify.com/embed/album/${album.id}`

      if (!existing) {
        const slug = await uniqueReleaseSlug(slugify(title))
        const row = await prisma.siteRelease.create({
          data: {
            title,
            slug,
            type,
            year,
            cover: coverUrl || images.releaseNeverSeen,
            coverExternalUrl: coverUrl,
            spotify: spotifyUrl,
            spotifyEmbed,
            spotifyAlbumId: album.id,
            releasedAt,
            lastSyncedAt: now,
            showOnHomepage: false,
            isNew: false,
            order: 0,
          },
        })
        created += 1

        await upsertTracks(row.id, album.id, artistName, title)

        const appleUrl = await findAppleMusicUrl(artistName, title)
        if (appleUrl) {
          await prisma.siteRelease.update({
            where: { id: row.id },
            data: { apple: appleUrl },
          })
        }
        continue
      }

      const data: Prisma.SiteReleaseUpdateInput = {
        lastSyncedAt: now,
      }

      if (!isLocked(locked, 'title')) data.title = title
      if (!isLocked(locked, 'type')) data.type = type
      if (!isLocked(locked, 'date')) {
        data.releasedAt = releasedAt
        data.year = year
      }
      if (!isLocked(locked, 'cover') && coverUrl) {
        data.coverExternalUrl = coverUrl
      }
      if (!isLocked(locked, 'spotify')) {
        data.spotify = spotifyUrl
        data.spotifyEmbed = spotifyEmbed
      }
      // Never rewrite streamingLinks JSON — only the dedicated spotify/apple columns.

      if (!isLocked(locked, 'apple') && !existing.apple?.trim()) {
        const appleUrl = await findAppleMusicUrl(artistName, existing.title || title)
        if (appleUrl) data.apple = appleUrl
      }

      await prisma.siteRelease.update({
        where: { id: existing.id },
        data,
      })
      updated += 1

      await upsertTracks(existing.id, album.id, artistName, existing.title || title)
    }

    const note = `${created + updated} releases synced (${created} created, ${updated} updated)`
    await writeSyncMeta(note, now)
    return { ok: true, created, updated, note }
  } catch (e) {
    const note = e instanceof Error ? e.message : 'Spotify sync failed'
    try {
      await writeSyncMeta(note)
    } catch {
      // ignore meta write failure
    }
    return { ok: false, created, updated, note }
  }
}
