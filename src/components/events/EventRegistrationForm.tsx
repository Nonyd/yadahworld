'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { TicketTier } from '@prisma/client'

const schema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number required'),
  tierId: z.string().min(1, 'Please select a ticket type'),
  quantity: z.coerce.number().int().min(1).max(10),
  promoCode: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function EventRegistrationForm({
  slug,
  tiers,
  totalCapacity,
  totalSold,
  initialTierId,
  claimToken,
  claimExpired,
}: {
  slug: string
  tiers: TicketTier[]
  totalCapacity: number | null
  totalSold: number
  initialTierId?: string
  claimToken?: string
  claimExpired?: boolean
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')
  const [waitlistMsg, setWaitlistMsg] = useState('')
  const router = useRouter()

  const validInitialTier =
    initialTierId && tiers.some((t) => t.id === initialTierId) ? initialTierId : tiers.length === 1 ? tiers[0]?.id : ''

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tierId: validInitialTier ?? '',
      quantity: 1,
      promoCode: '',
    },
  })

  useEffect(() => {
    if (validInitialTier) setValue('tierId', validInitialTier)
  }, [validInitialTier, setValue])

  const selectedTierId = watch('tierId')
  const quantity = watch('quantity')
  const promoCodeWatch = watch('promoCode')
  const selectedTier = tiers.find((t) => t.id === selectedTierId)
  const isFree = selectedTier ? selectedTier.price === 0 : false

  const remaining = totalCapacity !== null ? totalCapacity - totalSold : null

  const tierSoldOut = (t: TicketTier) => t.capacity !== null && t.sold >= t.capacity
  const spotsLeft =
    selectedTier && selectedTier.capacity !== null ? Math.max(0, selectedTier.capacity - selectedTier.sold) : null

  const subtotal =
    selectedTier && !tierSoldOut(selectedTier) ? selectedTier.price * quantity : 0
  const discount = promoDiscount ?? 0
  const total = Math.max(0, subtotal - discount)

  const applyPromo = async () => {
    if (!selectedTierId || !promoCodeWatch?.trim() || !selectedTier || tierSoldOut(selectedTier)) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch(`/api/events/${slug}/promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCodeWatch.trim(),
          tierId: selectedTierId,
          quantity,
        }),
      })
      const json = (await res.json()) as { discountAmount?: number; error?: string }
      if (!res.ok) {
        setPromoDiscount(null)
        setPromoError(json.error ?? 'Invalid code')
      } else {
        setPromoDiscount(json.discountAmount ?? 0)
      }
    } catch {
      setPromoError('Could not validate code')
      setPromoDiscount(null)
    }
    setPromoLoading(false)
  }

  useEffect(() => {
    setPromoDiscount(null)
    setPromoError('')
  }, [selectedTierId, quantity])

  const joinWaitlist = async () => {
    if (!selectedTier || !tierSoldOut(selectedTier)) return
    const fullName = getValues('fullName')
    const email = getValues('email')
    const phone = getValues('phone')
    if (fullName.length < 2 || !email.includes('@')) {
      setWaitlistMsg('Enter your name and email above first.')
      setWaitlistStatus('err')
      return
    }
    setWaitlistStatus('loading')
    setWaitlistMsg('')
    try {
      const res = await fetch(`/api/events/${slug}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone: phone || undefined,
          tierId: selectedTier.id,
        }),
      })
      const json = (await res.json()) as { error?: string; position?: number; message?: string }
      if (!res.ok) {
        setWaitlistStatus('err')
        setWaitlistMsg(json.error ?? 'Failed')
      } else {
        setWaitlistStatus('ok')
        setWaitlistMsg(json.message ?? `You're #${json.position ?? ''} on the waitlist.`)
      }
    } catch {
      setWaitlistStatus('err')
      setWaitlistMsg('Something went wrong.')
    }
  }

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          tierId: data.tierId,
          quantity: data.quantity,
          promoCode: data.promoCode?.trim() || undefined,
          gateway: 'paystack' as const,
          claimToken: claimToken || undefined,
        }),
      })
      const json = (await res.json()) as {
        paymentUrl?: string
        ticketCode?: string
        message?: string
        error?: string
      }

      if (res.ok) {
        if (json.paymentUrl) {
          window.location.href = json.paymentUrl
        } else {
          setStatus('success')
          setTicketCode(json.ticketCode ?? '')
          setMessage(json.message ?? '')
          setDrawerOpen(false)
        }
      } else {
        setStatus('error')
        setMessage(json.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="border p-8 relative overflow-hidden" style={{ borderColor: 'rgba(139,105,20,0.2)' }}>
      <h2 className="font-playfair text-2xl font-normal mb-2" style={{ color: 'var(--body)' }}>
        Get tickets
      </h2>

      {claimExpired && (
        <p className="ui-label mb-4" style={{ color: 'var(--accent)' }}>
          This waitlist claim link has expired. You can join the waitlist again from a sold-out tier.
        </p>
      )}
      {claimToken && !claimExpired && (
        <p className="ui-label mb-4" style={{ color: 'var(--gold)' }}>
          Complete your registration to claim your waitlist spot.
        </p>
      )}

      {remaining !== null && remaining <= 20 && remaining > 0 && (
        <p className="ui-label mb-4" style={{ color: 'var(--accent)' }}>
          Only {remaining} spots remaining (event total)
        </p>
      )}

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center py-4">
              <div className="w-12 h-12 border mx-auto mb-4 flex items-center justify-center" style={{ borderColor: 'var(--gold)' }}>
                <span className="font-playfair text-xl" style={{ color: 'var(--gold)' }}>
                  ✓
                </span>
              </div>
              <p className="font-playfair italic text-xl mb-3" style={{ color: 'var(--body)' }}>
                Registration successful.
              </p>
              <p className="body-sm mb-6">{message}</p>
              <button type="button" onClick={() => router.push(`/tickets/${ticketCode}`)} className="btn-primary">
                View your ticket →
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit(() => setDrawerOpen(true))}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5 mt-6"
          >
            {tiers.length > 0 && (
              <div>
                <label className="ui-label mb-3 block" style={{ color: 'var(--muted)' }}>
                  Ticket tier
                </label>
                <div className="flex flex-col gap-2">
                  {tiers.map((tier) => {
                    const soldOut = tierSoldOut(tier)
                    return (
                      <label
                        key={tier.id}
                        className="flex items-center justify-between p-4 cursor-pointer border transition-all"
                        style={{
                          borderColor: selectedTierId === tier.id ? 'var(--accent)' : 'rgba(42,37,32,0.12)',
                          background: selectedTierId === tier.id ? 'rgba(107,39,55,0.04)' : 'transparent',
                          opacity: soldOut ? 0.65 : 1,
                          cursor: soldOut ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            value={tier.id}
                            disabled={soldOut}
                            {...register('tierId')}
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          <div>
                            <p className="font-baskerville text-sm font-bold" style={{ color: 'var(--body)' }}>
                              {tier.name}
                              {soldOut && ' (Sold out)'}
                            </p>
                            {tier.description && (
                              <p className="font-baskerville text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                                {tier.description}
                              </p>
                            )}
                            {tier.perks?.length ? (
                              <ul className="font-baskerville text-[11px] mt-1 list-disc pl-4" style={{ color: 'var(--muted)' }}>
                                {tier.perks.map((p) => (
                                  <li key={p}>{p}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        </div>
                        <p className="font-playfair text-lg" style={{ color: 'var(--accent)' }}>
                          {tier.price === 0 ? 'Free' : `₦${(tier.price / 100).toLocaleString()}`}
                        </p>
                      </label>
                    )
                  })}
                </div>
                {errors.tierId && (
                  <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
                    {errors.tierId.message}
                  </p>
                )}
              </div>
            )}

            {selectedTier && tierSoldOut(selectedTier) && (
              <div className="p-4 border" style={{ borderColor: 'rgba(139,105,20,0.25)' }}>
                <p className="font-baskerville text-sm mb-3" style={{ color: 'var(--body)' }}>
                  This tier is sold out. Join the waitlist — we will email you if a place opens.
                </p>
                <button type="button" className="btn-primary w-full" onClick={() => void joinWaitlist()}>
                  {waitlistStatus === 'loading' ? 'Submitting…' : 'Join waitlist'}
                </button>
                {waitlistStatus !== 'idle' && (
                  <p
                    className="font-jost text-xs mt-2"
                    style={{ color: waitlistStatus === 'ok' ? 'var(--gold)' : 'var(--accent)' }}
                  >
                    {waitlistMsg}
                  </p>
                )}
              </div>
            )}

            {selectedTier && !tierSoldOut(selectedTier) && (
              <>
                <div>
                  <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                    Quantity (max 10)
                  </label>
                  <select {...register('quantity')} className="field-input">
                    {Array.from(
                      { length: spotsLeft === null ? 10 : Math.max(1, Math.min(10, spotsLeft)) },
                      (_, i) => i + 1,
                    ).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {spotsLeft !== null && (
                    <p className="font-jost text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
                      {spotsLeft} left at this tier
                    </p>
                  )}
                </div>

                <div>
                  <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                    Promo code (optional)
                  </label>
                  <div className="flex gap-2">
                    <input {...register('promoCode')} placeholder="Code" className="field-input flex-1" />
                    <button type="button" className="btn-primary shrink-0 text-[10px]" disabled={promoLoading} onClick={() => void applyPromo()}>
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
                      {promoError}
                    </p>
                  )}
                  {promoDiscount !== null && promoDiscount > 0 && (
                    <p className="font-jost text-xs mt-1" style={{ color: 'var(--gold)' }}>
                      Discount: ₦{(promoDiscount / 100).toLocaleString()}
                    </p>
                  )}
                </div>

                {!isFree && (
                  <p className="font-jost text-xs" style={{ color: 'var(--muted)' }}>
                    Paid checkout uses Paystack (secure hosted payment).
                  </p>
                )}
              </>
            )}

            <div>
              <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                Full name
              </label>
              <input {...register('fullName')} placeholder="Your full name" className="field-input" />
              {errors.fullName && (
                <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                Email
              </label>
              <input {...register('email')} type="email" placeholder="your@email.com" className="field-input" />
              {errors.email && (
                <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                Phone
              </label>
              <input {...register('phone')} placeholder="+234 …" className="field-input" />
              {errors.phone && (
                <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {selectedTier && !tierSoldOut(selectedTier) && (
              <div className="p-4 border-t border-b" style={{ borderColor: 'rgba(42,37,32,0.08)' }}>
                <div className="flex justify-between items-center">
                  <p className="ui-label" style={{ color: 'var(--muted)' }}>
                    {selectedTier.name} × {quantity}
                  </p>
                  <p className="font-playfair text-xl" style={{ color: 'var(--body)' }}>
                    {isFree ? 'Free' : `₦${(total / 100).toLocaleString()}`}
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <p className="font-jost text-xs" style={{ color: 'var(--accent)' }}>
                {message}
              </p>
            )}

            {selectedTier && !tierSoldOut(selectedTier) && (
              <button type="submit" disabled={status === 'loading'} className="btn-primary">
                {isFree ? 'Register free' : 'Continue to checkout →'}
              </button>
            )}

            <p className="font-jost text-[10px] text-center" style={{ color: 'var(--muted)', opacity: 0.6 }}>
              Tickets are sent by email only. Each ticket has its own QR code.
            </p>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && status !== 'success' && (
          <>
            <motion.button
              type="button"
              aria-label="Close"
              className="fixed inset-0 z-[60] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="fixed z-[70] top-0 right-0 h-full w-full max-w-md shadow-2xl flex flex-col p-8 overflow-y-auto"
              style={{ background: 'var(--bg)', borderLeft: '1px solid rgba(139,105,20,0.2)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="flex justify-between items-start mb-8">
                <h3 className="font-playfair text-xl" style={{ color: 'var(--body)' }}>
                  Checkout
                </h3>
                <button type="button" className="ui-label" onClick={() => setDrawerOpen(false)}>
                  Close
                </button>
              </div>
              <div className="space-y-4 font-baskerville text-sm flex-1" style={{ color: 'var(--body)' }}>
                <p>
                  <span className="ui-label block" style={{ color: 'var(--muted)' }}>
                    Tier
                  </span>
                  {selectedTier?.name}
                </p>
                <p>
                  <span className="ui-label block" style={{ color: 'var(--muted)' }}>
                    Quantity
                  </span>
                  {quantity}
                </p>
                {!isFree && (
                  <>
                    <p>
                      <span className="ui-label block" style={{ color: 'var(--muted)' }}>
                        Subtotal
                      </span>
                      ₦{(subtotal / 100).toLocaleString()}
                    </p>
                    {discount > 0 && (
                      <p>
                        <span className="ui-label block" style={{ color: 'var(--muted)' }}>
                          Discount
                        </span>
                        −₦{(discount / 100).toLocaleString()}
                      </p>
                    )}
                    <p>
                      <span className="ui-label block" style={{ color: 'var(--muted)' }}>
                        Total
                      </span>
                      <span className="font-playfair text-2xl">₦{(total / 100).toLocaleString()}</span>
                    </p>
                    <p>
                      <span className="ui-label block" style={{ color: 'var(--muted)' }}>
                        Pay with
                      </span>
                      Paystack
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                className="btn-primary mt-8 w-full"
                disabled={status === 'loading'}
                onClick={() => void handleSubmit(onSubmit)()}
              >
                {status === 'loading' ? 'Processing…' : isFree ? 'Confirm registration' : 'Pay securely →'}
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
