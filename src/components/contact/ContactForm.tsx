'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { getCopyString, type SiteCopy } from '@/lib/site-copy'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(2, 'Subject required'),
  message: z.string().min(10, 'Message required'),
})
type FormData = z.infer<typeof schema>

export default function ContactForm({
  copy,
  subjectPlaceholder,
  submitLabel,
  simpleSubmit,
}: {
  copy: SiteCopy
  subjectPlaceholder?: string
  submitLabel?: string
  simpleSubmit?: boolean
}) {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const f = (k: string) => getCopyString(copy, `contactForm.${k}`)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
        <p className="font-playfair text-2xl italic text-[var(--body)] mb-4">{f('successTitle')}</p>
        <p className="body-sm">{f('successBody')}</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {(
        [
          { id: 'name' as const, label: f('nameLabel'), type: 'text', placeholder: f('namePh') },
          { id: 'email' as const, label: f('emailLabel'), type: 'email', placeholder: f('emailPh') },
          {
            id: 'subject' as const,
            label: f('subjectLabel'),
            type: 'text',
            placeholder: subjectPlaceholder ?? f('subjectPh'),
          },
        ] as const
      ).map(({ id, label, type, placeholder }) => (
        <div key={id}>
          <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
            {label}
          </label>
          <input {...register(id)} type={type} placeholder={placeholder} className="field-input" />
          {errors[id] && (
            <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
              {errors[id]?.message}
            </p>
          )}
        </div>
      ))}
      <div>
        <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
          {f('messageLabel')}
        </label>
        <textarea {...register('message')} placeholder={f('messagePh')} className="field-textarea" />
        {errors.message && (
          <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
            {errors.message.message}
          </p>
        )}
      </div>
      <button type="submit" disabled={loading} className="btn-primary self-start">
        {loading ? f('sending') : submitLabel ?? f('submit')}
        {!simpleSubmit && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </form>
  )
}
