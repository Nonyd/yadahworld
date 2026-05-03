export default function AdminReleasesPage() {
  return (
    <div>
      <h1 className="font-playfair text-3xl mb-4" style={{ color: 'var(--body)' }}>
        Releases
      </h1>
      <p className="body-lg max-w-xl">
        Manage <code className="text-sm bg-surface px-1">SiteRelease</code> records when you connect the homepage music
        grid to Prisma.
      </p>
    </div>
  )
}
