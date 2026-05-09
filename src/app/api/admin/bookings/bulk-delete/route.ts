import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminApiActivity } from '@/lib/admin-activity-log'
import { z } from 'zod'

const bodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  try {
    const result = await prisma.bookingRequest.deleteMany({
      where: { id: { in: parsed.data.ids } },
    })
    await logAdminApiActivity(session, {
      method: 'POST',
      path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
      req,
    })
    return NextResponse.json({ ok: true, deleted: result.count })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
