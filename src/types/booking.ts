import { z } from 'zod'

export const step1Schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number required'),
})

export const step2Schema = z.object({
  churchName: z.string().min(2, 'Church/Organization name required'),
  website: z.union([z.literal(''), z.string().url('Enter a valid URL')]),
  streetAddress: z.string().min(5, 'Address required'),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  orgPhone: z.string().min(7),
  orgEmail: z.string().email(),
})

const step3Fields = z.object({
  eventName: z.string().min(2, 'Event name required'),
  natureOfEvent: z.string().min(2, 'Nature of event required'),
  whatExpected: z.array(z.string()).min(1, 'Select at least one'),
  expectationDetails: z.string().default(''),
  eventDate: z.string().min(1, 'Event date required'),
  eventTime: z.string().min(1, 'Event time required'),
  eventAddress: z.string().min(5),
  eventCity: z.string().min(2),
  eventState: z.string().min(2),
  eventCountry: z.string().min(2),
  additionalInfo: z.string().optional(),
})

function refineExpectationWhenOthers<T extends { whatExpected: string[]; expectationDetails: string }>(
  data: T,
  ctx: z.RefinementCtx
) {
  if (data.whatExpected.includes('Others')) {
    const detail = (data.expectationDetails ?? '').trim()
    if (detail.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please describe what is expected when selecting Others',
        path: ['expectationDetails'],
      })
    }
  }
}

export const step3Schema = step3Fields.superRefine(refineExpectationWhenOthers)

export const bookingFormSchema = step1Schema.merge(step2Schema).merge(step3Fields).superRefine(refineExpectationWhenOthers)
  .superRefine((data, ctx) => {
    const eventDate = new Date(`${data.eventDate}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (Number.isNaN(eventDate.getTime()) || eventDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Event date must be today or in the future',
        path: ['eventDate'],
      })
    }
  })

export type BookingFormValues = z.infer<typeof bookingFormSchema>
