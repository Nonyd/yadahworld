import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm'
import { getSiteSettingsRow } from '@/lib/site-settings'

export default async function AdminAboutPageContent() {
  const initial = await getSiteSettingsRow()

  return (
    <div>
      <AdminPageHeader title="About page" description="Hero and portrait images for /about." />
      <AdminSettingsForm initial={initial} variant="about" />
    </div>
  )
}
