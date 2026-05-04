'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { step1Schema, step2Schema, step3Schema, bookingFormSchema, type BookingFormValues } from '@/types/booking'
import type { ZodTypeAny } from 'zod'

const stepLabels = ['Contact', 'Organisation', 'Event', 'Confirm']
const steps = ['Contact Info', 'Organization', 'Event Details', 'Confirm']

const stepSchemas: ZodTypeAny[] = [step1Schema, step2Schema, step3Schema]

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="ui-label mb-2 block" style={{ color: 'var(--muted)' }}>
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="font-jost text-xs mt-1" style={{ color: 'var(--accent)' }}>
          {error}
        </p>
      )}
    </div>
  )
}

const defaultValues: Partial<BookingFormValues> & { whatExpected?: string[] } = {
  whatExpected: [],
  website: '',
  additionalInfo: '',
  expectationDetails: '',
}

export default function BookingForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    getValues,
    setError,
    clearErrors,
  } = useForm<BookingFormValues>({
    defaultValues,
    mode: 'onTouched',
  })

  const whatExpected = watch('whatExpected') ?? []
  const othersSelected = whatExpected.includes('Others')

  useEffect(() => {
    if (!othersSelected) {
      setValue('expectationDetails', '')
      clearErrors('expectationDetails')
    }
  }, [othersSelected, setValue, clearErrors])

  const applyZodErrors = (err: { issues: { path: (string | number)[]; message: string }[] }) => {
    for (const issue of err.issues) {
      const key = issue.path[0]
      if (typeof key === 'string') {
        setError(key as keyof BookingFormValues, { type: 'manual', message: issue.message })
      }
    }
  }

  const handleNext = () => {
    clearErrors()
    const raw = getValues()
    const parsed = stepSchemas[currentStep].safeParse(raw)
    if (!parsed.success) {
      applyZodErrors(parsed.error)
      return
    }
    setCurrentStep((s) => s + 1)
  }

  const handleFinalSubmit = async () => {
    clearErrors()
    const raw = getValues()
    const parsed = bookingFormSchema.safeParse(raw)
    if (!parsed.success) {
      applyZodErrors(parsed.error)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (res.ok) setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="py-20">
        <div className="w-12 h-12 border border-[var(--gold)] flex items-center justify-center mb-8">
          <span className="font-playfair text-xl text-[var(--gold)]">✓</span>
        </div>
        <h2 className="display-3 text-[var(--body)] mb-4">Request Received.</h2>
        <p className="body-lg max-w-sm">
          Thank you. Yadah&apos;s management will review your request and be in touch at the soonest possible time. God
          bless you.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex gap-2 mb-12">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex-1 min-w-0">
            <div
              className="h-px mb-2 transition-all duration-700"
              style={{ background: i <= currentStep ? 'var(--accent)' : 'rgba(42,37,32,0.12)' }}
            />
            <p className="ui-label truncate" style={{ color: i <= currentStep ? 'var(--accent)' : 'var(--muted)' }}>
              {String(i + 1).padStart(2, '0')} {label}
            </p>
          </div>
        ))}
      </div>

      <p className="ui-label mb-8" style={{ color: 'var(--muted)' }}>
        Step {currentStep + 1} of {steps.length} — {steps[currentStep]}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.45, ease: [0.77, 0, 0.175, 1] }}
        >
          {currentStep === 0 && (
            <div className="flex flex-col gap-8">
              <Field label="Full Name" required error={errors.fullName?.message}>
                <input {...register('fullName')} placeholder="Your full name" className="field-input" />
              </Field>
              <Field label="Email" required error={errors.email?.message}>
                <input {...register('email')} type="email" placeholder="your@email.com" className="field-input" />
              </Field>
              <Field label="Phone Number" required error={errors.phone?.message}>
                <input {...register('phone')} placeholder="+234 800 000 0000" className="field-input" />
              </Field>
            </div>
          )}

          {currentStep === 1 && (
            <div className="flex flex-col gap-8">
              <Field label="Church / Organization Name" required error={errors.churchName?.message}>
                <input {...register('churchName')} placeholder="Name of your church or organization" className="field-input" />
              </Field>
              <Field label="Website" error={errors.website?.message}>
                <input {...register('website')} placeholder="https://yourwebsite.com" className="field-input" />
              </Field>
              <Field label="Address" required error={errors.streetAddress?.message}>
                <input {...register('streetAddress')} placeholder="Street Address" className="field-input" />
              </Field>
              <div className="grid grid-cols-2 gap-6">
                <Field label="City" required error={errors.city?.message}>
                  <input {...register('city')} placeholder="City" className="field-input" />
                </Field>
                <Field label="State / Province" required error={errors.state?.message}>
                  <input {...register('state')} placeholder="State" className="field-input" />
                </Field>
              </div>
              <Field label="Country" required error={errors.country?.message}>
                <input {...register('country')} placeholder="Nigeria" className="field-input" />
              </Field>
              <Field label="Organization Phone" required error={errors.orgPhone?.message}>
                <input {...register('orgPhone')} placeholder="+234 800 000 0000" className="field-input" />
              </Field>
              <Field label="Organization Email" required error={errors.orgEmail?.message}>
                <input {...register('orgEmail')} type="email" placeholder="office@organization.org" className="field-input" />
              </Field>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col gap-8">
              <Field label="Event Name & Theme" required error={errors.eventName?.message}>
                <input {...register('eventName')} placeholder="e.g. Glory Conference 2025" className="field-input" />
              </Field>
              <Field label="Nature of Event" required error={errors.natureOfEvent?.message}>
                <input {...register('natureOfEvent')} placeholder="Concert, Worship Meeting, Church Conference…" className="field-input" />
              </Field>
              <Field label="What is Expected From Yadah" required error={errors.whatExpected?.message as string | undefined}>
                <div className="flex flex-col gap-3">
                  {['Music Ministration', 'Public Speaking', 'Public Appearance', 'Others'].map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        value={opt}
                        {...register('whatExpected')}
                        className="w-4 h-4 accent-[var(--accent)] border border-[rgba(42,37,32,0.25)] cursor-pointer"
                      />
                      <span className="font-jost text-sm text-[var(--muted)] group-hover:text-[var(--body)] transition-colors">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>
              {othersSelected && (
                <Field label="Describe What is Expected" required error={errors.expectationDetails?.message}>
                  <textarea {...register('expectationDetails')} rows={4} placeholder="Please describe in detail…" className="field-textarea" />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-6">
                <Field label="Date of Event" required error={errors.eventDate?.message}>
                  <input type="date" {...register('eventDate')} className="field-input" />
                </Field>
                <Field label="Time of Event" required error={errors.eventTime?.message}>
                  <input type="time" {...register('eventTime')} className="field-input" />
                </Field>
              </div>
              <Field label="Event Address" required error={errors.eventAddress?.message}>
                <input {...register('eventAddress')} placeholder="Street Address" className="field-input" />
              </Field>
              <div className="grid grid-cols-2 gap-6">
                <Field label="City" required error={errors.eventCity?.message}>
                  <input {...register('eventCity')} placeholder="City" className="field-input" />
                </Field>
                <Field label="State" required error={errors.eventState?.message}>
                  <input {...register('eventState')} placeholder="State" className="field-input" />
                </Field>
              </div>
              <Field label="Country" required error={errors.eventCountry?.message}>
                <input {...register('eventCountry')} placeholder="Nigeria" className="field-input" />
              </Field>
              <Field label="Additional Information" error={errors.additionalInfo?.message}>
                <textarea {...register('additionalInfo')} rows={3} placeholder="Any other details about the event…" className="field-textarea" />
              </Field>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <div className="border p-6 mb-8" style={{ borderColor: 'rgba(42,37,32,0.12)', background: 'rgba(237,232,223,0.5)' }}>
                <p className="ui-label mb-4" style={{ color: 'var(--muted)' }}>
                  Please Note
                </p>
                <p className="body-sm" style={{ color: 'var(--body)' }}>
                  This form is used by Yadah&apos;s Management for scheduling purposes only and does NOT confirm an event.
                  We will get back to you at the soonest time possible after reviewing your request.
                </p>
              </div>

              <button type="button" onClick={() => void handleFinalSubmit()} disabled={loading} className="btn-primary mt-2">
                {loading ? 'Submitting…' : 'Submit Booking Request'}
                {!loading && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-6 mt-10 flex-wrap">
        {currentStep > 0 && currentStep < 3 && (
          <button type="button" onClick={() => setCurrentStep((s) => s - 1)} className="btn-ghost">
            ← Back
          </button>
        )}
        {currentStep < 3 && (
          <button type="button" onClick={handleNext} className="btn-outline">
            Continue
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
