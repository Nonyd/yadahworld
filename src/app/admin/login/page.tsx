import AdminLoginClient from '@/app/admin/login/AdminLoginClient'
import { getPublicBranding } from '@/lib/site-settings'

export default async function AdminLoginPage() {
  const branding = await getPublicBranding()
  return <AdminLoginClient logoUrl={branding.logoUrl} siteName={branding.siteName} />
}
