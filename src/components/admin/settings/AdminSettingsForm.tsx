'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import type { SiteSettings } from '@prisma/client'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import { cloudinaryCloudName } from '@/lib/cloudinary'
import { getAdminUploadStatus, uploadAdminImage, type AdminUploadStatus } from '@/lib/admin-upload-client'
import { SocialIcon } from '@/components/ui/SocialIcons'

const TABS = ['General', 'Contact', 'Social', 'Images', 'Gallery', 'Integrations'] as const
type Tab = (typeof TABS)[number]

export type AdminSettingsIntegrationEnv = {
  brevoSmtpPassFromEnv: boolean
  stripeSecretFromEnv: boolean
  stripePublishableFromEnv: boolean
  stripeWebhookFromEnv: boolean
}

type FormState = {
  siteName: string
  siteTagline: string
  metaDescription: string
  metaTitleSuffix: string
  heroTagline: string
  aboutBioShort: string
  footerCopyright: string
  contactEmail: string
  contactPhone: string
  bookingEmail: string
  locationDisplay: string
  socialInstagram: string
  socialYoutube: string
  socialSpotify: string
  socialFacebook: string
  socialX: string
  socialTiktok: string
  imageHero: string
  imageEditorial: string
  imageAboutHero: string
  imageAboutPortrait: string
  imageWorshipBg: string
  galleryText: string
  brevoSmtpHost: string
  brevoSmtpPort: string
  brevoSmtpUser: string
  brevoSmtpPass: string
  brevoFromEmail: string
  brevoFromName: string
  brevoNotifyEmail: string
  stripeSecretKey: string
  stripePublishableKey: string
  stripeWebhookSecret: string
  stripeEnabled: boolean
  paystackPublicKey: string
  paystackSecretKey: string
  paystackEnabled: boolean
  flutterwavePublicKey: string
  flutterwaveSecretKey: string
  flutterwaveEnabled: boolean
}

function toFormState(row: SiteSettings | null): FormState {
  return {
    siteName: row?.siteName ?? 'Yadah',
    siteTagline: row?.siteTagline ?? '',
    metaDescription: row?.metaDescription ?? '',
    metaTitleSuffix: row?.metaTitleSuffix ?? '| Yadah',
    heroTagline: row?.heroTagline ?? '',
    aboutBioShort: row?.aboutBioShort ?? '',
    footerCopyright: row?.footerCopyright ?? '',
    contactEmail: row?.contactEmail ?? '',
    contactPhone: row?.contactPhone ?? '',
    bookingEmail: row?.bookingEmail ?? '',
    locationDisplay: row?.locationDisplay ?? '',
    socialInstagram: row?.socialInstagram ?? '',
    socialYoutube: row?.socialYoutube ?? '',
    socialSpotify: row?.socialSpotify ?? '',
    socialFacebook: row?.socialFacebook ?? '',
    socialX: row?.socialX ?? '',
    socialTiktok: row?.socialTiktok ?? '',
    imageHero: row?.imageHero ?? '',
    imageEditorial: row?.imageEditorial ?? '',
    imageAboutHero: row?.imageAboutHero ?? '',
    imageAboutPortrait: row?.imageAboutPortrait ?? '',
    imageWorshipBg: row?.imageWorshipBg ?? '',
    galleryText: (row?.galleryImageUrls ?? []).join('\n'),
    brevoSmtpHost: row?.brevoSmtpHost ?? 'smtp-relay.brevo.com',
    brevoSmtpPort: row?.brevoSmtpPort != null ? String(row.brevoSmtpPort) : '587',
    brevoSmtpUser: row?.brevoSmtpUser ?? '',
    brevoSmtpPass: row?.brevoSmtpPass ?? '',
    brevoFromEmail: row?.brevoFromEmail ?? '',
    brevoFromName: row?.brevoFromName ?? 'Yadah',
    brevoNotifyEmail: row?.brevoNotifyEmail ?? '',
    stripeSecretKey: row?.stripeSecretKey ?? '',
    stripePublishableKey: row?.stripePublishableKey ?? '',
    stripeWebhookSecret: row?.stripeWebhookSecret ?? '',
    stripeEnabled: row?.stripeEnabled ?? false,
    paystackPublicKey: row?.paystackPublicKey ?? '',
    paystackSecretKey: row?.paystackSecretKey ?? '',
    paystackEnabled: row?.paystackEnabled ?? false,
    flutterwavePublicKey: row?.flutterwavePublicKey ?? '',
    flutterwaveSecretKey: row?.flutterwaveSecretKey ?? '',
    flutterwaveEnabled: row?.flutterwaveEnabled ?? false,
  }
}

function Badge({ live }: { live: boolean }) {
  return live ? (
    <span className="rounded-full bg-emerald-600/15 px-2 py-0.5 font-jost text-[10px] font-medium uppercase tracking-wider text-emerald-800">
      Live
    </span>
  ) : (
    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-jost text-[10px] font-medium uppercase tracking-wider text-amber-900">
      Not set
    </span>
  )
}

function PassRow({
  id,
  label,
  value,
  onChange,
  badgeLive,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  badgeLive: boolean
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <label className="admin-label mb-0" htmlFor={id}>
          {label}
        </label>
        <Badge live={badgeLive} />
      </div>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete="off"
          className="admin-input pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-admin-muted hover:text-admin-text"
          onClick={() => setShow((s) => !s)}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

export default function AdminSettingsForm({
  initial,
  integrationEnv,
}: {
  initial: SiteSettings | null
  integrationEnv: AdminSettingsIntegrationEnv
}) {
  const router = useRouter()
  const galleryFilesId = useId()
  const [tab, setTab] = useState<Tab>('General')
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [galleryBusy, setGalleryBusy] = useState(false)
  const [galleryErr, setGalleryErr] = useState('')
  const [galleryProgress, setGalleryProgress] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<AdminUploadStatus | null>(null)

  useEffect(() => {
    void getAdminUploadStatus().then(setUploadStatus)
  }, [])
  const [testBusy, setTestBusy] = useState(false)
  const [testMsg, setTestMsg] = useState('')

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const brevoLive =
    Boolean(form.brevoSmtpPass?.trim()) ||
    integrationEnv.brevoSmtpPassFromEnv ||
    Boolean(initial?.brevoSmtpPass?.trim())
  const stripeLive =
    Boolean(form.stripeSecretKey?.trim()) ||
    integrationEnv.stripeSecretFromEnv ||
    Boolean(initial?.stripeSecretKey?.trim())
  const paystackLive = Boolean(form.paystackPublicKey?.trim() && form.paystackSecretKey?.trim())
  const flutterLive = Boolean(form.flutterwavePublicKey?.trim() && form.flutterwaveSecretKey?.trim())

  const appendGalleryFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setGalleryErr('')
    setGalleryBusy(true)
    setGalleryProgress(0)
    const fileArray = Array.from(files)
    try {
      const urls: string[] = []
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const url = await uploadAdminImage(file, 'gallery', (p) => {
          if (p === null) {
            setGalleryProgress(null)
            return
          }
          const base = (i / fileArray.length) * 100
          const slice = (1 / fileArray.length) * p
          setGalleryProgress(Math.round(base + slice))
        })
        urls.push(url)
      }
      setGalleryProgress(100)
      setForm((f) => ({
        ...f,
        galleryText: [f.galleryText.trim(), ...urls].filter(Boolean).join('\n'),
      }))
    } catch (e) {
      setGalleryErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setGalleryBusy(false)
      setGalleryProgress(null)
    }
  }

  const galleryUploadReady = uploadStatus?.serverUploadReady === true

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const galleryImageUrls = form.galleryText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    const port = parseInt(form.brevoSmtpPort, 10)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: form.siteName,
          siteTagline: form.siteTagline || null,
          metaDescription: form.metaDescription || null,
          metaTitleSuffix: form.metaTitleSuffix || null,
          heroTagline: form.heroTagline || null,
          aboutBioShort: form.aboutBioShort || null,
          footerCopyright: form.footerCopyright || null,
          contactEmail: form.contactEmail || null,
          contactPhone: form.contactPhone || null,
          bookingEmail: form.bookingEmail || null,
          locationDisplay: form.locationDisplay || null,
          socialInstagram: form.socialInstagram || null,
          socialYoutube: form.socialYoutube || null,
          socialSpotify: form.socialSpotify || null,
          socialFacebook: form.socialFacebook || null,
          socialX: form.socialX || null,
          socialTiktok: form.socialTiktok || null,
          imageHero: form.imageHero || null,
          imageEditorial: form.imageEditorial || null,
          imageAboutHero: form.imageAboutHero || null,
          imageAboutPortrait: form.imageAboutPortrait || null,
          imageWorshipBg: form.imageWorshipBg || null,
          galleryImageUrls,
          brevoSmtpHost: form.brevoSmtpHost || null,
          brevoSmtpPort: Number.isFinite(port) ? port : null,
          brevoSmtpUser: form.brevoSmtpUser || null,
          brevoSmtpPass: form.brevoSmtpPass || null,
          brevoFromEmail: form.brevoFromEmail || null,
          brevoFromName: form.brevoFromName || null,
          brevoNotifyEmail: form.brevoNotifyEmail || null,
          stripeSecretKey: form.stripeSecretKey || null,
          stripePublishableKey: form.stripePublishableKey || null,
          stripeWebhookSecret: form.stripeWebhookSecret || null,
          stripeEnabled: form.stripeEnabled,
          paystackPublicKey: form.paystackPublicKey || null,
          paystackSecretKey: form.paystackSecretKey || null,
          paystackEnabled: form.paystackEnabled,
          flutterwavePublicKey: form.flutterwavePublicKey || null,
          flutterwaveSecretKey: form.flutterwaveSecretKey || null,
          flutterwaveEnabled: form.flutterwaveEnabled,
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

  const sendTest = async () => {
    setTestBusy(true)
    setTestMsg('')
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' })
      const j = (await res.json().catch(() => ({}))) as { error?: string; success?: boolean }
      if (!res.ok) throw new Error(j.error || 'Failed')
      setTestMsg('Test email sent.')
    } catch (e) {
      setTestMsg(e instanceof Error ? e.message : 'Failed')
    } finally {
      setTestBusy(false)
    }
  }

  const field = (id: keyof FormState, label: string, hint?: string, multiline = false) => (
    <div>
      <label className="admin-label" htmlFor={String(id)}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={String(id)}
          className="admin-input min-h-[88px] resize-y"
          value={form[id] as string}
          onChange={(e) => set(id, e.target.value)}
        />
      ) : (
        <input
          id={String(id)}
          className="admin-input"
          value={form[id] as string}
          onChange={(e) => set(id, e.target.value)}
        />
      )}
      {hint && <p className="mt-1 text-xs text-admin-muted">{hint}</p>}
    </div>
  )

  type SocialKey = 'socialInstagram' | 'socialYoutube' | 'socialSpotify' | 'socialFacebook' | 'socialX' | 'socialTiktok'
  const socialField = (id: SocialKey, title: string, iconLabel: string, hint: string) => (
    <div>
      <label className="admin-label flex items-center gap-2" htmlFor={String(id)}>
        <SocialIcon label={iconLabel} href={form[id] || '#'} className="h-4 w-4 shrink-0 text-admin-muted" />
        {title}
      </label>
      <input
        id={String(id)}
        className="admin-input"
        value={form[id] as string}
        onChange={(e) => set(id, e.target.value)}
        placeholder="https://..."
      />
      <p className="mt-1 text-xs text-admin-muted">{hint}</p>
    </div>
  )

  const galleryUrls = form.galleryText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <form onSubmit={onSave} className="pb-28">
      <div className="mb-8 flex flex-wrap gap-2 border-b border-admin-border pb-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 font-jost text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
              tab === t
                ? 'bg-admin-accent text-white shadow-sm'
                : 'bg-admin-bg text-admin-muted hover:bg-black/[0.04] hover:text-admin-text dark:hover:bg-white/[0.06]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'General' && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">General</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {field('siteName', 'Site name', 'Shown in the header, footer, and browser title.')}
            {field('siteTagline', 'Tagline', 'Short line under the name in the footer when set.')}
            {field('metaDescription', 'Default meta description', 'Used for SEO when a page does not set its own.', true)}
            {field('metaTitleSuffix', 'Title suffix', 'Appended in metadata, e.g. “Release name | Yadah”.')}
            {field('heroTagline', 'Hero tagline (homepage)', 'e.g. The Voice of Jesus Christ to Nations')}
            {field('aboutBioShort', 'About bio (short)', 'Shown on the homepage About snippet.', true)}
            {field('footerCopyright', 'Footer copyright line', 'Optional line in the footer bar (year is added automatically if you omit it).')}
          </div>
        </div>
      )}

      {tab === 'Contact' && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">Contact</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {field('contactEmail', 'Public contact email')}
            {field('contactPhone', 'Public phone number')}
            {field('bookingEmail', 'Booking enquiries email', 'Optional — use if different from the public address.')}
            {field('locationDisplay', 'Physical address / location', 'e.g. Abuja, Nigeria — can be used on the homepage hero line.')}
          </div>
        </div>
      )}

      {tab === 'Social' && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">Social</h2>
          <p className="text-sm text-admin-muted">Full URLs. Empty fields keep sensible defaults from the codebase.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {socialField('socialInstagram', 'Instagram', 'IG', 'Public profile or artist URL.')}
            {socialField('socialYoutube', 'YouTube', 'YT', 'Channel URL.')}
            {socialField('socialSpotify', 'Spotify', 'SP', 'Artist page URL.')}
            {socialField('socialFacebook', 'Facebook', 'FB', 'Page URL.')}
            {socialField('socialX', 'X (Twitter)', 'X', 'Profile URL.')}
            {socialField('socialTiktok', 'TikTok', 'TT', 'Profile URL.')}
          </div>
        </div>
      )}

      {tab === 'Images' && (
        <div className="admin-card space-y-8 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">Images</h2>
          <p className="text-sm text-admin-muted">
            Upload to Cloudinary or paste URLs. Leave blank to use built-in placeholders.{' '}
            {(uploadStatus?.cloudName?.trim() || cloudinaryCloudName) ? (
              <span className="font-mono text-[11px] text-admin-text">
                Cloud: {uploadStatus?.cloudName?.trim() || cloudinaryCloudName}
              </span>
            ) : null}
          </p>
          <div className="space-y-8">
            <AdminImageUpload
              label="Hero background"
              description="Homepage full-bleed behind the hero."
              value={form.imageHero}
              onChange={(v) => set('imageHero', v)}
              folder="site"
            />
            <AdminImageUpload
              label="Home “Artist” section image"
              description="Portrait beside the About snippet on the homepage."
              value={form.imageEditorial}
              onChange={(v) => set('imageEditorial', v)}
              folder="site"
            />
            <AdminImageUpload
              label="About page hero"
              description="Full-bleed header on /about."
              value={form.imageAboutHero}
              onChange={(v) => set('imageAboutHero', v)}
              folder="site"
            />
            <AdminImageUpload
              label="About page portrait"
              description="3:4 portrait in the bio section on /about."
              value={form.imageAboutPortrait}
              onChange={(v) => set('imageAboutPortrait', v)}
              folder="site"
            />
            <AdminImageUpload
              label="Booking CTA background"
              description="Dark worship image behind “Yadah is always glad to be a blessing”."
              value={form.imageWorshipBg}
              onChange={(v) => set('imageWorshipBg', v)}
              folder="site"
            />
          </div>
        </div>
      )}

      {tab === 'Gallery' && (
        <div className="admin-card space-y-6 p-6 sm:p-8">
          <h2 className="font-playfair text-lg text-admin-text">Gallery</h2>
          <p className="text-sm text-admin-muted">These images appear on the Media page under Photos.</p>
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
              disabled={!galleryUploadReady || galleryBusy || uploadStatus === null}
              onChange={(e) => {
                void appendGalleryFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <label
              htmlFor={galleryFilesId}
              className={`admin-btn admin-btn-secondary inline-flex cursor-pointer text-[10px] ${
                !galleryUploadReady || galleryBusy || uploadStatus === null ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {uploadStatus === null ? 'Checking…' : galleryBusy ? 'Uploading…' : 'Upload images to gallery'}
            </label>
            {galleryBusy ? (
              <div
                className="mt-3 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-admin-border"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={galleryProgress === null ? undefined : galleryProgress ?? 0}
              >
                <div
                  className={`h-full rounded-full bg-admin-accent transition-[width] duration-150 ease-out ${
                    galleryProgress === null ? 'w-1/3 animate-pulse' : ''
                  }`}
                  style={
                    galleryProgress !== null ? { width: `${Math.min(100, Math.max(0, galleryProgress))}%` } : undefined
                  }
                />
              </div>
            ) : null}
            {uploadStatus && !galleryUploadReady ? (
              <p className="mt-2 max-w-xl text-xs text-amber-800">
                {uploadStatus.publicCloudNameSet
                  ? 'Server is missing CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET — uploads are disabled until those are set on the server.'
                  : 'Configure Cloudinary (public cloud name + API key + secret) to enable gallery uploads, or paste URLs in the field above.'}
              </p>
            ) : null}
            {galleryErr && <p className="mt-2 text-xs text-red-700">{galleryErr}</p>}
          </div>
          {galleryUrls.length > 0 && (
            <div>
              <p className="admin-label mb-2">Preview</p>
              <div className="flex flex-wrap gap-2">
                {galleryUrls.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" className="max-h-[80px] rounded border border-admin-border object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'Integrations' && (
        <div className="space-y-8">
          <div className="admin-card space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-playfair text-lg text-admin-text">Email — Brevo SMTP</h2>
              <Badge live={brevoLive} />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {field('brevoSmtpHost', 'SMTP host', 'Default: smtp-relay.brevo.com')}
              {field('brevoSmtpPort', 'SMTP port', 'Default: 587')}
              {field('brevoSmtpUser', 'SMTP user', 'Brevo login email')}
              <PassRow
                id="brevoSmtpPass"
                label="SMTP password / key"
                value={form.brevoSmtpPass}
                onChange={(v) => set('brevoSmtpPass', v)}
                badgeLive={false}
              />
              {field('brevoFromEmail', 'From email')}
              {field('brevoFromName', 'From name')}
              {field('brevoNotifyEmail', 'Notify email', 'Receives booking & contact notifications; also used for test email.')}
            </div>
            <button
              type="button"
              disabled={testBusy}
              onClick={() => void sendTest()}
              className="admin-btn admin-btn-secondary text-[10px]"
            >
              {testBusy ? 'Sending…' : 'Send test email'}
            </button>
            {testMsg && <p className="text-xs text-admin-muted">{testMsg}</p>}
          </div>

          <div className="admin-card space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-playfair text-lg text-admin-text">Payments — Stripe</h2>
              <Badge live={stripeLive} />
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-admin-border"
                checked={form.stripeEnabled}
                onChange={(e) => set('stripeEnabled', e.target.checked)}
              />
              <span className="text-sm text-admin-text">Enable Stripe Checkout</span>
            </label>
            <PassRow
              id="stripeSecret"
              label="Secret key"
              value={form.stripeSecretKey}
              onChange={(v) => set('stripeSecretKey', v)}
              badgeLive={
                Boolean(form.stripeSecretKey?.trim()) ||
                integrationEnv.stripeSecretFromEnv ||
                Boolean(initial?.stripeSecretKey?.trim())
              }
            />
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <label className="admin-label mb-0" htmlFor="stripePub">
                  Publishable key
                </label>
                <Badge
                  live={
                    Boolean(form.stripePublishableKey?.trim()) ||
                    integrationEnv.stripePublishableFromEnv ||
                    Boolean(initial?.stripePublishableKey?.trim())
                  }
                />
              </div>
              <input
                id="stripePub"
                className="admin-input"
                value={form.stripePublishableKey}
                onChange={(e) => set('stripePublishableKey', e.target.value)}
              />
            </div>
            <PassRow
              id="stripeWh"
              label="Webhook secret"
              value={form.stripeWebhookSecret}
              onChange={(v) => set('stripeWebhookSecret', v)}
              badgeLive={
                Boolean(form.stripeWebhookSecret?.trim()) ||
                integrationEnv.stripeWebhookFromEnv ||
                Boolean(initial?.stripeWebhookSecret?.trim())
              }
            />
          </div>

          <div className="admin-card space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-playfair text-lg text-admin-text">Payments — Paystack</h2>
              <Badge live={paystackLive} />
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-admin-border"
                checked={form.paystackEnabled}
                onChange={(e) => set('paystackEnabled', e.target.checked)}
              />
              <span className="text-sm text-admin-text">Enable Paystack</span>
            </label>
            <div className="grid gap-6 sm:grid-cols-2">
              {field('paystackPublicKey', 'Public key')}
              <PassRow
                id="paystackSec"
                label="Secret key"
                value={form.paystackSecretKey}
                onChange={(v) => set('paystackSecretKey', v)}
                badgeLive={paystackLive}
              />
            </div>
          </div>

          <div className="admin-card space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-playfair text-lg text-admin-text">Payments — Flutterwave</h2>
              <Badge live={flutterLive} />
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-admin-border"
                checked={form.flutterwaveEnabled}
                onChange={(e) => set('flutterwaveEnabled', e.target.checked)}
              />
              <span className="text-sm text-admin-text">Enable Flutterwave</span>
            </label>
            <div className="grid gap-6 sm:grid-cols-2">
              {field('flutterwavePublicKey', 'Public key')}
              <PassRow
                id="flutterSec"
                label="Secret key"
                value={form.flutterwaveSecretKey}
                onChange={(v) => set('flutterwaveSecretKey', v)}
                badgeLive={flutterLive}
              />
            </div>
          </div>
        </div>
      )}

      {msg && <p className="mt-6 text-sm text-admin-muted">{msg}</p>}

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 lg:left-56">
        <div className="pointer-events-auto border-t border-admin-border bg-admin-surface/95 px-4 py-4 shadow-[0_-8px_32px_rgba(13,11,8,0.08)] backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-4">
            {msg && <span className="mr-auto text-sm text-admin-muted">{msg}</span>}
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? 'Saving…' : 'Save all settings'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
