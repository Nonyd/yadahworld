import AdminPageHeader from '@/components/admin/AdminPageHeader'

function Flag({ ok }: { ok: boolean }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>
      {ok ? 'Set' : 'Missing'}
    </span>
  )
}

export default function AdminSettingsPage() {
  const flags = {
    database: !!process.env.DATABASE_URL,
    nextAuth: !!process.env.NEXTAUTH_SECRET,
    adminAuth: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD),
    cloudinary: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    siteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    notify: !!process.env.BREVO_NOTIFY_EMAIL,
  }

  const rows: { key: string; label: string; ok: boolean; hint?: string }[] = [
    { key: 'db', label: 'DATABASE_URL', ok: flags.database, hint: 'PostgreSQL connection' },
    { key: 'na', label: 'NEXTAUTH_SECRET', ok: flags.nextAuth, hint: 'Session signing' },
    { key: 'ae', label: 'ADMIN_EMAIL / ADMIN_PASSWORD', ok: flags.adminAuth, hint: 'Dashboard login' },
    { key: 'cc', label: 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', ok: flags.cloudinary, hint: 'Image CDN' },
    { key: 'su', label: 'NEXT_PUBLIC_SITE_URL', ok: flags.siteUrl, hint: 'Metadata & links' },
    { key: 'st', label: 'STRIPE_SECRET_KEY', ok: flags.stripe, hint: 'Optional — shop checkout' },
    { key: 'nv', label: 'BREVO_NOTIFY_EMAIL', ok: flags.notify, hint: 'Form notifications' },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Environment readiness for this deployment. Values are not shown — only whether each variable is present."
      />

      <div className="admin-card divide-y divide-admin-border overflow-hidden">
        {rows.map((r) => (
          <div key={r.key} className="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-sm text-admin-text">{r.label}</p>
              {r.hint && <p className="mt-0.5 text-xs text-admin-muted">{r.hint}</p>}
            </div>
            <Flag ok={r.ok} />
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-admin-muted">
        Copy <code className="rounded bg-admin-bg px-1 font-mono">.env.example</code> to <code className="rounded bg-admin-bg px-1 font-mono">.env</code> and fill in secrets locally or in your host dashboard.
      </p>
    </div>
  )
}
