/** Normalize browser-reported MIME; some OSes leave `type` empty for valid images. */
export function resolveImageMime(file: { type?: string; name?: string }): string | null {
  const t = file.type?.trim().toLowerCase()
  if (t && t !== 'application/octet-stream') return t

  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.png')) return 'image/png'
  if (name.endsWith('.webp')) return 'image/webp'
  if (name.endsWith('.gif')) return 'image/gif'
  if (name.endsWith('.heic')) return 'image/heic'
  if (name.endsWith('.heif')) return 'image/heif'
  if (name.endsWith('.avif')) return 'image/avif'
  return t || null
}
