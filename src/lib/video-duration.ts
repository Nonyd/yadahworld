/** Parse YouTube API ISO 8601 duration (e.g. PT4M33S) to `4:33` or `1:04:02`. */
export function parseYoutubeIsoDuration(iso: string | null | undefined): string {
  if (!iso) return ''
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const h = match[1] ? Number(match[1]) : 0
  const m = match[2] != null ? Number(match[2]) : 0
  const s = match[3] != null ? Number(match[3]) : 0
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}
