import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { sendMail } from '@/lib/mailer'
import { getSiteSettingsRow } from '@/lib/site-settings'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const settings = await getSiteSettingsRow()
  const to =
    settings?.brevoNotifyEmail?.trim() || process.env.BREVO_NOTIFY_EMAIL?.trim() || ''
  if (!to) {
    return NextResponse.json(
      { error: 'No notify email configured (BREVO_NOTIFY_EMAIL or settings).' },
      { status: 400 },
    )
  }

  try {
    await sendMail({
      to,
      subject: 'Yadah Admin — Test Email',
      html: '<p>Your Brevo SMTP is configured correctly. This is a test from Yadah Studio.</p>',
      settingsOverride: settings,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
