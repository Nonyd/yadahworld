import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm'
import { getSiteSettingsRow } from '@/lib/site-settings'

export default async function AdminContactPageContent() {
  const initial = await getSiteSettingsRow()

  return (
    <div>
      <AdminPageHeader
        title="Contact & booking"
        description="Public contact details, social links, booking email, and the booking CTA background."
      />
      <AdminSettingsForm initial={initial} variant="contact" />
    </div>
  )
}
