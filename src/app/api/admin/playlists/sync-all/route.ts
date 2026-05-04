import { NextResponse } from 'next/server'
import { revalidateMediaAndMinistrations } from '@/lib/revalidate-public'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { syncAllPlaylists } from '@/lib/youtube-sync'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const results = await syncAllPlaylists()
    revalidateMediaAndMinistrations()
    return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
