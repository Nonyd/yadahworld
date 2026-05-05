import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** Validates waitlist claim token and sends user to the event page to complete checkout. */
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const token = req.nextUrl.searchParams.get('token')?.trim()
  if (!token) {
    return NextResponse.redirect(new URL('/events', req.nextUrl.origin), 302)
  }

  const reg = await prisma.eventRegistration.findFirst({
    where: {
      waitlistClaimToken: token,
      event: { slug: params.slug },
    },
    include: { event: { select: { slug: true } } },
  })

  const site = req.nextUrl.origin
  if (!reg || !reg.waitlistClaimExpires || reg.waitlistClaimExpires < new Date()) {
    return NextResponse.redirect(new URL(`/events/${params.slug}?claim=expired`, site), 302)
  }

  const url = new URL(`/events/${params.slug}`, site)
  url.searchParams.set('tier', reg.tierId)
  url.searchParams.set('claim', token)
  return NextResponse.redirect(url, 302)
}
