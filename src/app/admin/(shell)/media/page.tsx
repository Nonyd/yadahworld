import Image from 'next/image'
import Link from 'next/link'
import { cloudinaryCloudName, cloudinaryUrl } from '@/lib/cloudinary'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { getGalleryUrls, getSiteVisuals } from '@/lib/site-settings'

export default async function AdminMediaPage() {
  const [gallery, visuals] = await Promise.all([getGalleryUrls(), getSiteVisuals()])
  const sampleCloudinary = cloudinaryCloudName ? cloudinaryUrl('folder/sample', { width: 400 }) : ''

  return (
    <div>
      <AdminPageHeader
        title="Media"
        description="Live preview of gallery and key images. Edit URLs and uploads under Site settings (jump to Images or Gallery)."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/admin/settings#settings-images" className="admin-btn admin-btn-secondary text-[10px]">
          Site images & gallery
        </Link>
        <Link href="/admin/videos" className="admin-btn admin-btn-secondary text-[10px]">
          YouTube videos
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-card p-6 lg:col-span-2">
          <h2 className="font-playfair text-lg text-admin-text">Photo gallery (live)</h2>
          <p className="mt-2 text-sm text-admin-muted">These URLs power the Photos tab on /media. Edit the list in Settings.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((src, i) => (
              <div key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-lg bg-admin-bg">
                <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw" />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card space-y-4 p-6">
          <h2 className="font-playfair text-lg text-admin-text">Key image URLs (resolved)</h2>
          <ul className="space-y-2 break-all font-mono text-[10px] text-admin-muted">
            <li>Hero: {visuals.hero.length > 72 ? `${visuals.hero.slice(0, 68)}…` : visuals.hero}</li>
            <li>Editorial: {visuals.editorial.length > 72 ? `${visuals.editorial.slice(0, 68)}…` : visuals.editorial}</li>
            <li>About hero: {visuals.aboutHero.length > 72 ? `${visuals.aboutHero.slice(0, 68)}…` : visuals.aboutHero}</li>
          </ul>
          <h2 className="font-playfair text-lg text-admin-text pt-4">Cloudinary</h2>
          {cloudinaryCloudName ? (
            <>
              <p className="text-sm text-admin-muted">
                Cloud name <span className="font-mono text-admin-text">{cloudinaryCloudName}</span> is configured.
              </p>
              {sampleCloudinary && (
                <p className="break-all text-xs text-admin-muted">
                  Example: <span className="font-mono text-[11px] text-admin-text">{sampleCloudinary}</span>
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-admin-muted">
              Set <code className="rounded bg-admin-bg px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code>{' '}
              for URL helpers.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
