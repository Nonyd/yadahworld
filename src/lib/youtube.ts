/** Extract YouTube video id from common URL shapes. */
export function extractYoutubeVideoId(url: string): string | null {
  const u = url.trim()
  if (!u) return null
  try {
    const parsed = new URL(u)
    const host = parsed.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\//, '').split('/')[0]
      return id || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname.startsWith('/watch')) {
        return parsed.searchParams.get('v')
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] ?? null
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] ?? null
      }
    }
  } catch {
    // bare id
    if (/^[a-zA-Z0-9_-]{11}$/.test(u)) return u
    return null
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(u)) return u
  return null
}

export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/** Prefer maxres; caller may fall back if image 404s. */
export function youtubeThumbnailUrl(videoId: string, quality: 'maxres' | 'hq' = 'maxres') {
  const q = quality === 'maxres' ? 'maxresdefault' : 'hqdefault'
  return `https://img.youtube.com/vi/${videoId}/${q}.jpg`
}

export function youtubeThumbnailFromUrl(youtubeUrl: string, override?: string | null) {
  const trimmed = override?.trim()
  if (trimmed) return trimmed
  const id = extractYoutubeVideoId(youtubeUrl)
  if (!id) return ''
  return youtubeThumbnailUrl(id)
}

/** Accept full playlist URL or raw playlist id (e.g. PL…). */
export function extractYoutubePlaylistId(input: string): string {
  const t = input.trim()
  if (!t) return ''
  try {
    const parsed = new URL(t.startsWith('http') ? t : `https://${t}`)
    const list = parsed.searchParams.get('list')
    if (list) return list
  } catch {
    // fall through
  }
  return t
}
