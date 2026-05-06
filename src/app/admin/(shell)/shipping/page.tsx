'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatNgnKobo } from '@/lib/shop-money'

type ShippingRate = {
  id: string
  zone: string
  label: string
  rate: number
  isActive: boolean
}

export default function AdminShippingPage() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<string>('')
  const [defaultShippingRate, setDefaultShippingRate] = useState<string>('1500')
  const [message, setMessage] = useState('')

  useEffect(() => {
    void fetch('/api/admin/shipping')
      .then(async (res) => {
        const data = (await res.json()) as {
          rates: ShippingRate[]
          settings?: { freeShippingThreshold?: number | null; defaultShippingRate?: number | null }
        }
        if (!res.ok) throw new Error('Failed to load shipping settings')
        setRates(data.rates ?? [])
        setFreeShippingThreshold(data.settings?.freeShippingThreshold ? String((data.settings.freeShippingThreshold ?? 0) / 100) : '')
        setDefaultShippingRate(String((data.settings?.defaultShippingRate ?? 150000) / 100))
      })
      .catch((e) => setMessage(e instanceof Error ? e.message : 'Failed to load shipping settings'))
      .finally(() => setLoading(false))
  }, [])

  const hasRates = useMemo(() => rates.length > 0, [rates.length])

  useEffect(() => {
    if (loading || hasRates) return
    void fetch('/api/admin/shipping/seed', { method: 'POST' })
      .then(() => fetch('/api/admin/shipping'))
      .then((res) => res.json() as Promise<{ rates: ShippingRate[] }>)
      .then((data) => setRates(data.rates ?? []))
      .catch(() => null)
  }, [loading, hasRates])

  const saveRates = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates }),
      })
      if (!res.ok) throw new Error('Failed to save shipping rates')
      setMessage('Shipping rates saved.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const saveGeneral = async () => {
    setSaving(true)
    setMessage('')
    try {
      const payload = {
        freeShippingThreshold:
          freeShippingThreshold.trim() === '' ? null : Math.round(Number(freeShippingThreshold) * 100),
        defaultShippingRate: Math.round(Number(defaultShippingRate || '1500') * 100),
      }
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save general shipping settings')
      setMessage('General shipping settings saved.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const seedDefaults = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/shipping/seed', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to seed default rates')
      const reload = await fetch('/api/admin/shipping')
      const data = (await reload.json()) as { rates: ShippingRate[] }
      setRates(data.rates ?? [])
      setMessage('Default shipping rates seeded.')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Seeding failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="admin-card p-6">
        <h1 className="font-playfair text-2xl text-admin-text">Shipping</h1>
        <p className="mt-2 text-sm text-admin-muted">Configure free shipping threshold, fallback rate, and per-zone shipping fees.</p>
      </section>

      <section className="admin-card p-6">
        <h2 className="font-playfair text-lg text-admin-text">General Settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label">Free shipping threshold (₦)</label>
            <input className="admin-input" value={freeShippingThreshold} onChange={(e) => setFreeShippingThreshold(e.target.value)} placeholder="Leave blank to disable" />
          </div>
          <div>
            <label className="admin-label">Default shipping rate (₦)</label>
            <input className="admin-input" value={defaultShippingRate} onChange={(e) => setDefaultShippingRate(e.target.value)} />
          </div>
        </div>
        <button type="button" className="admin-btn admin-btn-primary mt-4 text-[10px]" disabled={saving} onClick={() => void saveGeneral()}>
          Save
        </button>
      </section>

      <section className="admin-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-playfair text-lg text-admin-text">Shipping Rates by State</h2>
          {!hasRates ? (
            <button type="button" className="admin-btn admin-btn-secondary text-[10px]" disabled={saving || loading} onClick={() => void seedDefaults()}>
              Seed default rates
            </button>
          ) : null}
        </div>
        {loading ? (
          <p className="text-sm text-admin-muted">Loading rates…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-admin-border text-admin-muted">
                  <th className="py-2 pr-4">State</th>
                  <th className="py-2 pr-4">Rate (₦)</th>
                  <th className="py-2 pr-4">Active</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate, index) => (
                  <tr key={rate.id} className="border-b border-admin-border/60">
                    <td className="py-2 pr-4 text-admin-text">{rate.label}</td>
                    <td className="py-2 pr-4">
                      <input
                        className="admin-input !h-9"
                        value={String(rate.rate / 100)}
                        onChange={(e) => {
                          const valueKobo = Math.max(0, Math.round(Number(e.target.value || '0') * 100))
                          setRates((prev) => prev.map((r, i) => (i === index ? { ...r, rate: valueKobo } : r)))
                        }}
                      />
                    </td>
                    <td className="py-2 pr-4">
                      <input
                        type="checkbox"
                        checked={rate.isActive}
                        onChange={(e) => setRates((prev) => prev.map((r, i) => (i === index ? { ...r, isActive: e.target.checked } : r)))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasRates ? (
          <button type="button" className="admin-btn admin-btn-primary mt-4 text-[10px]" disabled={saving} onClick={() => void saveRates()}>
            Save all rates
          </button>
        ) : null}
      </section>

      {message ? <p className="text-sm text-admin-muted">{message}</p> : null}
      {hasRates ? <p className="text-xs text-admin-muted">International and all Nigerian states are stored in kobo and shown in naira (e.g., {formatNgnKobo(150000)}).</p> : null}
    </div>
  )
}
