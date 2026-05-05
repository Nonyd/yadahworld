type RateLimitConfig = {
  key: string
  max: number
  windowMs: number
}

type Bucket = {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, Bucket>()

function cleanupRateLimitBuckets(now: number) {
  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key)
    }
  }
}

export function checkRateLimit(config: RateLimitConfig) {
  const now = Date.now()
  cleanupRateLimitBuckets(now)

  const current = rateLimitBuckets.get(config.key)
  if (!current || current.resetAt <= now) {
    const next: Bucket = { count: 1, resetAt: now + config.windowMs }
    rateLimitBuckets.set(config.key, next)
    return { allowed: true, remaining: config.max - 1, resetAt: next.resetAt }
  }

  if (current.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  rateLimitBuckets.set(config.key, current)
  return { allowed: true, remaining: Math.max(0, config.max - current.count), resetAt: current.resetAt }
}

type HeaderBag = unknown

function readHeader(headers: HeaderBag, name: string) {
  if (typeof headers === 'object' && headers !== null && 'get' in headers && typeof (headers as { get?: unknown }).get === 'function') {
    return ((headers as { get: (n: string) => string | null }).get(name) ?? null)
  }
  if (typeof headers !== 'object' || headers === null) return null
  const bag = headers as Record<string, string | string[] | undefined>
  const lowerName = name.toLowerCase()
  const value = bag[lowerName] ?? bag[name]
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

export function getClientIp(req: { headers: unknown }) {
  const forwarded = readHeader(req.headers, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return readHeader(req.headers, 'x-real-ip')?.trim() || 'unknown'
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function normalizeEmailHeader(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

export function maskSecret(value: string | null | undefined) {
  if (!value?.trim()) return null
  return '••••••••'
}
