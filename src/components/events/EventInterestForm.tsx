'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'

const schema = z.object({
  name: z.string().min(1, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
})
type FormData = z.infer<typeof schema>

export default function EventInterestForm({
  slug,
  eventTitle,
  interestCount,
}: {
  slug: string
  eventTitle: string
  interestCount: number
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/events/${slug}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = (await res.json()) as { message?: string; error?: string }
      if (res.ok) {
        setStatus('success')
        setMessage(json.message ?? '')
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
      <span
        className="ui-label px-3 py-1 mb-6 inline-block"
        style={{
          background: 'rgba(139,105,20,0.1)',
          color: 'var(--gold)',
        }}
      >
        Coming Soon
      </span>

      <h2 className="font-playfair text-2xl font-normal mb-3" style={{ color: 'var(--body)' }}>
        Be the first to know.
      </h2>
      <p className="body-sm mb-8">
        Registration for <em>{eventTitle}</em> is not yet open. Enter your details below and we will notify you as soon as it does.
      </p>

      {interestCount > 0 && (
        <p className="ui-label mb-6" style={{ color: 'var(--gold)' }}>
          {interestCount} {interestCount === 1 ? 'person is' : 'people are'} interested
        </p>
      )}

      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div key="success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-playfair italic text-xl mb-2" style={{ color: 'var(--accent)' }}>
              You are on the list.
            </p>
            <p className="body-sm">{message}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            <div>
              <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                Your Name
              </label>
              <input {...register('name')} placeholder="Full name" className="field-input" />
              {errors.name && (
                <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
                  {errors.name.message}
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
            {status === 'error' && (
              <p className="font-jost text-xs" style={{ color: 'var(--accent)' }}>
                {message}
              </p>
            )}
            <button type="submit" disabled={status === 'loading'} className="btn-primary self-start">
              {status === 'loading' ? 'Submitting...' : 'Notify Me'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
