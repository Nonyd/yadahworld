'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useMemo, useState } from 'react'
import type { SiteSettings } from '@prisma/client'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import { cloudinaryCloudName } from '@/lib/cloudinary'
import { getAdminUploadStatus, uploadAdminImage, type AdminUploadStatus } from '@/lib/admin-upload-client'
import {
  buildSiteContentJsonFromDotMap,
  formatSiteTextLeafLabel,
  getCopyString,
  listSiteCopyDotPaths,
  mergeSiteContent,
} from '@/lib/site-copy'
import { SITE_TEXT_URL_FIELDS, SITE_TEXT_URL_PATH_SET } from '@/lib/site-text-url-fields'
import { SocialIcon } from '@/components/ui/SocialIcons'
import RichTextEditor from '@/components/admin/RichTextEditor'

const TABS = ['General', 'Contact', 'Social', 'Images', 'Gallery', 'Campus tour', 'Site text', 'Integrations'] as const

const RICH_TEXT_EDITOR_PATHS = new Set([
  'aboutPage.body1',
  'aboutPage.body2',
  'campusTour.body1',
  'campusTour.body2',
  'legal.privacyBody',
  'legal.refundBody',
  'legal.cookieBody',
])

function siteTextUseRichEditor(path: string): boolean {
  return RICH_TEXT_EDITOR_PATHS.has(path)
}

function richTextEditorMinHeight(path: string): string {
  if (path === 'aboutPage.body1') return '250px'
  if (path === 'aboutPage.body2') return '200px'
  if (path === 'campusTour.body1' || path === 'campusTour.body2') return '220px'
  if (path.startsWith('legal.')) return '280px'
  return '200px'
}

const SITE_TEXT_GROUP_ORDER = [
  'nav',
  'footer',
  'home',
  'media',
  'aboutPage',
  'gospelPage',
  'ministrationsPage',
  'eventsPage',
  'bookingPage',
  'contactPage',
  'campusTour',
  'shop',
  'releases',
  'releaseDetail',
  'unsubscribedPage',
  'legal',
  'contactForm',
] as const

const SITE_TEXT_GROUP_LABEL: Record<string, string> = {
  nav: 'Navigation (navbar)',
  footer: 'Footer',
  home: 'Homepage sections',
  media: 'Media page',
  aboutPage: 'About page',
  gospelPage: 'Gospel page',
  ministrationsPage: 'Ministrations page',
  eventsPage: 'Events listing',
  bookingPage: 'Booking page',
  contactPage: 'Contact page',
  campusTour: 'Campus tour page',
  shop: 'Shop page',
  releases: 'Releases index',
  releaseDetail: 'Single release page',
  unsubscribedPage: 'Newsletter unsubscribed page',
  legal: 'Legal snippets (short placeholders)',
  contactForm: 'Contact form (labels & messages)',
}

function siteTextUseTextarea(path: string): boolean {
  if (siteTextUseRichEditor(path)) return false
  if (path.startsWith('gospelPage.')) {
    if (path.endsWith('Eyebrow') || path.endsWith('Title') || path.endsWith('Cite')) return false
    if (path === 'gospelPage.ctaContact' || path === 'gospelPage.ctaMusic') return false
    return true
  }
  const tail = path.split('.').pop() ?? path
  if (
    tail.includes('Lines') ||
    tail.includes('Marquee') ||
    tail.endsWith('Body') ||
    tail === 'intro' ||
    tail === 'note' ||
    tail === 'blockquote' ||
    tail === 'body1' ||
    tail === 'body2' ||
    tail === 'successBody' ||
    tail === 'emptyBody' ||
    tail === 'taglineQuote' ||
    tail.startsWith('preFooter') ||
    tail === 'creditLine' ||
    tail === 'messagePh' ||
    tail === 'faithDeclaration' ||
    tail === 'mantraQuote' ||
    tail === 'ministryBody' ||
    tail === 'prayerBody' ||
    tail === 'bookingPrompt' ||
    tail === 'newsletterBody'
  )
    return true
  return false
}
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
  imageSiteLogo: string
  imageHero: string
  imageEditorial: string
  imageAboutHero: string
  imageAboutPortrait: string
  imageWorshipBg: string
  imageCampusTourPortrait: string
  campusTourMarquee1Text: string
  campusTourMarquee2Text: string
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
    imageSiteLogo: row?.imageSiteLogo ?? '',
    imageHero: row?.imageHero ?? '',
    imageEditorial: row?.imageEditorial ?? '',
    imageAboutHero: row?.imageAboutHero ?? '',
    imageAboutPortrait: row?.imageAboutPortrait ?? '',
    imageWorshipBg: row?.imageWorshipBg ?? '',
    imageCampusTourPortrait: row?.imageCampusTourPortrait ?? '',
    campusTourMarquee1Text: (row?.campusTourMarquee1Urls ?? []).join('\n'),
    campusTourMarquee2Text: (row?.campusTourMarquee2Urls ?? []).join('\n'),
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
  const campusTourM1FilesId = useId()
  const campusTourM2FilesId = useId()
  const [tab, setTab] = useState<Tab>('General')
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const siteContentKey =
    initial?.siteContentJson === null || initial?.siteContentJson === undefined
      ? ''
      : JSON.stringify(initial.siteContentJson)
  const [copyForm, setCopyForm] = useState<Record<string, string>>(() => {
    const merged = mergeSiteContent(initial?.siteContentJson ?? null)
    const o: Record<string, string> = {}
    for (const p of listSiteCopyDotPaths()) o[p] = getCopyString(merged, p)
    return o
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [galleryBusy, setGalleryBusy] = useState(false)
  const [galleryErr, setGalleryErr] = useState('')
  const [galleryProgress, setGalleryProgress] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<AdminUploadStatus | null>(null)

  useEffect(() => {
    void getAdminUploadStatus().then(setUploadStatus)
  }, [])

  useEffect(() => {
    const merged = mergeSiteContent(initial?.siteContentJson ?? null)
    const o: Record<string, string> = {}
    for (const p of listSiteCopyDotPaths()) o[p] = getCopyString(merged, p)
    setCopyForm(o)
  }, [siteContentKey, initial])

  const copyPathsByGroup = useMemo(() => {
    const g: Record<string, string[]> = {}
    for (const p of listSiteCopyDotPaths()) {
      if (SITE_TEXT_URL_PATH_SET.has(p)) continue
      const seg = p.split('.')[0]!
      if (!g[seg]) g[seg] = []
      g[seg].push(p)
    }
    const out: { key: string; paths: string[] }[] = []
    for (const k of SITE_TEXT_GROUP_ORDER) {
      const paths = g[k]?.length ? [...g[k]!] : []
      if (paths.length) out.push({ key: k, paths })
    }
    const orderStr = SITE_TEXT_GROUP_ORDER as readonly string[]
    for (const k of Object.keys(g)) {
      if (!orderStr.includes(k) && g[k]?.length) {
        out.push({ key: k, paths: [...g[k]!] })
      }
    }
    return out
  }, [])
  const [testBusy, setTestBusy] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const [m1Busy, setM1Busy] = useState(false)
  const [m1Err, setM1Err] = useState('')
  const [m1Prog, setM1Prog] = useState<number | null>(null)
  const [m2Busy, setM2Busy] = useState(false)
  const [m2Err, setM2Err] = useState('')
  const [m2Prog, setM2Prog] = useState<number | null>(null)

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

  const appendMarqueeRow = async (row: 1 | 2, files: FileList | null) => {
    if (!files?.length) return
    const setBusy = row === 1 ? setM1Busy : setM2Busy
    const setErr = row === 1 ? setM1Err : setM2Err
    const setProg = row === 1 ? setM1Prog : setM2Prog
    setErr('')
    setBusy(true)
    setProg(0)
    const fileArray = Array.from(files)
    try {
      const urls: string[] = []
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const url = await uploadAdminImage(file, 'gallery', (p) => {
          if (p === null) {
            setProg(null)
            return
          }
          const base = (i / fileArray.length) * 100
          const slice = (1 / fileArray.length) * p
          setProg(Math.round(base + slice))
        })
        urls.push(url)
      }
      setProg(100)
      if (row === 1) {
        setForm((f) => ({
          ...f,
          campusTourMarquee1Text: [f.campusTourMarquee1Text.trim(), ...urls].filter(Boolean).join('\n'),
        }))
      } else {
        setForm((f) => ({
          ...f,
          campusTourMarquee2Text: [f.campusTourMarquee2Text.trim(), ...urls].filter(Boolean).join('\n'),
        }))
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      setProg(null)
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
    const campusTourMarquee1Urls = form.campusTourMarquee1Text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
    const campusTourMarquee2Urls = form.campusTourMarquee2Text
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
          imageSiteLogo: form.imageSiteLogo || null,
          imageHero: form.imageHero || null,
          imageEditorial: form.imageEditorial || null,
          imageAboutHero: form.imageAboutHero || null,
          imageAboutPortrait: form.imageAboutPortrait || null,
          imageWorshipBg: form.imageWorshipBg || null,
          imageCampusTourPortrait: form.imageCampusTourPortrait || null,
          campusTourMarquee1Urls,
          campusTourMarquee2Urls,
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
          siteContentJson: buildSiteContentJsonFromDotMap(copyForm),
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

  const campusTourM1Urls = form.campusTourMarquee1Text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
  const campusTourM2Urls = form.campusTourMarquee2Text
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
              label="Site logo (navbar, footer, admin)"
              description="Same mark as the public site; used on admin sign-in and dashboard when set."
              value={form.imageSiteLogo}
              onChange={(v) => set('imageSiteLogo', v)}
              folder="site"
            />
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

      {tab === 'Campus tour' && (
        <div className="admin-card space-y-10 p-6 sm:p-8">
          <div>
            <h2 className="font-playfair text-lg text-admin-text">Campus tour</h2>
            <p className="mt-2 max-w-2xl text-sm text-admin-muted">
              Images for <span className="font-mono text-admin-text">/campus-tour</span>: the large portrait beside the
              copy, and two full-width marquee rows (row 1 moves left; row 2 moves right). Add several images per row
              for a smooth loop. Leave marquee lists empty to use temporary placeholders until you upload.
            </p>
          </div>

          <AdminImageUpload
            label="Portrait (beside ministry text)"
            description="Tall image on the right on desktop; keep subject centered for crop."
            value={form.imageCampusTourPortrait}
            onChange={(v) => set('imageCampusTourPortrait', v)}
            folder="site"
          />

          <div className="space-y-3">
            <label className="admin-label" htmlFor="campusTourMarquee1Text">
              Marquee row 1 — image URLs (one per line)
            </label>
            <textarea
              id="campusTourMarquee1Text"
              className="admin-input min-h-[120px] resize-y font-mono text-xs"
              value={form.campusTourMarquee1Text}
              onChange={(e) => set('campusTourMarquee1Text', e.target.value)}
            />
            <input
              id={campusTourM1FilesId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif,.heic,.heif"
              multiple
              className="sr-only"
              disabled={!galleryUploadReady || m1Busy || uploadStatus === null}
              onChange={(e) => {
                void appendMarqueeRow(1, e.target.files)
                e.target.value = ''
              }}
            />
            <label
              htmlFor={campusTourM1FilesId}
              className={`admin-btn admin-btn-secondary inline-flex cursor-pointer text-[10px] ${
                !galleryUploadReady || m1Busy || uploadStatus === null ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {uploadStatus === null ? 'Checking…' : m1Busy ? 'Uploading…' : 'Upload to row 1'}
            </label>
            {m1Busy ? (
              <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-admin-border">
                <div
                  className={`h-full rounded-full bg-admin-accent transition-[width] duration-150 ease-out ${
                    m1Prog === null ? 'w-1/3 animate-pulse' : ''
                  }`}
                  style={m1Prog !== null ? { width: `${Math.min(100, Math.max(0, m1Prog))}%` } : undefined}
                />
              </div>
            ) : null}
            {m1Err ? <p className="text-xs text-red-700">{m1Err}</p> : null}
            {campusTourM1Urls.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {campusTourM1Urls.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" className="max-h-[72px] rounded border border-admin-border object-cover" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-3">
            <label className="admin-label" htmlFor="campusTourMarquee2Text">
              Marquee row 2 — image URLs (one per line, scrolls opposite row 1)
            </label>
            <textarea
              id="campusTourMarquee2Text"
              className="admin-input min-h-[120px] resize-y font-mono text-xs"
              value={form.campusTourMarquee2Text}
              onChange={(e) => set('campusTourMarquee2Text', e.target.value)}
            />
            <input
              id={campusTourM2FilesId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif,.heic,.heif"
              multiple
              className="sr-only"
              disabled={!galleryUploadReady || m2Busy || uploadStatus === null}
              onChange={(e) => {
                void appendMarqueeRow(2, e.target.files)
                e.target.value = ''
              }}
            />
            <label
              htmlFor={campusTourM2FilesId}
              className={`admin-btn admin-btn-secondary inline-flex cursor-pointer text-[10px] ${
                !galleryUploadReady || m2Busy || uploadStatus === null ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {uploadStatus === null ? 'Checking…' : m2Busy ? 'Uploading…' : 'Upload to row 2'}
            </label>
            {m2Busy ? (
              <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-admin-border">
                <div
                  className={`h-full rounded-full bg-admin-accent transition-[width] duration-150 ease-out ${
                    m2Prog === null ? 'w-1/3 animate-pulse' : ''
                  }`}
                  style={m2Prog !== null ? { width: `${Math.min(100, Math.max(0, m2Prog))}%` } : undefined}
                />
              </div>
            ) : null}
            {m2Err ? <p className="text-xs text-red-700">{m2Err}</p> : null}
            {campusTourM2Urls.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {campusTourM2Urls.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt="" className="max-h-[72px] rounded border border-admin-border object-cover" />
                ))}
              </div>
            ) : null}
          </div>
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

      {tab === 'Site text' && (
        <div className="admin-card flex max-h-[min(78vh,880px)] flex-col overflow-hidden p-0 sm:p-0">
          <div className="shrink-0 space-y-3 border-b border-admin-border p-6 sm:p-8 sm:pb-5">
            <h2 className="font-playfair text-lg text-admin-text">Site text</h2>
            <p className="text-sm text-admin-muted">
              Public copy for pages and chrome. Values merge with built-in defaults. Use <strong>Links &amp; URLs</strong>{' '}
              for destinations (navbar, footer, booking, Room For You). In <strong>Contact page → booking prompt</strong> and{' '}
              <strong>Contact page → body</strong>, include{' '}
              <code className="rounded bg-admin-bg px-1 py-0.5 font-mono text-[11px]">{'{{booking}}'}</code> where the booking
              link should appear. In <strong>Campus tour → body1</strong>, include{' '}
              <code className="rounded bg-admin-bg px-1 py-0.5 font-mono text-[11px]">{'{{rfy}}'}</code> for the Room For You
              link — its URL is under Links.
            </p>
            <nav className="flex flex-wrap gap-2 pt-2" aria-label="Jump to site text section">
              {copyPathsByGroup.map(({ key }) => (
                <a
                  key={key}
                  href={`#st-${key}`}
                  className="rounded-full border border-admin-border bg-admin-surface px-3 py-1.5 font-jost text-[10px] font-medium uppercase tracking-[0.12em] text-admin-muted transition-colors hover:border-admin-text/20 hover:text-admin-text"
                >
                  {SITE_TEXT_GROUP_LABEL[key] ?? key}
                </a>
              ))}
            </nav>
          </div>

          <div className="min-h-0 flex-1 space-y-8 overflow-y-auto p-6 sm:p-8">
          <div className="space-y-4 rounded-lg border border-admin-border bg-black/[0.02] p-5 sm:p-6">
            <h3 className="font-jost text-xs font-semibold uppercase tracking-[0.2em] text-admin-muted">Links &amp; URLs</h3>
            <p className="text-xs text-admin-muted">
              These control where buttons and nav items go. Use a full <span className="font-mono">https://…</span> address
              for external sites, or a path like <span className="font-mono">/booking</span> for pages on this site.
            </p>
            <div className="grid gap-5 pt-2">
              {SITE_TEXT_URL_FIELDS.map(({ path, title, hint }) => (
                <div key={path} className="rounded-md border border-admin-border/80 bg-admin-surface/40 p-4">
                  <p className="font-jost text-sm font-medium text-admin-text">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-admin-muted">{hint}</p>
                  <p className="mt-3 font-mono text-[10px] tracking-tight text-admin-muted/90">{path}</p>
                  <input
                    type="text"
                    className="admin-input mt-2 font-mono text-xs"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="https://… or /page"
                    value={copyForm[path] ?? ''}
                    onChange={(e) => setCopyForm((c) => ({ ...c, [path]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {copyPathsByGroup.map(({ key, paths }) => (
            <div
              key={key}
              id={`st-${key}`}
              className="scroll-mt-4 space-y-4 border-t border-admin-border pt-6 first:border-t-0 first:pt-0"
            >
              <h3 className="font-jost text-xs font-semibold uppercase tracking-[0.2em] text-admin-muted">
                {SITE_TEXT_GROUP_LABEL[key] ?? key}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {paths.map((path) => (
                  <div
                    key={path}
                    className={siteTextUseRichEditor(path) || siteTextUseTextarea(path) ? 'sm:col-span-2' : undefined}
                  >
                    <label className="admin-label mb-1 block">
                      <span className="block font-jost text-xs font-medium normal-case tracking-normal text-admin-text">
                        {SITE_TEXT_GROUP_LABEL[path.split('.')[0] ?? ''] ?? path.split('.')[0]} ›{' '}
                        {formatSiteTextLeafLabel(path)}
                      </span>
                      <span className="mt-0.5 block font-mono text-[10px] normal-case tracking-tight text-admin-muted">
                        {path}
                      </span>
                    </label>
                    {siteTextUseRichEditor(path) ? (
                      <RichTextEditor
                        value={copyForm[path] ?? ''}
                        onChange={(html) => setCopyForm((c) => ({ ...c, [path]: html }))}
                        minHeight={richTextEditorMinHeight(path)}
                        placeholder={`Edit ${path}…`}
                      />
                    ) : siteTextUseTextarea(path) ? (
                      <textarea
                        className="admin-input min-h-[72px] resize-y font-mono text-xs"
                        value={copyForm[path] ?? ''}
                        onChange={(e) => setCopyForm((c) => ({ ...c, [path]: e.target.value }))}
                      />
                    ) : (
                      <input
                        className="admin-input font-mono text-xs"
                        value={copyForm[path] ?? ''}
                        onChange={(e) => setCopyForm((c) => ({ ...c, [path]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
