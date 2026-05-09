import type { NextFetchEvent, NextRequest } from 'next/server'
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

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  return authMiddleware(req as Parameters<typeof authMiddleware>[0], event)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}