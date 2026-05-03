import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm'
import AdminEnvPanel from '@/components/admin/settings/AdminEnvPanel'
import { getSiteSettingsRow } from '@/lib/site-settings'

export default async function AdminSettingsPage() {
  const initial = await getSiteSettingsRow()

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Site identity, contact details, social links, and front-page imagery. Changes apply on save; the public site reads from the database."
      />
      <AdminSettingsForm initial={initial} />
      <AdminEnvPanel />
    </div>
  )
}
