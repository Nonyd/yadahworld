'use client'

import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import type { SiteSettings } from '@prisma/client'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import { cloudinaryCloudName } from '@/lib/cloudinary'
import { uploadAdminImage } from '@/lib/admin-upload-client'

type FormState = {
  siteName: string
  siteTagline: string
  metaDescription: string
  metaTitleSuffix: string
  contactEmail: string
  contactPhone: string
  bookingEmail: string
  socialInstagram: string
  socialYoutube: string
  socialSpotify: string
  socialFacebook: string
  socialX: string
  imageHero: string
  imageEditorial: string
  imageAboutHero: string
  imageAboutPortrait: string
  imageWorshipBg: string
  galleryText: string
}

export type AdminSettingsVariant = 'full' | 'home' | 'about' | 'contact' | 'media'

function toFormState(row: SiteSettings | null): FormState {
  return {
    siteName: row?.siteName ?? 'Yadah',
    siteTagline: row?.siteTagline ?? '',
    metaDescription: row?.metaDescription ?? '',
    metaTitleSuffix: row?.metaTitleSuffix ?? '| Yadah',
    contactEmail: row?.contactEmail ?? '',
    contactPhone: row?.contactPhone ?? '',
    bookingEmail: row?.bookingEmail ?? '',
    socialInstagram: row?.socialInstagram ?? '',
    socialYoutube: row?.socialYoutube ?? '',
    socialSpotify: row?.socialSpotify ?? '',
    socialFacebook: row?.socialFacebook ?? '',
    socialX: row?.socialX ?? '',
    imageHero: row?.imageHero ?? '',
    imageEditorial: row?.imageEditorial ?? '',
    imageAboutHero: row?.imageAboutHero ?? '',
    imageAboutPortrait: row?.imageAboutPortrait ?? '',
    imageWorshipBg: row?.imageWorshipBg ?? '',
    galleryText: (row?.galleryImageUrls ?? []).join('\n'),
  }
}

export default function AdminSettingsForm({
  initial,
  variant = 'full',
}: {
  initial: SiteSettings | null
  variant?: AdminSettingsVariant
}) {
  const router = useRouter()
  const galleryFilesId = useId()
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [galleryBusy, setGalleryBusy] = useState(false)
  const [galleryErr, setGalleryErr] = useState('')

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const appendGalleryFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setGalleryErr('')
    setGalleryBusy(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        urls.push(await uploadAdminImage(file, 'gallery'))
      }
      setForm((f) => ({
        ...f,
        galleryText: [f.galleryText.trim(), ...urls].filter(Boolean).join('\n'),
      }))
    } catch (e) {
      setGalleryErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setGalleryBusy(false)
    }
  }

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const galleryImageUrls = form.galleryText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: form.siteName,
          siteTagline: form.siteTagline || null,
          metaDescription: form.metaDescription || null,
          metaTitleSuffix: form.metaTitleSuffix || null,
          contactEmail: form.contactEmail || null,
          contactPhone: form.contactPhone || null,
          bookingEmail: form.bookingEmail || null,
          socialInstagram: form.socialInstagram || null,
          socialYoutube: form.socialYoutube || null,
          socialSpotify: form.socialSpotify || null,
          socialFacebook: form.socialFacebook || null,
          socialX: form.socialX || null,
          imageHero: form.imageHero || null,
          imageEditorial: form.imageEditorial || null,
          imageAboutHero: form.imageAboutHero || null,
          imageAboutPortrait: form.imageAboutPortrait || null,
          imageWorshipBg: form.imageWorshipBg || null,
          galleryImageUrls,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setMsg('Saved.')
      router.refresh()
    } catch {
      setMsg('Could not save. Check database connection.')
    } finally {
      setSaving(false)
    }
  }

  const showGeneral = variant === 'full' || variant === 'home'
  const showHomeVisuals = variant === 'full' || variant === 'home'
  const showContact = variant === 'full' || variant === 'contact'
  const showSocial = variant === 'full' || variant === 'contact'
  const showAboutVisuals = variant === 'full' || variant === 'about'
  const showBookingVisual = variant === 'full' || variant === 'contact'
  const showGallery = variant === 'full' || variant === 'media'

  const saveLabel =
    variant === 'home'
      ? 'Save home page'
      : variant === 'about'
        ? 'Save about page'
        : variant === 'contact'
          ? 'Save contact & booking'
          : variant === 'media'
            ? 'Save gallery'
            : 'Save all settings'

  const field = (id: keyof FormState, label: string, hint?: string, multiline = false) => (
    <div>
      <label className="admin-label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea id={id} className="admin-input min-h-[88px] resize-y" value={form[id] as string} onChange={(e) => set(id, e.target.value)} />
      ) : (
        <input id={id} className="admin-input" value={form[id] as string} onChange={(e) => set(id, e.target.value)} />
      )}
      {hint && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
    </div>
  )

  return (
    <form onSubmit={onSave} className="space-y-10">
      {showGeneral && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">General</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {field('siteName', 'Site name', 'Shown in the header, footer, and browser title.')}
            {field('siteTagline', 'Tagline', 'Short line under the name in the footer when set.')}
            {field('metaDescription', 'Default meta description', 'Used for SEO when a page does not set its own.', true)}
            {field('metaTitleSuffix', 'Title suffix', 'Appended in metadata, e.g. “Release name | Yadah”.')}
          </div>
        </div>
      )}

      {showContact && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">Contact & booking</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {field('contactEmail', 'Public contact email', 'Shown in the footer contact strip.')}
            {field('contactPhone', 'Public phone', 'Shown next to the email in the footer.')}
            {field('bookingEmail', 'Booking enquiries email', 'Optional — use if different from the public address.')}
          </div>
        </div>
      )}

      {showSocial && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">Social links</h2>
          <p className="text-sm text-admin-muted">Full URLs. Empty fields keep sensible defaults from the codebase.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {field('socialInstagram', 'Instagram')}
            {field('socialYoutube', 'YouTube')}
            {field('socialSpotify', 'Spotify')}
            {field('socialFacebook', 'Facebook')}
            {field('socialX', 'X (Twitter)')}
          </div>
        </div>
      )}

      {(showHomeVisuals || showAboutVisuals || showBookingVisual) && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">
            {variant === 'about' ? 'About page visuals' : variant === 'contact' ? 'Booking & CTA imagery' : 'Homepage & key visuals'}
          </h2>
          <p className="text-sm text-admin-muted">
            Upload images to Cloudinary or paste URLs. Leave blank to use built-in placeholders.{' '}
            {cloudinaryCloudName ? (
              <span className="font-mono text-[11px] text-admin-text">Cloud: {cloudinaryCloudName}</span>
            ) : null}
          </p>
          <div className="grid gap-8 sm:grid-cols-1">
            {showHomeVisuals && (
              <>
                <AdminImageUpload
                  label="Hero background (home)"
                  value={form.imageHero}
                  onChange={(v) => set('imageHero', v)}
                  folder="site"
                />
                <AdminImageUpload
                  label="Home “Artist” section image"
                  value={form.imageEditorial}
                  onChange={(v) => set('imageEditorial', v)}
                  folder="site"
                />
              </>
            )}
            {showAboutVisuals && (
              <>
                <AdminImageUpload
                  label="About page hero"
                  value={form.imageAboutHero}
                  onChange={(v) => set('imageAboutHero', v)}
                  folder="site"
                />
                <AdminImageUpload
                  label="About page portrait"
                  value={form.imageAboutPortrait}
                  onChange={(v) => set('imageAboutPortrait', v)}
                  folder="site"
                />
              </>
            )}
            {showBookingVisual && (
              <AdminImageUpload
                label="Booking CTA section background"
                value={form.imageWorshipBg}
                onChange={(v) => set('imageWorshipBg', v)}
                folder="site"
              />
            )}
          </div>
        </div>
      )}

      {showGallery && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">Photo gallery (media page)</h2>
          <p className="text-sm text-admin-muted">One image URL per line, or upload multiple images to append Cloudinary URLs.</p>
          <div>
            <label className="admin-label" htmlFor="galleryText">
              Gallery image URLs
            </label>
            <textarea
              id="galleryText"
              className="admin-input min-h-[160px] resize-y font-mono text-xs"
              value={form.galleryText}
              onChange={(e) => set('galleryText', e.target.value)}
            />
          </div>
          <div>
            <input
              id={galleryFilesId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif,.heic,.heif"
              multiple
              className="sr-only"
              disabled={!cloudinaryCloudName || galleryBusy}
              onChange={(e) => {
                void appendGalleryFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <label
              htmlFor={galleryFilesId}
              className={`admin-btn admin-btn-secondary inline-flex cursor-pointer text-[10px] ${
                !cloudinaryCloudName || galleryBusy ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {galleryBusy ? 'Uploading…' : 'Upload images to gallery'}
            </label>
            {galleryErr && <p className="mt-2 text-xs text-red-700">{galleryErr}</p>}
          </div>
        </div>
      )}

      {msg && <p className="text-sm text-admin-muted">{msg}</p>}
      <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
        {saving ? 'Saving…' : saveLabel}
      </button>
    </form>
  )
}
