import { NextResponse } from 'next/server'
import { revalidateMediaAndMinistrations } from '@/lib/revalidate-public'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { syncAllPlaylists } from '@/lib/youtube-sync'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const results = await syncAllPlaylists()
    revalidateMediaAndMinistrations()
    await logAdminApiActivity(session, {
      method: 'POST',
      path: '/api/admin/playlists/sync-all',
    })
    return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
