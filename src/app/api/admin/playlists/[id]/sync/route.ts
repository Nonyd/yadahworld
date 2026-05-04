import { NextRequest, NextResponse } from 'next/server'
import { revalidateMediaAndMinistrations } from '@/lib/revalidate-public'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { syncPlaylist } from '@/lib/youtube-sync'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await syncPlaylist(params.id)
    revalidateMediaAndMinistrations()
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
