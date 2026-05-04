'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Event, EventSpeaker, TicketTier } from '@prisma/client'
import { slugify } from '@/lib/slug'
import AdminImageUpload from '@/components/admin/AdminImageUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'

export type EventWithRelations = Event & {
  tiers: TicketTier[]
  speakers: EventSpeaker[]
}

type Mode = 'create' | 'edit'

function toDatetimeLocalValue(d: Date | string | undefined | null): string {
  if (!d) return ''
  const x = new Date(d)
  if (Number.isNaN(x.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`
}

type TierRow = {
  key: string
  id?: string
  name: string
  description: string
  price: string
  currency: 'NGN' | 'USD'
  capacity: string
  isActive: boolean
}

type SpeakerRow = {
  key: string
  name: string
  role: string
  bio: string
  photo: string
  order: string
}

function tierFromDb(t: TicketTier): TierRow {
  return {
    key: t.id,
    id: t.id,
    name: t.name,
    description: t.description ?? '',
    price: String(t.price / 100),
    currency: (t.currency === 'USD' ? 'USD' : 'NGN') as 'NGN' | 'USD',
    capacity: t.capacity != null ? String(t.capacity) : '',
    isActive: t.isActive,
  }
}

function speakerFromDb(s: EventSpeaker): SpeakerRow {
  return {
    key: s.id,
    name: s.name,
    role: s.role ?? '',
    bio: s.bio ?? '',
    photo: s.photo ?? '',
    order: String(s.order),
  }
}

function newTierRow(): TierRow {
  return {
    key: `new-${crypto.randomUUID()}`,
    name: 'General',
    description: '',
    price: '0',
    currency: 'NGN',
    capacity: '',
    isActive: true,
  }
}

function newSpeakerRow(): SpeakerRow {
  return {
    key: `new-${crypto.randomUUID()}`,
    name: '',
    role: '',
    bio: '',
    photo: '',
    order: '0',
  }
}

export default function EventForm({ mode, initial }: { mode: Mode; initial?: EventWithRelations }) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugManual, setSlugManual] = useState(mode === 'edit')
  const [status, setStatus] = useState<Event['status']>(initial?.status ?? 'DRAFT')
  const [type, setType] = useState<Event['type']>(initial?.type ?? 'PHYSICAL')
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false)
  const [date, setDate] = useState(toDatetimeLocalValue(initial?.date ?? new Date()))
  const [endDate, setEndDate] = useState(toDatetimeLocalValue(initial?.endDate))
  const [doorsOpen, setDoorsOpen] = useState(initial?.doorsOpen ?? '')
  const [timezone, setTimezone] = useState(initial?.timezone ?? 'Africa/Lagos')
  const [venueName, setVenueName] = useState(initial?.venueName ?? '')
  const [venueAddress, setVenueAddress] = useState(initial?.venueAddress ?? '')
  const [venueCity, setVenueCity] = useState(initial?.venueCity ?? '')
  const [venueCountry, setVenueCountry] = useState(initial?.venueCountry ?? 'Nigeria')
  const [isOnline, setIsOnline] = useState(initial?.isOnline ?? false)
  const [streamUrl, setStreamUrl] = useState(initial?.streamUrl ?? '')
  const [bannerImage, setBannerImage] = useState(initial?.bannerImage ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dressCode, setDressCode] = useState(initial?.dressCode ?? '')
  const [requirements, setRequirements] = useState(initial?.requirements ?? '')
  const [totalCapacity, setTotalCapacity] = useState(initial?.totalCapacity != null ? String(initial.totalCapacity) : '')

  const [tiers, setTiers] = useState<TierRow[]>(() =>
    initial?.tiers?.length ? initial.tiers.map(tierFromDb) : [newTierRow()],
  )
  const [speakers, setSpeakers] = useState<SpeakerRow[]>(() =>
    initial?.speakers?.length ? initial.speakers.map(speakerFromDb) : [],
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const onTitle = (v: string) => {
    setTitle(v)
    if (!slugManual) setSlug(slugify(v))
  }

  const buildPayload = () => {
    const tc = totalCapacity.trim() === '' ? null : Math.max(0, parseInt(totalCapacity, 10) || 0)
    return {
      title: title.trim(),
      slug: slug.trim() || null,
      status,
      type,
      isFeatured,
      date,
      endDate: endDate.trim() === '' ? null : endDate,
      doorsOpen: doorsOpen.trim() || null,
      timezone,
      venueName: venueName.trim() || null,
      venueAddress: venueAddress.trim() || null,
      venueCity: venueCity.trim() || null,
      venueCountry: venueCountry.trim() || 'Nigeria',
      isOnline,
      streamUrl: streamUrl.trim() || null,
      bannerImage: bannerImage.trim() || null,
      description: description || null,
      dressCode: dressCode.trim() || null,
      requirements: requirements || null,
      totalCapacity: tc,
      tiers: tiers.map((t) => ({
        id: t.id,
        name: t.name.trim(),
        description: t.description.trim() || null,
        price: Number(t.price) || 0,
        currency: t.currency,
        capacity:
          t.capacity.trim() === '' ? null : Math.max(1, Math.min(10_000_000, parseInt(t.capacity, 10) || 1)),
        isActive: t.isActive,
      })),
      speakers: speakers
        .filter((s) => s.name.trim())
        .map((s) => ({
          name: s.name.trim(),
          role: s.role.trim() || null,
          bio: s.bio.trim() || null,
          photo: s.photo.trim() || null,
          order: parseInt(s.order, 10) || 0,
        })),
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const payload = buildPayload()
    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(j.error || 'Failed to create')
        }
        const row = (await res.json()) as { id: string }
        router.push(`/admin/events/${row.id}`)
        router.refresh()
        return
      }
      if (!initial?.id) return
      const res = await fetch(`/api/admin/events/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(j.error || 'Failed to save')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const section = (label: string) => (
    <p className="mt-10 border-t border-admin-border pt-8 text-[10px] font-medium uppercase tracking-[0.14em] text-admin-muted first:mt-0 first:border-0 first:pt-0">
      {label}
    </p>
  )

  return (
    <form onSubmit={onSubmit} className="admin-card max-w-4xl space-y-4 p-6 sm:p-8">
      {section('Basic info')}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="admin-label">Title</label>
          <input className="admin-input" value={title} onChange={(e) => onTitle(e.target.value)} required />
        </div>
        <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label className="admin-label">URL slug</label>
            <input
              className="admin-input font-mono text-sm"
              value={slug}
              onChange={(e) => {
                setSlugManual(true)
                setSlug(e.target.value)
              }}
              placeholder="auto from title"
            />
            <p className="mt-1 text-xs text-admin-muted">Public URL: /events/{slug || '…'}</p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn-secondary shrink-0 text-[10px]"
            onClick={() => {
              setSlugManual(false)
              setSlug(slugify(title))
            }}
          >
            Sync from title
          </button>
        </div>
        <div>
          <label className="admin-label">Status</label>
          <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value as Event['status'])}>
            <option value="DRAFT">Draft</option>
            <option value="COMING_SOON">Coming soon</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PAST">Past</option>
          </select>
        </div>
        <div>
          <label className="admin-label">Type</label>
          <select className="admin-input" value={type} onChange={(e) => setType(e.target.value as Event['type'])}>
            <option value="PHYSICAL">Physical</option>
            <option value="ONLINE">Online</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-admin-text">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-admin-border text-admin-accent"
            />
            Featured
          </label>
        </div>
      </div>

      {section('Date & time')}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="admin-label">Start (local)</label>
          <input type="datetime-local" className="admin-input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="admin-label">End (optional)</label>
          <input type="datetime-local" className="admin-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Doors open (text)</label>
          <input className="admin-input" value={doorsOpen} onChange={(e) => setDoorsOpen(e.target.value)} placeholder='e.g. "5:00 PM"' />
        </div>
        <div>
          <label className="admin-label">Timezone</label>
          <select className="admin-input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="Africa/Lagos">Africa/Lagos</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
      </div>

      {section('Location')}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="admin-label">Venue name</label>
          <input className="admin-input" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label">Venue address</label>
          <input className="admin-input" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} />
        </div>
        <div>
          <label className="admin-label">City</label>
          <input className="admin-input" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Country</label>
          <input className="admin-input" value={venueCountry} onChange={(e) => setVenueCountry(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-admin-text">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4 rounded border-admin-border text-admin-accent"
            />
            Online / livestream
          </label>
        </div>
        {isOnline && (
          <div className="sm:col-span-2">
            <label className="admin-label">Stream URL</label>
            <input className="admin-input" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} placeholder="https://…" />
          </div>
        )}
      </div>

      {section('Media & content')}
      <div className="space-y-4">
        <AdminImageUpload
          label="Banner image"
          value={bannerImage}
          onChange={setBannerImage}
          folder="events"
          urlPlaceholder="https://…"
        />
        <div>
          <label className="admin-label">Description</label>
          <RichTextEditor value={description} onChange={setDescription} minHeight="300px" />
        </div>
        <div>
          <label className="admin-label">Dress code</label>
          <input className="admin-input" value={dressCode} onChange={(e) => setDressCode(e.target.value)} />
        </div>
        <div>
          <label className="admin-label">Requirements</label>
          <RichTextEditor value={requirements} onChange={setRequirements} minHeight="150px" />
        </div>
      </div>

      {section('Capacity')}
      <div>
        <label className="admin-label">Total capacity (optional)</label>
        <input
          className="admin-input max-w-xs"
          type="number"
          min={0}
          value={totalCapacity}
          onChange={(e) => setTotalCapacity(e.target.value)}
          placeholder="Unlimited if empty"
        />
      </div>

      {section('Ticket tiers')}
      <div className="space-y-4">
        {tiers.map((t, idx) => (
          <div key={t.key} className="rounded-lg border border-admin-border p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-admin-muted">Tier {idx + 1}</span>
              {tiers.length > 1 && (
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost text-[10px] text-red-700"
                  onClick={() => setTiers((prev) => prev.filter((x) => x.key !== t.key))}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="admin-label">Name</label>
                <input className="admin-input" value={t.name} onChange={(e) => setTiers((p) => p.map((x) => (x.key === t.key ? { ...x, name: e.target.value } : x)))} />
              </div>
              <div>
                <label className="admin-label">Price ({t.currency})</label>
                <input
                  className="admin-input"
                  type="number"
                  min={0}
                  step="0.01"
                  value={t.price}
                  onChange={(e) => setTiers((p) => p.map((x) => (x.key === t.key ? { ...x, price: e.target.value } : x)))}
                />
                <p className="mt-0.5 text-[10px] text-admin-muted">Major units (e.g. 5000 NGN); saved as minor (×100).</p>
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Description</label>
                <input
                  className="admin-input"
                  value={t.description}
                  onChange={(e) => setTiers((p) => p.map((x) => (x.key === t.key ? { ...x, description: e.target.value } : x)))}
                />
              </div>
              <div>
                <label className="admin-label">Currency</label>
                <select
                  className="admin-input"
                  value={t.currency}
                  onChange={(e) =>
                    setTiers((p) => p.map((x) => (x.key === t.key ? { ...x, currency: e.target.value as 'NGN' | 'USD' } : x)))
                  }
                >
                  <option value="NGN">NGN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="admin-label">Capacity (optional)</label>
                <input
                  className="admin-input"
                  type="number"
                  min={1}
                  value={t.capacity}
                  onChange={(e) => setTiers((p) => p.map((x) => (x.key === t.key ? { ...x, capacity: e.target.value } : x)))}
                  placeholder="Unlimited"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-admin-text">
                  <input
                    type="checkbox"
                    checked={t.isActive}
                    onChange={(e) => setTiers((p) => p.map((x) => (x.key === t.key ? { ...x, isActive: e.target.checked } : x)))}
                    className="h-4 w-4 rounded border-admin-border text-admin-accent"
                  />
                  Active
                </label>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn-secondary text-[10px]" onClick={() => setTiers((p) => [...p, newTierRow()])}>
          + Add tier
        </button>
      </div>

      {section('Speakers / ministers')}
      <div className="space-y-4">
        {speakers.map((s, idx) => (
          <div key={s.key} className="rounded-lg border border-admin-border p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-admin-muted">Speaker {idx + 1}</span>
              <button
                type="button"
                className="admin-btn admin-btn-ghost text-[10px] text-red-700"
                onClick={() => setSpeakers((prev) => prev.filter((x) => x.key !== s.key))}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="admin-label">Name</label>
                <input className="admin-input" value={s.name} onChange={(e) => setSpeakers((p) => p.map((x) => (x.key === s.key ? { ...x, name: e.target.value } : x)))} required />
              </div>
              <div>
                <label className="admin-label">Role</label>
                <input className="admin-input" value={s.role} onChange={(e) => setSpeakers((p) => p.map((x) => (x.key === s.key ? { ...x, role: e.target.value } : x)))} placeholder="Speaker, Host, …" />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label">Bio</label>
                <textarea className="admin-input min-h-[72px]" value={s.bio} onChange={(e) => setSpeakers((p) => p.map((x) => (x.key === s.key ? { ...x, bio: e.target.value } : x)))} />
              </div>
              <AdminImageUpload
                label="Photo"
                value={s.photo}
                onChange={(url) => setSpeakers((p) => p.map((x) => (x.key === s.key ? { ...x, photo: url } : x)))}
                folder="events"
              />
              <div>
                <label className="admin-label">Order</label>
                <input className="admin-input" type="number" value={s.order} onChange={(e) => setSpeakers((p) => p.map((x) => (x.key === s.key ? { ...x, order: e.target.value } : x)))} />
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="admin-btn admin-btn-secondary text-[10px]" onClick={() => setSpeakers((p) => [...p, newSpeakerRow()])}>
          + Add speaker
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex flex-wrap gap-3 pt-4">
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
          {saving ? 'Saving…' : mode === 'create' ? 'Create event' : 'Save changes'}
        </button>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={() => router.push('/admin/events')}>
          Back to list
        </button>
      </div>
    </form>
  )
}
