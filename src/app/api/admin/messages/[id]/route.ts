import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminApiActivity } from '@/lib/admin-activity-log'
import { z } from 'zod'

const patchSchema = z.object({
  read: z.boolean(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  try {
    await prisma.contactMessage.update({
      where: { id: params.id },
      data: { read: parsed.data.read },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  await logAdminApiActivity(session, {
    method: 'PATCH',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.contactMessage.delete({ where: { id: params.id } })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }

  await logAdminApiActivity(session, {
    method: 'DELETE',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return NextResponse.json({ ok: true })
}
