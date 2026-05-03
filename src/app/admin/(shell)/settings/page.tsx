export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-playfair text-3xl mb-4" style={{ color: 'var(--body)' }}>
        Settings
      </h1>
      <p className="body-lg max-w-xl">
        Centralise contact copy, social URLs, and notification emails via env or a future <code className="text-sm bg-surface px-1">SiteSettings</code> model.
      </p>
    </div>
  )
}
