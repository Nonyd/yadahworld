'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'

const CAMPUSES = [
  { value: 'NSUK', label: 'NSUK — Nasarawa State University' },
  { value: 'UNIABUJA', label: 'UNIABUJA — University of Abuja' },
  { value: 'UNIZIK', label: 'UNIZIK — Nnamdi Azikiwe University' },
  { value: 'FUTMINNA', label: 'FUTMinna — Federal University of Technology Minna' },
  { value: 'UNILAG', label: 'UNILAG — University of Lagos' },
  { value: 'UI', label: 'UI — University of Ibadan' },
  { value: 'OAU', label: 'OAU — Obafemi Awolowo University' },
  { value: 'UNIPORT', label: 'UNIPORT — University of Port Harcourt' },
  { value: 'UNN', label: 'UNN — University of Nigeria Nsukka' },
  { value: 'other', label: 'My university is not listed here' },
]

const ROLES = [
  { value: 'JCCF Leader', label: 'JCCF Leader' },
  { value: 'Fellowship President', label: 'Fellowship President' },
  { value: 'Fellowship Exco', label: 'Fellowship Exco Member' },
  { value: 'Fellowship Secretary', label: 'Fellowship Secretary' },
  { value: 'SUG Officer', label: 'SUG / Student Union Officer' },
  { value: 'Chaplaincy Representative', label: 'Chaplaincy Representative' },
  { value: 'Event Coordinator', label: 'Event Coordinator' },
  { value: 'other', label: 'Other (please specify)' },
]

const schema = z
  .object({
    fullName: z.string().min(2, 'Full name required'),
    whatsapp: z.string().min(7, 'WhatsApp number required'),
    email: z.string().email('Valid email required'),
    campus: z.string().min(1, 'Please select your campus'),
    customCampus: z.string().optional(),
    role: z.string().min(1, 'Please select your role'),
    customRole: z.string().optional(),
    expectations: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.campus === 'other' && !data.customCampus?.trim()) return false
      return true
    },
    { message: 'Please enter your university name', path: ['customCampus'] }
  )
  .refine(
    (data) => {
      if (data.role === 'other' && !data.customRole?.trim()) return false
      return true
    },
    { message: 'Please describe your role', path: ['customRole'] }
  )

type FormData = z.infer<typeof schema>

interface CampusTourModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CampusTourModal({ isOpen, onClose }: CampusTourModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const selectedCampus = watch('campus')
  const selectedRole = watch('role')
  const showCustomCampus = selectedCampus === 'other'
  const showCustomRole = selectedRole === 'other'

  const onSubmit = async (data: FormData) => {
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/campus-tour/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(json.message)
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

  const handleClose = () => {
    if (status !== 'loading') {
      onClose()
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
        reset()
      }, 300)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(13,11,8,0.7)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="fixed inset-x-4 top-[5vh] bottom-[5vh] z-[201] overflow-y-auto md:inset-x-auto md:left-1/2 md:top-[5vh] md:w-full md:max-w-2xl md:-translate-x-1/2"
            style={{ background: 'var(--bg)' }}
          >
            <div
              className="sticky top-0 z-10 flex items-center justify-between border-b px-8 py-6"
              style={{
                background: 'var(--bg)',
                borderColor: 'rgba(139,105,20,0.15)',
              }}
            >
              <div>
                <p className="eyebrow">Campus Tour 2025</p>
                <h2 className="mt-1 font-playfair text-xl font-normal" style={{ color: 'var(--body)' }}>
                  Invite Yadah to Your Campus
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="font-jost text-xs uppercase tracking-widest transition-colors"
                style={{ color: 'var(--muted)' }}
                aria-label="Close"
              >
                Close ×
              </button>
            </div>

            <div className="px-8 py-8">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-16 text-center"
                  >
                    <div
                      className="mx-auto mb-8 flex h-16 w-16 items-center justify-center border"
                      style={{ borderColor: 'var(--gold)' }}
                    >
                      <span className="font-playfair text-2xl" style={{ color: 'var(--gold)' }}>
                        ✓
                      </span>
                    </div>
                    <h2 className="mb-4 font-playfair text-2xl font-normal" style={{ color: 'var(--body)' }}>
                      Application Received.
                    </h2>
                    <p className="body-lg mx-auto mb-8 max-w-sm">
                      Thank you. We will review your application and get back to you on WhatsApp and email as soon as possible. God bless
                      you.
                    </p>
                    <button type="button" onClick={handleClose} className="btn-outline">
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-6"
                  >
                    <p className="body-sm" style={{ color: 'var(--muted)' }}>
                      Fill in your details below to express interest in having Yadah minister at your campus.
                      <span style={{ color: 'var(--accent)' }}>*</span> indicates required fields.
                    </p>

                    <div>
                      <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                        Full Name <span style={{ color: 'var(--accent)' }}>*</span>
                      </label>
                      <input {...register('fullName')} placeholder="Your full name" className="field-input" />
                      {errors.fullName && (
                        <p className="mt-1 font-jost text-xs" style={{ color: 'var(--accent)' }}>
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                        WhatsApp Number <span style={{ color: 'var(--accent)' }}>*</span>
                      </label>
                      <input {...register('whatsapp')} placeholder="+234 800 000 0000" className="field-input" />
                      <p className="mt-1 font-jost text-[10px]" style={{ color: 'var(--muted)', opacity: 0.6 }}>
                        We will reach you on WhatsApp to discuss the details.
                      </p>
                      {errors.whatsapp && (
                        <p className="mt-1 font-jost text-xs" style={{ color: 'var(--accent)' }}>
                          {errors.whatsapp.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                        Email Address <span style={{ color: 'var(--accent)' }}>*</span>
                      </label>
                      <input {...register('email')} type="email" placeholder="your@email.com" className="field-input" />
                      {errors.email && (
                        <p className="mt-1 font-jost text-xs" style={{ color: 'var(--accent)' }}>
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                        Your Campus <span style={{ color: 'var(--accent)' }}>*</span>
                      </label>
                      <select
                        {...register('campus')}
                        className="field-input"
                        style={{
                          cursor: 'pointer',
                          background: 'var(--bg)',
                        }}
                      >
                        <option value="">Select Your Campus</option>
                        {CAMPUSES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      {errors.campus && (
                        <p className="mt-1 font-jost text-xs" style={{ color: 'var(--accent)' }}>
                          {errors.campus.message}
                        </p>
                      )}

                      <AnimatePresence>
                        {showCustomCampus && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4">
                              <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                                Enter Your University Name <span style={{ color: 'var(--accent)' }}>*</span>
                              </label>
                              <input {...register('customCampus')} placeholder="Full university name" className="field-input" />
                              {errors.customCampus && (
                                <p className="mt-1 font-jost text-xs" style={{ color: 'var(--accent)' }}>
                                  {errors.customCampus.message}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                        Your Role in Your School <span style={{ color: 'var(--accent)' }}>*</span>
                      </label>
                      <select
                        {...register('role')}
                        className="field-input"
                        style={{
                          cursor: 'pointer',
                          background: 'var(--bg)',
                        }}
                      >
                        <option value="">Select Your Role</option>
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      {errors.role && (
                        <p className="mt-1 font-jost text-xs" style={{ color: 'var(--accent)' }}>
                          {errors.role.message}
                        </p>
                      )}

                      <AnimatePresence>
                        {showCustomRole && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4">
                              <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                                Describe Your Role <span style={{ color: 'var(--accent)' }}>*</span>
                              </label>
                              <textarea
                                {...register('customRole')}
                                placeholder="Please describe your position or role..."
                                className="field-textarea"
                                rows={3}
                              />
                              {errors.customRole && (
                                <p className="mt-1 font-jost text-xs" style={{ color: 'var(--accent)' }}>
                                  {errors.customRole.message}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
                        What are your expectations?
                      </label>
                      <textarea
                        {...register('expectations')}
                        placeholder="Tell us about your campus fellowship, the event you have in mind, expected attendance, and what you hope God will do..."
                        className="field-textarea"
                        rows={4}
                      />
                    </div>

                    {status === 'error' && (
                      <p className="font-jost text-xs" style={{ color: 'var(--accent)' }}>
                        {message}
                      </p>
                    )}

                    <button type="submit" disabled={status === 'loading'} className="btn-primary self-start">
                      {status === 'loading' ? 'Submitting...' : 'Submit Application'}
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

                    <p className="font-jost text-[10px]" style={{ color: 'var(--muted)', opacity: 0.6 }}>
                      By submitting this form, you agree that Yadah&apos;s management team may contact you via WhatsApp and email
                      regarding your application.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
