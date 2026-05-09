'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Order, OrderItem, Product, ProductVariant, ShopPaymentStatus } from '@prisma/client'
import { formatNgnKobo } from '@/lib/shop-money'
import DeleteOrderButton from '@/components/admin/shop/DeleteOrderButton'

type Item = OrderItem & { product: Pick<Product, 'images'>; variant: ProductVariant | null }
type OrderFull = Order & { items: Item[] }

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const

export default function OrderDetailForm({ initial }: { initial: OrderFull }) {
  const router = useRouter()
  const [status, setStatus] = useState(initial.status)
  const [trackingNumber, setTrackingNumber] = useState(initial.trackingNumber ?? '')
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [sendEmail, setSendEmail] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    setStatus(initial.status)
    setTrackingNumber(initial.trackingNumber ?? '')
    setNotes(initial.notes ?? '')
  }, [initial.id, initial.updatedAt, initial.status, initial.trackingNumber, initial.notes])

  const history = (initial.statusHistory as { status: string; at: string; note?: string }[] | null) ?? []
  const shipping = (initial.shippingAddress as Record<string, string> | null) ?? null

  const onSave = async () => {
    setSaving(true)
    setErr('')
    try {
      const res = await fetch(`/api/admin/orders/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber.trim() || null,
          notes: notes.trim() || null,
          sendStatusEmail: sendEmail,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Save failed')
      }
      setSendEmail(false)
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        <section className="admin-card p-6">
          <h2 className="font-playfair text-lg text-admin-text">Order</h2>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-admin-muted">Number</dt>
              <dd className="font-mono text-admin-text">{initial.orderNumber}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-admin-muted">Date</dt>
              <dd className="text-admin-text">{initial.createdAt.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-admin-muted">Payment</dt>
              <dd className="text-admin-text">
                {(initial.paymentGateway ?? '—') + ' · ' + (initial.paymentStatus as ShopPaymentStatus)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="admin-card p-6">
          <h2 className="font-playfair text-lg text-admin-text">Customer</h2>
          <p className="mt-2 text-sm text-admin-text">{initial.customerName}</p>
          <p className="text-sm text-admin-muted">{initial.customerEmail}</p>
          {initial.customerPhone && <p className="text-sm text-admin-muted">{initial.customerPhone}</p>}
          {shipping ? (
            <div className="mt-4 text-sm text-admin-muted">
              <p className="font-medium text-admin-text">Shipping details</p>
              <p className="mt-1 text-admin-muted">{shipping.name || initial.customerName}</p>
              <p className="text-admin-muted">{shipping.street}</p>
              <p className="text-admin-muted">
                {shipping.city}, {shipping.state} {shipping.zip ?? ''}
              </p>
              <p className="text-admin-muted">{shipping.country}</p>
              {shipping.phone ? <p className="text-admin-muted">{shipping.phone}</p> : null}
            </div>
          ) : (
            <div className="mt-4 text-sm text-admin-muted">Digital order — no shipping address.</div>
          )}
        </section>

        <section className="admin-card p-6">
          <h2 className="font-playfair text-lg text-admin-text">Items</h2>
          <ul className="mt-4 space-y-4">
            {initial.items.map((it) => (
              <li key={it.id} className="flex gap-4 border-b border-admin-border/60 pb-4 last:border-0">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border border-admin-border bg-admin-bg">
                  {it.product.images[0] ? <Image src={it.product.images[0]} alt="" fill className="object-cover" sizes="56px" /> : null}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium text-admin-text">{it.name}</p>
                  {it.variantLabel && <p className="text-admin-muted">{it.variantLabel}</p>}
                  <p className="text-admin-muted">
                    {formatNgnKobo(it.price)} × {it.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm text-admin-text">{formatNgnKobo(it.price * it.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-admin-muted">
              <span>Subtotal</span>
              <span>{formatNgnKobo(initial.subtotal)}</span>
            </div>
            <div className="flex justify-between text-admin-muted">
              <span>Shipping</span>
              <span>{formatNgnKobo(initial.shippingFee)}</span>
            </div>
            <div className="flex justify-between font-medium text-admin-text">
              <span>Total</span>
              <span>{formatNgnKobo(initial.total)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="admin-card p-6">
          <h2 className="font-playfair text-lg text-admin-text">Fulfillment</h2>
          <label className="admin-label mt-4">Order status</label>
          <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value as (typeof ORDER_STATUSES)[number])}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {status === 'SHIPPED' && (
            <>
              <label className="admin-label mt-4">Tracking number</label>
              <input className="admin-input" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Carrier tracking" />
            </>
          )}
          <label className="admin-label mt-4">Internal notes</label>
          <textarea className="admin-input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <label className="mt-4 flex items-center gap-2 text-sm text-admin-text">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="h-4 w-4 rounded border-admin-border" />
            Send status update email to customer
          </label>
          {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
          <button type="button" disabled={saving} className="admin-btn admin-btn-primary mt-4 w-full text-[10px]" onClick={() => void onSave()}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <DeleteOrderButton
            id={initial.id}
            orderNumber={initial.orderNumber}
            variant="block"
            disabled={saving}
            redirectAfterDelete="/admin/orders"
          />
        </section>

        <section className="admin-card p-6">
          <h2 className="font-playfair text-lg text-admin-text">Timeline</h2>
          <ul className="mt-3 space-y-2 text-xs text-admin-muted">
            {history.length === 0 ? <li>No status changes logged yet.</li> : null}
            {[...history].reverse().map((h, i) => (
              <li key={`${h.at}-${i}`}>
                <span className="font-medium text-admin-text">{h.status}</span> — {new Date(h.at).toLocaleString()}
                {h.note ? <span className="block text-[10px]">{h.note}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
