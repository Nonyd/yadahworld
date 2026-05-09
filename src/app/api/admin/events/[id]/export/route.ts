import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

function csvCell(v: string | number) {
  const s = String(v)
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      registrations: {
        include: { tier: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const headers = [
    'Date',
    'Full Name',
    'Email',
    'Phone',
    'Ticket Type',
    'Amount',
    'Currency',
    'Payment Status',
    'Ticket Code',
    'Checked In',
    'Checked In At',
  ]

  const rows = event.registrations.map((r) => [
    new Date(r.createdAt).toLocaleDateString('en-GB'),
    r.fullName,
    r.email,
    r.phone,
    r.tier.name,
    r.amount === 0 ? '0' : (r.amount / 100).toString(),
    r.currency,
    r.paymentStatus,
    r.ticketCode.toUpperCase(),
    r.checkedIn ? 'Yes' : 'No',
    r.checkedInAt ? new Date(r.checkedInAt).toLocaleString('en-GB') : '',
  ])

  const csv = [headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\n')

  const safeName = event.title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/gi, '')
  const filename = `${safeName || 'event'}-registrations-${new Date().toISOString().split('T')[0]}.csv`

  await logAdminApiActivity(session, {
    method: 'GET',
    path: `${req.nextUrl.pathname}${req.nextUrl.search}`,
    req,
  })
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
