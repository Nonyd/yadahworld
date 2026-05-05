import { withAuth } from 'next-auth/middleware'

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export default withAuth({
  pages: { signIn: '/admin/login' },
  callbacks: {
    authorized: ({ token, req }) => {
      const p = req.nextUrl.pathname
      if (p === '/admin/login' || p.startsWith('/admin/login/')) return true
      if (p.startsWith('/api/admin/') && STATE_CHANGING_METHODS.has(req.method)) {
        const origin = req.headers.get('origin')
        const host = req.headers.get('host')
        const proto = req.headers.get('x-forwarded-proto') || 'https'
        if (!origin || !host || origin.toLowerCase() !== `${proto}://${host}`.toLowerCase()) {
          return false
        }
      }
      return !!token
    },
  },
})

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
