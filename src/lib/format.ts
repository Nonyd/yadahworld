export function formatViewCount(count: string | null | undefined): string {
  if (!count) return ''
  const n = parseInt(count, 10)
  if (isNaN(n)) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K views`
  return `${n.toLocaleString()} views`
}
