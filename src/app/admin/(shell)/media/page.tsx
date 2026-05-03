export default function AdminMediaPage() {
  return (
    <div>
      <h1 className="font-playfair text-3xl mb-4" style={{ color: 'var(--body)' }}>
        Media
      </h1>
      <p className="body-lg max-w-xl">
        UploadThing or Cloudinary admin uploads can be wired here. Site galleries currently use placeholders in{' '}
        <code className="text-sm bg-surface px-1">src/lib/imagePlaceholders.ts</code>.
      </p>
    </div>
  )
}
