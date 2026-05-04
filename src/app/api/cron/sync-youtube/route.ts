import { NextRequest, NextResponse } from 'next/server'
import { syncAllPlaylists } from '@/lib/youtube-sync'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await syncAllPlaylists()
    return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('YouTube sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
