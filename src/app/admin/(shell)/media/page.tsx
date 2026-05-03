import Image from 'next/image'
import { images } from '@/lib/imagePlaceholders'
import { cloudinaryCloudName, cloudinaryUrl } from '@/lib/cloudinary'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

const gallery = images.gallery

export default function AdminMediaPage() {
  const sampleCloudinary = cloudinaryCloudName ? cloudinaryUrl('folder/sample', { width: 400 }) : ''

  return (
    <div>
      <AdminPageHeader
        title="Media"
        description="Placeholder art used across the marketing site. Swap URLs in code or point releases to Cloudinary URLs from here."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-card p-6 lg:col-span-2">
          <h2 className="font-playfair text-lg text-admin-text">Gallery placeholders</h2>
          <p className="mt-2 text-sm text-admin-muted">These keys live in `src/lib/imagePlaceholders.ts`.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((src, i) => (
              <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-admin-bg">
                <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card space-y-4 p-6">
          <h2 className="font-playfair text-lg text-admin-text">Cloudinary</h2>
          {cloudinaryCloudName ? (
            <>
              <p className="text-sm text-admin-muted">
                Cloud name <span className="font-mono text-admin-text">{cloudinaryCloudName}</span> is configured.
              </p>
              {sampleCloudinary && (
                <p className="break-all text-xs text-admin-muted">
                  Example URL pattern: <span className="font-mono text-[11px] text-admin-text">{sampleCloudinary}</span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-admin-muted">
              Set <code className="rounded bg-admin-bg px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> in
              your environment to enable URL helpers.
            </p>
          )}
          <p className="text-xs leading-relaxed text-admin-muted">
            For uploads from the browser, add a signed upload API route when you are ready; until then, paste image URLs into
            releases and other CMS fields.
          </p>
        </div>
      </div>
    </div>
  )
}
