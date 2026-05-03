/** URL-safe slug from a title or phrase. */
export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'release'
}
