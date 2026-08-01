/** True when a preview MP3/M4A URL is hosted by Apple (iTunes / Apple Music). */
export function isApplePreviewUrl(url: string | null | undefined): boolean {
  const raw = url?.trim()
  if (!raw) return false
  try {
    const host = new URL(raw).hostname.toLowerCase()
    return (
      host === 'itunes.apple.com' ||
      host.endsWith('.itunes.apple.com') ||
      host === 'audio-ssl.itunes.apple.com' ||
      (host.endsWith('.apple.com') && host.includes('itunes'))
    )
  } catch {
    return /itunes\.apple\.com|audio-ssl\.itunes\.apple\.com/i.test(raw)
  }
}
