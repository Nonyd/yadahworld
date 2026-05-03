import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/** App Router route handlers: prefer this over getServerSession so the request cookie is always read. */
export async function getAdminJwt(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return null
  return getToken({ req, secret })
}
