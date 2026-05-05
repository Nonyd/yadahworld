import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { checkRateLimit } from '@/lib/security'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPasswordHash = process.env.ADMIN_PASSWORD
        const email = credentials?.email?.trim().toLowerCase()
        const password = credentials?.password
        const ip = (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
        const throttle = checkRateLimit({
          key: `auth:admin-login:${ip}:${email ?? 'unknown'}`,
          max: 6,
          windowMs: 10 * 60 * 1000,
        })

        if (!throttle.allowed) return null

        if (
          email &&
          password &&
          adminEmail &&
          adminPasswordHash &&
          email === adminEmail.trim().toLowerCase() &&
          (await bcrypt.compare(password, adminPasswordHash))
        ) {
          return { id: '1', email, name: 'Admin' }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 },
  jwt: { maxAge: 8 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
      }
      return session
    },
  },
}
