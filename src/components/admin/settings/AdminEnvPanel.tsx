function Row({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-xs">
      <span className="font-mono text-admin-muted">{label}</span>
      <span className={ok ? 'text-emerald-700' : 'text-amber-700'}>{ok ? 'Set' : 'Missing'}</span>
    </div>
  )
}

export default function AdminEnvPanel() {
  return (
    <details className="admin-card mt-10 p-4 text-sm">
      <summary className="cursor-pointer font-medium text-admin-text">Deployment checks (read-only)</summary>
      <p className="mt-3 text-xs text-admin-muted">Server environment — not part of the CMS database.</p>
      <div className="mt-4 divide-y divide-admin-border rounded-md border border-admin-border px-3">
        <Row label="DATABASE_URL" ok={!!process.env.DATABASE_URL} />
        <Row label="NEXTAUTH_SECRET" ok={!!process.env.NEXTAUTH_SECRET} />
        <Row label="ADMIN_EMAIL / ADMIN_PASSWORD" ok={!!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD)} />
        <Row label="NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" ok={!!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME} />
        <Row label="NEXT_PUBLIC_SITE_URL" ok={!!process.env.NEXT_PUBLIC_SITE_URL} />
        <Row label="STRIPE_SECRET_KEY" ok={!!process.env.STRIPE_SECRET_KEY} />
        <Row label="BREVO_NOTIFY_EMAIL" ok={!!process.env.BREVO_NOTIFY_EMAIL} />
      </div>
    </details>
  )
}
