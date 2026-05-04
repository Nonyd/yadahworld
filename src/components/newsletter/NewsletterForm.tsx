'use client'

import type { CSSProperties } from 'react'
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

interface NewsletterFormProps {
  theme?: 'dark' | 'light'
}

export default function NewsletterForm({ theme = 'dark' }: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source: 'footer' }),
      })
      const json = (await res.json()) as { message?: string; error?: string }
      if (res.ok) {
        setStatus('success')
        reset()
      } else {
        setStatus('error')
        setMessage(json.error ?? 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const isDark = theme === 'dark'
  const inputStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${isDark ? 'rgba(253,250,245,0.2)' : 'rgba(42,37,32,0.2)'}`,
    color: isDark ? '#FDFAF5' : 'var(--body)',
    padding: '8px 0',
    fontFamily: 'var(--font-baskerville)',
    fontSize: '0.9375rem',
    outline: 'none',
    width: '100%',
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            key="success"
          >
            <p
              className="font-playfair italic text-xl"
              style={{ color: isDark ? '#C9A84C' : 'var(--gold)' }}
            >
              You are subscribed.
            </p>
            <p
              className="font-jost text-xs tracking-widest uppercase mt-2"
              style={{ color: isDark ? 'rgba(253,250,245,0.4)' : 'var(--muted)' }}
            >
              God bless you. Check your inbox.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ marginBottom: '16px' }}>
              <input {...register('name')} placeholder="Your name" style={inputStyle} autoComplete="name" />
              {errors.name && (
                <p
                  style={{
                    color: '#A03848',
                    fontSize: '11px',
                    fontFamily: 'var(--font-jost)',
                    marginTop: '4px',
                    letterSpacing: '0.1em',
                  }}
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input
                {...register('email')}
                type="email"
                placeholder="Your email address"
                style={inputStyle}
                autoComplete="email"
              />
              {errors.email && (
                <p
                  style={{
                    color: '#A03848',
                    fontSize: '11px',
                    fontFamily: 'var(--font-jost)',
                    marginTop: '4px',
                    letterSpacing: '0.1em',
                  }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {status === 'error' && (
              <p
                style={{
                  color: '#A03848',
                  fontSize: '11px',
                  fontFamily: 'var(--font-jost)',
                  letterSpacing: '0.1em',
                  marginBottom: '12px',
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                fontFamily: 'var(--font-jost)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'all 0.3s',
              }}
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              {status !== 'loading' && (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path
                    d="M1 7h12M7 1l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
