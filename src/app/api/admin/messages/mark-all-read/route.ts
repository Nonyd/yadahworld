import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.contactMessage.updateMany({ data: { read: true }, where: { read: false } })
    await logAdminApiActivity(session, {
      method: 'POST',
      path: '/api/admin/messages/mark-all-read',
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
