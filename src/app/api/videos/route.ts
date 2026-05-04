import { NextResponse } from 'next/server'
import { PlaylistSlot } from '@prisma/client'
import { listVideosForSlot } from '@/lib/videos-query'

const SLOTS: PlaylistSlot[] = ['MUSIC_VIDEOS', 'MINISTRATIONS', 'GENERAL']

function parseSlot(raw: string | null): PlaylistSlot | null {
  if (!raw) return null
  return SLOTS.includes(raw as PlaylistSlot) ? (raw as PlaylistSlot) : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slot = parseSlot(searchParams.get('slot'))
  if (!slot) {
    return NextResponse.json({ error: 'Invalid or missing slot' }, { status: 400 })
  }

  const sortRaw = searchParams.get('sort') ?? 'views'
  const sort = sortRaw === 'recent' ? 'recent' : 'views'

  const skip = Math.max(0, parseInt(searchParams.get('skip') ?? '0', 10) || 0)
  const take = Math.min(50, Math.max(1, parseInt(searchParams.get('take') ?? '15', 10) || 15))

  try {
    const { videos, total } = await listVideosForSlot({ slot, sort, skip, take })
    return NextResponse.json({ videos, total })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load videos' }, { status: 500 })
  }
}
