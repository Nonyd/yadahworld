import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

function csvCell(value: string) {
  const v = value.replace(/"/g, '""')
  return `"${v}"`
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const headers = ['Date', 'Name', 'Email', 'Status', 'Source', 'Brevo Synced']
  const rows = subscribers.map((s) => [
    new Date(s.createdAt).toLocaleDateString('en-GB'),
    s.name ?? '',
    s.email,
    s.status,
    s.source ?? '',
    s.brevoSynced ? 'Yes' : 'No',
  ])

  const csv = [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n')

  await logAdminApiActivity(session, {
    method: 'GET',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="yadah-subscribers-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
