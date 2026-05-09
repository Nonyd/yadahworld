import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apps = await prisma.campusTourApplication.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const headers = [
    'Date',
    'Full Name',
    'WhatsApp',
    'Email',
    'Campus',
    'Role',
    'Why Minister Yadah',
    'Expectations',
    'Status',
  ]

  const rows = apps.map((a) => [
    new Date(a.createdAt).toLocaleDateString('en-GB'),
    a.fullName,
    a.whatsapp,
    a.email,
    a.campus,
    a.role,
    a.whyMinisterYadah ?? '',
    a.expectations ?? '',
    a.status,
  ])

  const csv = [
    headers.join(','),
    ...rows.map((r) =>
      r
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    ),
  ].join('\n')

  await logAdminApiActivity(session, {
    method: 'GET',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="campus-tour-applications-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
