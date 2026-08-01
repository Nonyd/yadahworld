import { NextRequest, NextResponse } from 'next/server'
import { syncSpotify } from '@/lib/spotify-sync'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET?.trim()

  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron is not configured' }, { status: 503 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncSpotify()
    return NextResponse.json({ ...result, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('Spotify sync error:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
