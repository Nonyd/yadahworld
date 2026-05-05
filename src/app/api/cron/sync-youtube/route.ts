import { NextRequest, NextResponse } from 'next/server'
import { syncAllPlaylists } from '@/lib/youtube-sync'

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
    const results = await syncAllPlaylists()
    return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('YouTube sync error:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
