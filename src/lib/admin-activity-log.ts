import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import type { Session } from 'next-auth'
import { prisma } from '@/lib/prisma'

function clientIpFromHeaderBag(h: Headers): string | null {
  const fwd = h.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0]?.trim()
    if (first) return first.slice(0, 128)
  }
  const realIp = h.get('x-real-ip')?.trim()
  return realIp ? realIp.slice(0, 128) : null
}

async function resolveIp(req?: NextRequest): Promise<string | null> {
  if (req) return clientIpFromHeaderBag(req.headers)
  const h = await headers()
  return clientIpFromHeaderBag(h)
}

/**
 * Persist one activity row from an authenticated admin API handler (Node runtime).
 * Safe to await on success paths only; failures are logged and never thrown.
 */
export async function logAdminApiActivity(
  session: Session | null,
  opts: { method: string; path: string; req?: NextRequest; actorEmail?: string | null },
): Promise<void> {
  const path = opts.path.slice(0, 2048)
  const method = opts.method.slice(0, 16)
  const ipAddress = await resolveIp(opts.req)
  const actorEmail =
    opts.actorEmail !== undefined
      ? (typeof opts.actorEmail === 'string' ? opts.actorEmail.trim() || null : null)
      : session?.user?.email?.trim() || null

  try {
    await prisma.adminActivityLog.create({
      data: {
        method,
        path,
        actorEmail,
        actorId: null,
        ipAddress,
      },
    })
  } catch (e) {
    console.error('[AdminActivityLog]', e)
  }
}
