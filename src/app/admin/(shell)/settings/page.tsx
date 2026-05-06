import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm'
import AdminEnvPanel from '@/components/admin/settings/AdminEnvPanel'
import { getSiteSettingsRow } from '@/lib/site-settings'

export default async function AdminSettingsPage() {
  const initial = await getSiteSettingsRow()
  const publicSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yadahworld.com').replace(/\/$/, '')
  const integrationEnv = {
    brevoSmtpPassFromEnv: Boolean(process.env.BREVO_SMTP_PASS?.trim()),
    stripeSecretFromEnv: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    stripePublishableFromEnv: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()),
    stripeWebhookFromEnv: Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim()),
  }

  return (
    <div>
      <AdminPageHeader
        title="Site settings"
        description="General, contact, socials, media assets, gallery, and third-party integrations. Use the tabs below; changes apply when you save."
      />
      <AdminSettingsForm initial={initial} integrationEnv={integrationEnv} publicSiteUrl={publicSiteUrl} />
      <AdminEnvPanel />
    </div>
  )
}
