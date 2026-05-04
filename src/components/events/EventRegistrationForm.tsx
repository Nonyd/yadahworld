'use client'

import { useState } from 'react'
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
})
type FormData = z.infer<typeof schema>

export default function EventRegistrationForm({
  slug,
  tiers,
  totalCapacity,
  totalSold,
}: {
  slug: string
  tiers: TicketTier[]
  totalCapacity: number | null
  totalSold: number
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [ticketCode, setTicketCode] = useState('')
  const router = useRouter()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tierId: tiers.length === 1 ? tiers[0].id : '',
    },
  })

  const selectedTierId = watch('tierId')
  const selectedTier = tiers.find((t) => t.id === selectedTierId)
  const isFree = selectedTier?.price === 0

  const remaining = totalCapacity !== null ? totalCapacity - totalSold : null

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/events/${slug}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
    <div className="border p-8" style={{ borderColor: 'rgba(139,105,20,0.2)' }}>
      <h2 className="font-playfair text-2xl font-normal mb-2" style={{ color: 'var(--body)' }}>
        Register
      </h2>

      {remaining !== null && remaining <= 20 && remaining > 0 && (
        <p className="ui-label mb-4" style={{ color: 'var(--accent)' }}>
          Only {remaining} spots remaining
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
                View Your Ticket →
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5 mt-6"
          >
            {tiers.length > 1 && (
              <div>
                <label className="ui-label mb-3 block" style={{ color: 'var(--muted)' }}>
                  Select Ticket Type
                </label>
                <div className="flex flex-col gap-2">
                  {tiers.map((tier) => {
                    const tierSoldOut = tier.capacity !== null && tier.sold >= tier.capacity
                    return (
                      <label
                        key={tier.id}
                        className="flex items-center justify-between p-4 cursor-pointer border transition-all"
                        style={{
                          borderColor: selectedTierId === tier.id ? 'var(--accent)' : 'rgba(42,37,32,0.12)',
                          background: selectedTierId === tier.id ? 'rgba(107,39,55,0.04)' : 'transparent',
                          opacity: tierSoldOut ? 0.5 : 1,
                          cursor: tierSoldOut ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            value={tier.id}
                            disabled={tierSoldOut}
                            {...register('tierId')}
                            style={{ accentColor: 'var(--accent)' }}
                          />
                          <div>
                            <p className="font-baskerville text-sm font-bold" style={{ color: 'var(--body)' }}>
                              {tier.name}
                              {tierSoldOut && ' (Sold Out)'}
                            </p>
                            {tier.description && (
                              <p className="font-baskerville text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                                {tier.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <p className="font-playfair text-lg" style={{ color: 'var(--accent)' }}>
                          {tier.price === 0 ? 'Free' : `${tier.currency} ${(tier.price / 100).toLocaleString()}`}
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

            <div>
              <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                Full Name
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
                Email Address
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
                Phone Number
              </label>
              <input {...register('phone')} placeholder="+234 800 000 0000" className="field-input" />
              {errors.phone && (
                <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {selectedTier && (
              <div className="p-4 border-t border-b" style={{ borderColor: 'rgba(42,37,32,0.08)' }}>
                <div className="flex justify-between items-center">
                  <p className="ui-label" style={{ color: 'var(--muted)' }}>
                    {selectedTier.name} × 1
                  </p>
                  <p className="font-playfair text-xl" style={{ color: 'var(--body)' }}>
                    {selectedTier.price === 0 ? 'Free' : `${selectedTier.currency} ${(selectedTier.price / 100).toLocaleString()}`}
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <p className="font-jost text-xs" style={{ color: 'var(--accent)' }}>
                {message}
              </p>
            )}

            <button type="submit" disabled={status === 'loading'} className="btn-primary">
              {status === 'loading'
                ? 'Processing...'
                : isFree
                  ? 'Register — Free'
                  : selectedTier
                    ? `Pay ${selectedTier.currency} ${(selectedTier.price / 100).toLocaleString()} →`
                    : 'Pay →'}
            </button>

            <p className="font-jost text-[10px] text-center" style={{ color: 'var(--muted)', opacity: 0.6 }}>
              {isFree ? 'A QR code ticket will be sent to your email.' : 'You will be redirected to a secure payment page. Ticket sent after payment.'}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
