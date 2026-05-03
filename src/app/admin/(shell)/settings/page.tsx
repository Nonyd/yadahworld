import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm'
import AdminEnvPanel from '@/components/admin/settings/AdminEnvPanel'
import { getSiteSettingsRow } from '@/lib/site-settings'

export default async function AdminSettingsPage() {
  const initial = await getSiteSettingsRow()

  return (
    <div>
      <AdminPageHeader
        title="All settings"
        description="Full editor for every site field. For a focused layout, use Pages in the sidebar (Home, Media, About, Contact). Changes apply on save."
      />
      <AdminSettingsForm initial={initial} variant="full" />
      <AdminEnvPanel />
    </div>
  )
}
