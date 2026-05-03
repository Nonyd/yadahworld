import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm'
import AdminEnvPanel from '@/components/admin/settings/AdminEnvPanel'
import { getSiteSettingsRow } from '@/lib/site-settings'

export default async function AdminSettingsPage() {
  const initial = await getSiteSettingsRow()

  return (
    <div>
      <AdminPageHeader
        title="Site settings"
        description="All public site content in one place — identity, contact, socials, images, and gallery. Use the jump links while editing. Changes apply on save."
      />
      <AdminSettingsForm initial={initial} />
      <AdminEnvPanel />
    </div>
  )
}
