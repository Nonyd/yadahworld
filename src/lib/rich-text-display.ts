/** Prepare stored CMS string for `dangerouslySetInnerHTML` inside `.prose`. */
export function proseHtmlFromStored(value: string | null | undefined): string {
  const t = (value ?? '').trim()
  if (!t) return ''
  if (/<[a-z][\s\S]*>/i.test(t)) return t
  const escaped = t
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return escaped
    .split(/\n\n+/)
    .map((block) => `<p>${block.replace(/\n/g, '<br/>')}</p>`)
    .join('')
}
