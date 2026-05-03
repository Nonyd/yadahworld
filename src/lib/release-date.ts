/** Public display for catalog / detail (e.g. "20 Aug 2024"). */
export function formatReleaseDateDisplay(iso: string | undefined | null): string {
  if (!iso?.trim()) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Parse admin `YYYY-MM-DD` or ISO datetime into a stable UTC `Date` for storage. */
export function parseReleasedAtInput(input: string | undefined | null, fallback: Date): Date {
  const t = input?.trim()
  if (!t) return fallback
  const d = t.length <= 10 ? new Date(`${t}T12:00:00.000Z`) : new Date(t)
  return Number.isNaN(d.getTime()) ? fallback : d
}

export function toDateInputValue(d: Date | string | undefined): string {
  if (!d) {
    const n = new Date()
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`
  }
  const x = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(x.getTime())) {
    return toDateInputValue(undefined)
  }
  // Values stored from calendar input use UTC noon — read back with UTC date parts.
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, '0')}-${String(x.getUTCDate()).padStart(2, '0')}`
}
