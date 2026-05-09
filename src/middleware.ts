import type { NextFetchEvent, NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'

const authMiddleware = withAuth({
  pages: { signIn: '/admin/login' },
  callbacks: {
    authorized: ({ token, req }) => {
      const p = req.nextUrl.pathname
      if (p === '/admin/login' || p.startsWith('/admin/login/')) return true
      if (p.startsWith('/api/auth/')) return true
      return !!token
    },
  },
})

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) {
    const first = fwd.split(',')[0]?.trim()
    if (first) return first.slice(0, 128)
  }
  const realIp = req.headers.get('x-real-ip')?.trim()
  return realIp ? realIp.slice(0, 128) : null
}

/** Mutations plus GET export/download endpoints (still privacy-light: path only, no body). */
function shouldLogAdminApi(req: NextRequest): boolean {
  const p = req.nextUrl.pathname
  if (!p.startsWith('/api/admin/')) return false
  const method = req.method
  if (method === 'HEAD' || method === 'OPTIONS') return false
  if (method !== 'GET') return true
  return p.includes('/export')
}

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const p = req.nextUrl.pathname
  const method = req.method

  if (shouldLogAdminApi(req)) {
    const secret = process.env.NEXTAUTH_SECRET
    if (secret) {
      const token = await getToken({ req, secret })
      const payload = JSON.stringify({
        method,
        path: `${p}${req.nextUrl.search}`.slice(0, 2048),
        actorEmail: typeof token?.email === 'string' ? token.email : null,
        actorId: typeof token?.sub === 'string' ? token.sub : null,
        ipAddress: clientIp(req),
      })
      void fetch(`${req.nextUrl.origin}/api/internal/admin-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-audit-secret': secret,
        },
        body: payload,
      }).catch(() => null)
    }
  }

  // next-auth augments the request type inside its handler; entry shape is standard NextRequest.
  return authMiddleware(req as Parameters<typeof authMiddleware>[0], event)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}