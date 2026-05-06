'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from '@/components/shop/CartProvider'
import { formatNgnKobo } from '@/lib/shop-money'
import { NIGERIAN_STATES, defaultEstimatedShippingKobo } from '@/lib/shop-shipping'

type Step = 1 | 2 | 3

export default function ShopCheckoutClient({
  paystackPk,
  flutterwavePk,
  payazaPk,
}: {
  paystackPk: string | null
  flutterwavePk: string | null
  payazaPk: string | null
}) {
  const { cart, cartTotal, clearCart } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const needsShip = useMemo(() => cart.some((i) => i.requiresShipping === true), [cart])

  const [step, setStep] = useState<Step>(1)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('Nigeria')
  const [zip, setZip] = useState('')
  const [shippingFee, setShippingFee] = useState(defaultEstimatedShippingKobo(needsShip))
  const [shippingLabel, setShippingLabel] = useState('Shipping')

  const countries = useMemo(() => {
    try {
      if (
        typeof Intl === 'undefined' ||
        typeof (Intl as Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf !== 'function'
      ) {
        return ['Nigeria']
      }
      const list = (Intl as Intl & { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('region')
      const dn = new Intl.DisplayNames(['en'], { type: 'region' })
      const names = list.map((code) => dn.of(code)).filter((v): v is string => Boolean(v))
      return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
    } catch {
      return ['Nigeria']
    }
  }, [])

  const total = cartTotal + shippingFee

  const linesPayload = useMemo(
    () =>
      cart.map((c) => ({
        productId: c.productId,
        variantId: c.variantId ?? null,
        quantity: c.quantity,
      })),
    [cart],
  )

  useEffect(() => {
    if (!needsShip) {
      setShippingFee(0)
      setShippingLabel('Digital delivery')
      return
    }
    setShippingFee(defaultEstimatedShippingKobo(true))
    setShippingLabel('Shipping')
  }, [needsShip])

  useEffect(() => {
    if (!needsShip) return
    if (!country.trim()) return
    if (country === 'Nigeria' && !state.trim()) return

    void fetch('/api/shipping/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, country, subtotal: cartTotal, requiresShipping: needsShip }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { rate?: number; label?: string; isFree?: boolean }
        if (!res.ok || typeof data.rate !== 'number') return
        setShippingFee(data.rate)
        setShippingLabel(data.isFree ? 'Free shipping' : (data.label ?? 'Shipping'))
      })
      .catch(() => null)
  }, [needsShip, state, country, cartTotal])

  useEffect(() => {
    const gw = searchParams.get('gw')
    const ref = searchParams.get('ref') || searchParams.get('reference') || searchParams.get('trxref')
    if (!gw || !ref) return
    setBusy(true)
    setErr('')
    const path =
      gw === 'paystack'
        ? '/api/shop/checkout/verify-paystack'
        : gw === 'flutterwave'
          ? '/api/shop/checkout/verify-flutterwave'
          : '/api/shop/checkout/verify-payaza'
    const body =
      gw === 'flutterwave'
        ? JSON.stringify({ txRef: ref })
        : gw === 'payaza'
          ? JSON.stringify({ reference: ref })
          : JSON.stringify({ reference: ref })
    void fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { orderNumber?: string; error?: string }
        if (!res.ok) throw new Error(data.error || 'Verification failed')
        if (data.orderNumber) {
          clearCart()
          router.replace(`/shop/order-confirmed/${encodeURIComponent(data.orderNumber)}`)
        }
      })
      .catch((e) => setErr(e instanceof Error ? e.message : 'Verification failed'))
      .finally(() => setBusy(false))
  }, [searchParams, clearCart, router])

  const goPaystack = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/shop/checkout/paystack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: linesPayload,
          customer: { name, email, phone: phone || null },
          shippingAddress:
            needsShip
              ? { name, phone: phone || null, street, city, state, country, zip: zip || null }
              : null,
          shippingFee,
        }),
      })
      const data = (await res.json()) as { authorizationUrl?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not start Paystack')
      if (data.authorizationUrl) window.location.href = data.authorizationUrl
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Payment error')
    } finally {
      setBusy(false)
    }
  }

  const goFlutterwave = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/shop/checkout/flutterwave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: linesPayload,
          customer: { name, email, phone: phone || null },
          shippingAddress:
            needsShip
              ? { name, phone: phone || null, street, city, state, country, zip: zip || null }
              : null,
          shippingFee,
        }),
      })
      const data = (await res.json()) as { paymentLink?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Could not start Flutterwave')
      if (data.paymentLink) window.location.href = data.paymentLink
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Payment error')
    } finally {
      setBusy(false)
    }
  }

  const goPayaza = async () => {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/shop/checkout/payaza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines: linesPayload,
          customer: { name, email, phone: phone || null },
          shippingAddress:
            needsShip ? { name, phone: phone || null, street, city, state, country, zip: zip || null } : null,
          shippingFee,
        }),
      })
      const data = (await res.json()) as { paymentUrl?: string; error?: string }
      if (!res.ok) throw new Error(data.error || 'Payaza unavailable')
      if (data.paymentUrl) window.location.href = data.paymentUrl
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Payment error')
    } finally {
      setBusy(false)
    }
  }

  if (!cart.length) {
    return (
      <div className="max-w-lg">
        <p className="body-lg mb-6 text-muted">Your cart is empty.</p>
        <Link href="/shop" className="btn-outline inline-flex">
          Back to shop
        </Link>
      </div>
    )
  }

  const nextFromStep1 = () => {
    if (name.trim().length < 2 || !email.includes('@')) {
      setErr('Enter your name and a valid email.')
      return
    }
    setErr('')
    if (needsShip) setStep(2)
    else setStep(3)
  }

  const nextFromStep2 = () => {
    if (!street.trim() || !city.trim() || !state.trim() || !country.trim()) {
      setErr('Complete your shipping address.')
      return
    }
    setErr('')
    setStep(3)
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:items-start">
      <div>
        <div className="mb-10 flex flex-wrap gap-4 font-jost text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          <span className={step === 1 ? 'text-accent' : ''}>1 · Details</span>
          <span aria-hidden>/</span>
          <span className={needsShip && step === 2 ? 'text-accent' : !needsShip ? 'opacity-40' : ''}>2 · Shipping</span>
          <span aria-hidden>/</span>
          <span className={step === 3 ? 'text-accent' : ''}>3 · Payment</span>
        </div>

        {step === 1 && (
          <div className="max-w-xl space-y-4">
            <div>
              <label className="ui-label mb-2 block">Full name</label>
              <input className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="ui-label mb-2 block">Email</label>
              <input type="email" className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="ui-label mb-2 block">Phone (optional)</label>
              <input className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button type="button" className="btn-primary mt-4" onClick={nextFromStep1}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && needsShip && (
          <div className="max-w-xl space-y-4">
            <div>
              <label className="ui-label mb-2 block">Street address</label>
              <input className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={street} onChange={(e) => setStreet(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="ui-label mb-2 block">City</label>
                <input className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="ui-label mb-2 block">State</label>
                {country === 'Nigeria' ? (
                  <select className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={state} onChange={(e) => setState(e.target.value)}>
                    <option value="">Select a state</option>
                    {NIGERIAN_STATES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={state} onChange={(e) => setState(e.target.value)} />
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="ui-label mb-2 block">Country</label>
                <select className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={country} onChange={(e) => setCountry(e.target.value)}>
                  {!countries.includes('Nigeria') ? <option value="Nigeria">Nigeria</option> : null}
                  {countries.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ui-label mb-2 block">Postal code (optional)</label>
                <input className="w-full border border-[rgba(42,37,32,0.12)] bg-transparent px-4 py-3 font-jost text-sm" value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-outline" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="button" className="btn-primary" onClick={nextFromStep2}>
                Continue to payment
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-xl">
            <p className="body-sm mb-6 text-muted">Choose a payment method. You will be redirected to complete payment securely.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" disabled={busy || !paystackPk} className="btn-primary disabled:opacity-40" onClick={() => void goPaystack()}>
                Pay with Paystack
              </button>
              <button type="button" disabled={busy || !flutterwavePk} className="btn-outline disabled:opacity-40" onClick={() => void goFlutterwave()}>
                Pay with Flutterwave
              </button>
              <button type="button" disabled={busy || !payazaPk} className="btn-outline disabled:opacity-40" onClick={() => void goPayaza()}>
                Pay with Payaza
              </button>
            </div>
            {!paystackPk && <p className="mt-2 text-xs text-muted">Paystack public key missing in env or site settings.</p>}
            {!flutterwavePk && <p className="mt-1 text-xs text-muted">Flutterwave public key missing.</p>}
            {!payazaPk && <p className="mt-1 text-xs text-muted">Payaza public key missing in env or site settings.</p>}
            <button type="button" className="btn-ghost mt-8 text-sm" onClick={() => setStep(needsShip ? 2 : 1)}>
              Back
            </button>
          </div>
        )}

        {err && <p className="mt-6 text-sm text-accent">{err}</p>}
        {busy && <p className="mt-4 body-sm text-muted">Processing…</p>}
      </div>

      <aside className="border manuscript-frame border-[rgba(42,37,32,0.1)] bg-surface/40 p-6">
        <p className="eyebrow mb-4">Order summary</p>
        <ul className="mb-4 space-y-2 font-jost text-sm text-body">
          {cart.map((c) => (
            <li key={`${c.productId}-${c.variantId ?? ''}`} className="flex justify-between gap-2">
              <span className="min-w-0 truncate text-muted">
                {c.name} ×{c.quantity}
              </span>
              <span className="shrink-0">{formatNgnKobo(c.price * c.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-[rgba(42,37,32,0.08)] pt-4 font-jost text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatNgnKobo(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{shippingFee <= 0 ? 'Free' : formatNgnKobo(shippingFee)}</span>
          </div>
          <p className="text-xs text-muted">{!needsShip ? 'Digital delivery — no shipping required' : shippingLabel}</p>
          <div className="flex justify-between font-playfair text-lg text-body">
            <span>Total</span>
            <span className="text-accent">{formatNgnKobo(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  )
}
