import Link from 'next/link'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminSettingsForm from '@/components/admin/settings/AdminSettingsForm'
import { getSiteSettingsRow } from '@/lib/site-settings'

export default async function AdminMediaPageContent() {
  const initial = await getSiteSettingsRow()

  return (
    <div>
      <AdminPageHeader
        title="Media page — gallery"
        description="Images listed here appear in the Photos section on the public /media page."
        actions={
          <Link href="/admin/media" className="admin-btn admin-btn-secondary text-[10px]">
            Live preview
          </Link>
        }
      />
      <AdminSettingsForm initial={initial} variant="media" />
    </div>
  )
}
