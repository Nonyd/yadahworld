import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { logAdminApiActivity } from '@/lib/admin-activity-log'
import { syncSpotify } from '@/lib/spotify-sync'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await syncSpotify()

  try {
    revalidatePath('/releases')
    revalidatePath('/', 'layout')
  } catch (revErr) {
    console.warn('revalidatePath after Spotify sync:', revErr)
  }

  await logAdminApiActivity(session, {
    method: 'POST',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })

  return NextResponse.json(result)
}
