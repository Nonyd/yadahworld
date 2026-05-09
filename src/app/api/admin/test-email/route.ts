import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { renderEmailTemplate, sendMail } from '@/lib/mailer'
import { getSiteSettingsRow } from '@/lib/site-settings'
import { logAdminApiActivity } from '@/lib/admin-activity-log'

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
      html: renderEmailTemplate({
        eyebrow: 'Yadah Admin',
        title: 'SMTP Test Successful',
        previewText: 'Your Brevo SMTP configuration is working.',
        intro: 'Your Brevo SMTP is configured correctly. This is a test from Yadah Studio.',
        signedBy: 'Yadah Admin Console',
      }),
      settingsOverride: settings,
    })
    await logAdminApiActivity(session, {
      method: 'POST',
      path: '/api/admin/test-email',
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
