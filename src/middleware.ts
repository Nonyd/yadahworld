import { withAuth } from 'next-auth/middleware'

export default withAuth({
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

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}