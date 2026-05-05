# Cursor Prompt — yadahworld.com Sophisticated Event Management System

Upgrade the existing event system into a full-featured event management platform. Follow every instruction exactly.

---

## Overview

Features required:
- Ticket tiers (Free, Regular, VIP) with capacity limits per tier
- Discount / promo codes
- QR code tickets (generated and emailed)
- QR code check-in at door (admin scan interface)
- Waitlist when sold out
- Recurring events
- Email-only ticket delivery

---

## 1. Prisma Schema Changes

Update/add the following models in `prisma/schema.prisma`:

```prisma
model Event {
  id               String              @id @default(cuid())
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt
  title            String
  slug             String              @unique
  description      String?
  bodyHtml         String?             // rich text body
  bannerImage      String?
  thumbnailImage   String?
  location         String
  venueName        String?
  venueAddress     String?
  onlineLink       String?             // for online events
  isOnline         Boolean            @default(false)
  startDate        DateTime
  endDate          DateTime?
  doorsOpen        DateTime?
  timezone         String             @default("Africa/Lagos")
  isPublished      Boolean            @default(false)
  isFeatured       Boolean            @default(false)
  isRecurring      Boolean            @default(false)
  recurringPattern Json?              // { frequency: "weekly"|"monthly", endDate, daysOfWeek }
  maxCapacity      Int?               // total event capacity
  tiers            TicketTier[]
  registrations    EventRegistration[]
  promoCodes       PromoCode[]
  interests        EventInterest[]
  speakers         EventSpeaker[]
}

model TicketTier {
  id            String              @id @default(cuid())
  eventId       String
  event         Event               @relation(fields: [eventId], references: [id], onDelete: Cascade)
  name          String              // "Free", "Regular", "VIP"
  description   String?
  price         Int                 @default(0) // 0 for free
  capacity      Int?                // null = unlimited
  sold          Int                 @default(0)
  isActive      Boolean             @default(true)
  salesStart    DateTime?
  salesEnd      DateTime?
  perks         String[]            // list of perks for this tier
  registrations EventRegistration[]
  order         Int                 @default(0) // display order
}

model EventRegistration {
  id            String             @id @default(cuid())
  createdAt     DateTime           @default(now())
  eventId       String
  event         Event              @relation(fields: [eventId], references: [id], onDelete: Cascade)
  tierId        String
  tier          TicketTier         @relation(fields: [tierId], references: [id])
  ticketCode    String             @unique // QR code value
  name          String
  email         String
  phone         String?
  quantity      Int                @default(1)
  totalPaid     Int                @default(0)
  status        RegistrationStatus @default(PENDING)
  paymentRef    String?
  paymentGateway String?
  promoCode     String?
  discountAmount Int               @default(0)
  checkedIn     Boolean            @default(false)
  checkedInAt   DateTime?
  checkedInBy   String?
  isWaitlisted  Boolean            @default(false)
  waitlistPos   Int?
  notes         String?
}

enum RegistrationStatus {
  PENDING
  PAID
  FREE
  CANCELLED
  WAITLISTED
  REFUNDED
}

model PromoCode {
  id            String    @id @default(cuid())
  createdAt     DateTime  @default(now())
  eventId       String
  event         Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  code          String
  discountType  DiscountType @default(PERCENTAGE)
  discountValue Int          // percentage (e.g. 20 = 20%) or fixed amount in kobo
  maxUses       Int?
  usedCount     Int       @default(0)
  expiresAt     DateTime?
  isActive      Boolean   @default(true)

  @@unique([eventId, code])
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

// Keep existing EventInterest, EventSpeaker models
```

Run `prisma db push` after schema changes.

---

## 2. Public Event Pages

### `src/app/(site)/events/page.tsx` (update)
- Show upcoming events with banner image, title, date, location, ticket tiers preview
- Show "Sold Out" badge if all tiers at capacity
- Show "Free" badge if all tiers are free
- Past events section below

### `src/app/(site)/events/[slug]/page.tsx` (update)
Full event detail page:
- Hero banner image
- Event title, date/time, location (with Google Maps link if address provided)
- Online event: show "Online Event" badge + link (visible after registration)
- Rich text description
- Speakers section (if any)
- Ticket tiers section:
  - Each tier: name, price, description, perks list, capacity remaining
  - "Sold Out" state per tier
  - "Join Waitlist" button for sold-out tiers
  - Quantity selector per tier (max 10 per order)
  - Promo code input field
  - Total calculation
  - "Get Tickets" / "Register Free" button
- Registration modal (slides in):
  - Name, email, phone fields
  - Selected tier + quantity summary
  - Promo code applied summary
  - Payment method selection (Paystack / Flutterwave for paid tiers)
  - Submit → payment → ticket email

---

## 3. Event Registration API

### `src/app/api/events/[slug]/register/route.ts` (update)
- Validate tier availability and capacity
- Apply promo code discount
- For free tiers: create registration immediately, send ticket email
- For paid tiers: initialize payment, return payment URL
- Handle quantity (multiple tickets per registration)
- Generate unique `ticketCode` per registration (UUID)

### `src/app/api/events/[slug]/verify-payment/route.ts` (update)
- Verify payment with gateway
- On success: update registration status, increment tier `sold` count, send ticket email with QR code

### `src/app/api/events/[slug]/waitlist/route.ts` (new)
- POST: Add to waitlist when tier is sold out
- Store name, email, tier, position
- Send waitlist confirmation email

### `src/app/api/events/[slug]/promo/route.ts` (new)
- POST: Validate promo code for event
- Return discount details or error

---

## 4. QR Code Ticket Email

Update `src/lib/ticket-email.ts`:
- Generate QR code image using `qrcode` npm package
- QR code value: `ticketCode` (unique per registration)
- Embed QR code as base64 inline image in email
- Show: event name, date, location, tier name, attendee name, ticket code, QR code image
- For multiple tickets in one registration: show each ticket with its own QR

Install: `npm install qrcode @types/qrcode`

---

## 5. QR Check-in Admin Interface

### `src/app/admin/(shell)/events/[id]/checkin/page.tsx` (update)
Full check-in interface:
- Camera QR scanner using device camera (`react-qr-scanner` or `html5-qrcode`)
- On scan: POST to `/api/admin/events/checkin` with scanned code
- Show result:
  - ✅ Green: Valid ticket — show attendee name, tier, check-in time
  - ⚠️ Yellow: Already checked in — show when they checked in
  - ❌ Red: Invalid ticket or wrong event
- Manual entry fallback: type ticket code manually
- Live stats: total registered, checked in, remaining
- List of checked-in attendees below scanner

### `src/app/api/admin/events/checkin/route.ts` (update)
- POST: Validate ticket code against event
- Mark as checked in with timestamp
- Return attendee details

---

## 6. Admin Event Management

### `src/app/admin/(shell)/events/page.tsx` (update)
- Table: title, date, location, tiers count, total registered, checked in, status badges
- Quick stats cards at top: total events, upcoming, total registrations
- Filter by: upcoming, past, published, draft

### `src/app/admin/(shell)/events/new/page.tsx` and `[id]/page.tsx` (update)
Full event form with tabs:

**Tab 1 — Details:**
- Title, slug (auto from title), description (rich text)
- Banner image + thumbnail (Cloudinary upload)
- Start date/time, end date/time, doors open time
- Timezone selector
- Location, venue name, venue address
- Online event toggle → show online link field
- Published / Featured toggles

**Tab 2 — Tickets:**
- Add/remove ticket tiers
- Per tier: name, description, price (0 = free), capacity, sales start/end, perks (tag input), display order
- Total capacity field

**Tab 3 — Promo Codes:**
- List existing promo codes
- Add new: code, discount type (% or fixed), discount value, max uses, expiry date, active toggle
- Delete promo code

**Tab 4 — Recurring:**
- Is recurring toggle
- Frequency: weekly / monthly
- Days of week (for weekly)
- End date
- "Generate instances" button — creates child events for each occurrence

**Tab 5 — Registrations:**
- Table of all registrations: name, email, tier, quantity, total paid, status, checked in status
- Search by name/email
- Export to CSV
- Manual registration button (add someone directly)
- Send reminder email to all registered

**Tab 6 — Waitlist:**
- Table of waitlisted attendees per tier
- "Notify waitlist" button — emails top N waitlisted people when spots open up

### `src/app/admin/(shell)/events/[id]/registrations/page.tsx` (update)
- Full registrations list with all fields
- Bulk actions: cancel, send email
- Individual actions: view ticket, resend ticket, cancel, check in manually

---

## 7. Waitlist Automation

When a registration is cancelled:
- Check if any waitlisted attendees exist for that tier
- Email the next person on the waitlist with a time-limited link to claim the spot (24hr expiry)
- If they don't claim it, move to the next person

### `src/app/api/events/[slug]/waitlist/claim/route.ts` (new)
- GET with token: validate claim token, redirect to registration flow with tier pre-selected

---

## 8. Recurring Events

When an event is marked as recurring with a pattern:
- Admin can generate instances (child events) from the parent
- Each instance is a full Event record linked to parent via `recurringPattern`
- Public: show all instances on events page
- Admin: show parent + instances, with "Edit all" or "Edit this one" option

---

## 9. Email Templates

Use existing `renderEmailTemplate` helper:

### Ticket Confirmation
- Subject: `Your ticket for [Event Name]`
- Body: event details, tier, QR code image, instructions
- For multiple tickets: show each ticket

### Waitlist Confirmation
- Subject: `You're on the waitlist for [Event Name]`
- Body: position in queue, what happens next

### Waitlist Claim Notification
- Subject: `A spot just opened for [Event Name] — claim it now`
- Body: claim link (expires in 24hrs), tier details

### Event Reminder (manual trigger from admin)
- Subject: `Reminder: [Event Name] is [X days/tomorrow/today]`
- Body: event details, venue, QR code reminder

---

## 10. Admin Sidebar

Ensure Events section in sidebar has links to:
- All Events
- (Per event: Registrations, Check-in, Waitlist are accessible from the event detail page)

---

## Rules

- Do not modify public pages beyond events
- Do not break shop, booking, contact, or other features
- All prices in kobo, displayed as ₦
- QR codes generated server-side and embedded as base64 in emails
- Use existing admin layout and design patterns
- Use Tailwind + existing design tokens
- All new Prisma models: run `prisma db push` after changes
