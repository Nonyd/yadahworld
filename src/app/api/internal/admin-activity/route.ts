import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const bodySchema = z.object({
  method: z.string().min(1).max(16),
  path: z.string().min(1).max(2048),
  actorEmail: z.string().max(320).nullable().optional(),
  actorId: z.string().max(128).nullable().optional(),
  ipAddress: z.string().max(128).nullable().optional(),
})

/**
 * Ingest endpoint for Edge middleware. Not covered by admin auth middleware.
 * Protected with shared server secret header only.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  if (req.headers.get('x-admin-audit-secret') !== secret) {
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

  const email = parsed.data.actorEmail?.trim() || null
  const actorId = parsed.data.actorId?.trim() || null
  const ip = parsed.data.ipAddress?.trim() || null

  try {
    await prisma.adminActivityLog.create({
      data: {
        method: parsed.data.method,
        path: parsed.data.path,
        actorEmail: email,
        actorId: actorId,
        ipAddress: ip,
      },
    })
  } catch (e) {
    console.error('admin activity log ingest', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
