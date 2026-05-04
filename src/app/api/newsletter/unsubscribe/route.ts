import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const normalized = email.trim().toLowerCase()

  await prisma.newsletterSubscriber.updateMany({
    where: { email: { equals: normalized, mode: 'insensitive' } },
    data: { status: 'UNSUBSCRIBED' },
  })

  return NextResponse.redirect(new URL(`/unsubscribed?email=${encodeURIComponent(email.trim())}`, req.url))
}
