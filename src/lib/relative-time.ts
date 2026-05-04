/** Short English relative time for admin UI. */
export function formatRelativeTimeAgo(date: Date | null | undefined): string {
  if (!date) return 'Never'
  const sec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (sec < 10) return 'Just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 48) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 14) return `${day}d ago`
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
