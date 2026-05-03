import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm'
import { getSiteSettingsRow } from '@/lib/site-settings'

export default async function AdminHomePageContent() {
  const initial = await getSiteSettingsRow()

  return (
    <div>
      <AdminPageHeader title="Home page" description="Site name, SEO defaults, and home hero imagery." />
      <AdminSettingsForm initial={initial} variant="home" />
    </div>
  )
}
