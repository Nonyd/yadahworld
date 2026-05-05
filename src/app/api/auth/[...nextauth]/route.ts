import NextAuth from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { checkRateLimit, getClientIp } from '@/lib/security'

const handler = NextAuth(authOptions)

export async function GET(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  return handler(req, ctx)
}

export async function POST(req: NextRequest, ctx: { params: { nextauth: string[] } }) {
  const ip = getClientIp(req)
  const action = ctx.params.nextauth?.[0] ?? 'unknown'
  const throttle = checkRateLimit({
    key: `api:nextauth:${action}:${ip}`,
    max: 20,
    windowMs: 10 * 60 * 1000,
  })
  if (!throttle.allowed) {
    return NextResponse.json({ error: 'Too many authentication requests.' }, { status: 429 })
  }
  return handler(req, ctx)
}
