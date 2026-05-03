'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SiteSettings } from '@prisma/client'

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

export default function AdminSettingsForm({ initial }: { initial: SiteSettings | null }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }))

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
      <div className="admin-card space-y-6 p-6 sm:p-8">
        <h2 className="font-playfair text-lg text-admin-text">General</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {field('siteName', 'Site name', 'Shown in the header, footer, and browser title.')}
          {field('siteTagline', 'Tagline', 'Short line under the name in the footer when set.')}
          {field('metaDescription', 'Default meta description', 'Used for SEO when a page does not set its own.', true)}
          {field('metaTitleSuffix', 'Title suffix', 'Appended in metadata, e.g. “Release name | Yadah”.')}
        </div>
      </div>

      <div className="admin-card space-y-6 p-6 sm:p-8">
        <h2 className="font-playfair text-lg text-admin-text">Contact & booking</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {field('contactEmail', 'Public contact email', 'Shown in the footer contact strip.')}
          {field('contactPhone', 'Public phone', 'Shown next to the email in the footer.')}
          {field('bookingEmail', 'Booking enquiries email', 'Optional — use if different from the public address.')}
        </div>
      </div>

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

      <div className="admin-card space-y-6 p-6 sm:p-8">
        <h2 className="font-playfair text-lg text-admin-text">Homepage & key visuals</h2>
        <p className="text-sm text-admin-muted">Paste full image URLs (Cloudinary, CDN, or trusted hosts). Leave blank to use built-in placeholders.</p>
        <div className="grid gap-6 sm:grid-cols-1">
          {field('imageHero', 'Hero background (home)')}
          {field('imageEditorial', 'Home “Artist” section image')}
          {field('imageAboutHero', 'About page hero')}
          {field('imageAboutPortrait', 'About page portrait')}
          {field('imageWorshipBg', 'Booking CTA section background')}
        </div>
      </div>

      <div className="admin-card space-y-6 p-6 sm:p-8">
        <h2 className="font-playfair text-lg text-admin-text">Photo gallery (media page)</h2>
        <p className="text-sm text-admin-muted">One image URL per line. Shown in the Photos tab on /media.</p>
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
      </div>

      {msg && <p className="text-sm text-admin-muted">{msg}</p>}
      <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
        {saving ? 'Saving…' : 'Save all settings'}
      </button>
    </form>
  )
}
