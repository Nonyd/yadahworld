export type StreamingLink = { label: string; url: string }

/** Parse DB JSON or API payload into safe link rows (https only, trimmed). */
export function normalizeStreamingLinksJson(value: unknown): StreamingLink[] {
  if (value === null || value === undefined) return []
  if (!Array.isArray(value)) return []
  const out: StreamingLink[] = []
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue
    const o = item as Record<string, unknown>
    const label = String(o.label ?? '').trim().slice(0, 120)
    const url = String(o.url ?? '').trim().slice(0, 2000)
    if (!label || !url) continue
    if (!/^https?:\/\//i.test(url)) continue
    out.push({ label, url })
  }
  return out
}
