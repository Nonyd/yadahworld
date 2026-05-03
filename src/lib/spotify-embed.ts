/** Normalize admin paste (iframe HTML or embed URL) to a safe Spotify embed HTTPS URL, or null. */
export function parseSpotifyEmbedUrl(input: string | null | undefined): string | null {
  const raw = input?.trim()
  if (!raw) return null

  const tryUrl = (s: string) => {
    try {
      const u = new URL(s.trim())
      if (u.protocol !== 'https:') return null
      const host = u.hostname.replace(/^www\./, '')
      if (host !== 'open.spotify.com') return null
      if (!u.pathname.startsWith('/embed/')) return null
      return u.toString()
    } catch {
      return null
    }
  }

  const direct = tryUrl(raw)
  if (direct) return direct

  const m = raw.match(/src\s*=\s*["']([^"']+)["']/i)
  if (m?.[1]) return tryUrl(m[1])

  return null
}
