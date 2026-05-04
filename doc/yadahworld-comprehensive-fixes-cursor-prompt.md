# YADAHWORLD — Comprehensive Fix & Enhancement Prompt
## Send this entire prompt to Cursor

---

## 1. ADMIN SETTINGS PAGE — FULL REDESIGN WITH TABS + INTEGRATIONS

Replace the current scrolling settings page with a tabbed interface. The tabs should be:
**General | Contact | Social | Images | Gallery | Integrations**

### File: `src/app/admin/(shell)/settings/page.tsx`
### File: `src/components/admin/settings/AdminSettingsForm.tsx`

The settings form should use client-side tab state. Each tab is a separate section rendered conditionally. Add a sticky "Save All Settings" button at the bottom that is always visible.

**Tab: General**
- Site Name (text input)
- Tagline (text input)
- Default Meta Description (textarea)
- Title Suffix (text input)
- Hero tagline shown on homepage (text input) — e.g. "The Voice of Jesus Christ to Nations"
- About bio short text (textarea) — shown on homepage About snippet
- Footer copyright text (text input)

**Tab: Contact**
- Public contact email
- Public phone number
- Booking enquiries email (if different)
- Physical address / location (text input, e.g. "Abuja, Nigeria")

**Tab: Social**
- Instagram URL
- YouTube URL
- Spotify URL
- Facebook URL
- X (Twitter) URL
- TikTok URL (new field — add to SiteSettings schema)

**Tab: Images**
Each image field has:
- Label (e.g. "Hero Background")
- Description of where it appears
- "Upload Image" button (uses existing AdminImageUpload component → Cloudinary)
- OR paste URL input field
- Live preview thumbnail (80px height) shown below when URL/upload is present
- Clear button (×) to remove the image

Image fields:
- Hero Background (homepage full-bleed)
- Home "Artist" Section Image (the about snippet portrait)
- About Page Hero (full-bleed header on /about)
- About Page Portrait (the 3:4 portrait in the bio section)
- Booking CTA Background (the dark worship image behind "Yadah is always glad to be a blessing")

**Tab: Gallery**
- Textarea: one Cloudinary/image URL per line
- "Upload Images to Gallery" button — allows multiple file selection, appends URLs to textarea
- Live preview grid: shows thumbnails of all current gallery images (max 80px height each, wrap)
- Note: "These images appear on the Media page under Photos"

**Tab: Integrations**
This is the new tab. Organise into subsections:

### Email — Brevo SMTP
- BREVO_SMTP_HOST (text, default: smtp-relay.brevo.com)
- BREVO_SMTP_PORT (number, default: 587)
- BREVO_SMTP_USER (text — Brevo login email)
- BREVO_SMTP_PASS (password input — Brevo SMTP key)
- BREVO_FROM_EMAIL (text — sender email)
- BREVO_FROM_NAME (text — sender name, default: Yadah)
- BREVO_NOTIFY_EMAIL (text — email to receive booking/contact notifications)
- "Send Test Email" button — calls POST /api/admin/test-email, sends a test to BREVO_NOTIFY_EMAIL

### Payments — Stripe
- STRIPE_SECRET_KEY (password input)
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (text input)
- STRIPE_WEBHOOK_SECRET (password input)
- Toggle: Enable Stripe Checkout (boolean, shown as switch)

### Payments — Paystack
Add new fields to SiteSettings:
- paystackPublicKey (text)
- paystackSecretKey (password)
- paystackEnabled (boolean, default false)

### Payments — Flutterwave  
Add new fields to SiteSettings:
- flutterwavePublicKey (text)
- flutterwaveSecretKey (password)
- flutterwaveEnabled (boolean, default false)

### Notes on Integrations tab:
- Sensitive key fields use `type="password"` with a show/hide toggle eye icon
- Save button for integrations calls PATCH /api/admin/settings (same endpoint)
- Show a small badge "LIVE" in green or "NOT SET" in amber next to each integration based on whether keys are present
- Add the new Paystack/Flutterwave/TikTok fields to prisma/schema.prisma SiteSettings model
- Run npx prisma db push after schema change

---

## 2. ADMIN SIDEBAR — BADGE COUNTS + PRODUCTS LINK

### File: `src/components/admin/AdminSidebar.tsx`

Make the sidebar a server component that fetches counts, OR pass counts as props from the shell layout.

Changes:
- Add "Products" nav item between "Releases" and "Events" with icon ◈
- "Bookings" shows a red badge with count of PENDING bookings (only show badge if count > 0)
- "Messages" shows a red badge with count of unread messages (only show if > 0)
- Badge style: small circle, bg-accent text-white, font-jost text-[10px], absolute top-right of the nav item
- Fetch counts in `src/app/admin/(shell)/layout.tsx` using prisma and pass as props to AdminAppShell

### Shell layout change:
```tsx
// src/app/admin/(shell)/layout.tsx
const [pendingBookings, unreadMessages] = await Promise.all([
  prisma.bookingRequest.count({ where: { status: 'PENDING' } }),
  prisma.contactMessage.count({ where: { read: false } }),
])
// Pass these to AdminAppShell or AdminSidebar
```

---

## 3. PRODUCTS / SHOP ADMIN CMS (full implementation)

### New files needed:
- `src/app/admin/(shell)/products/page.tsx` — list
- `src/app/admin/(shell)/products/new/page.tsx` — create form
- `src/app/admin/(shell)/products/[id]/page.tsx` — edit form
- `src/components/admin/cms/ProductForm.tsx` — shared form
- `src/components/admin/cms/DeleteProductButton.tsx`
- `src/app/api/admin/products/route.ts` — GET list, POST create
- `src/app/api/admin/products/[id]/route.ts` — GET one, PATCH update, DELETE

### Product form fields:
- Name (text, required)
- Slug (text, auto-generate from name with edit option)
- Description (textarea)
- Price (number input — in NGN, display as ₦)
- Currency (select: NGN / USD)
- Category (text — e.g. Merch, Music, Digital)
- In Stock (toggle switch)
- Images — multiple image upload/URL fields (up to 5 images), uses AdminImageUpload
- Stripe Product ID (text, optional — for linking to existing Stripe product)

### Products list page:
- Table with columns: Image (thumbnail), Name, Price, Category, In Stock, Actions (Edit/Delete)
- "New Product" button top right
- Empty state: "No products yet. Add your first product."

### Public shop page update (`src/app/(site)/shop/page.tsx`):
- The shop already reads from DB — no change needed to query
- But update ShopGrid component to show ₦ for NGN prices and $ for USD
- Add "Out of Stock" overlay on cards where inStock = false
- Each product links to `/shop/[slug]` (add this route)

### New: `src/app/(site)/shop/[slug]/page.tsx`
- Product detail page
- Show: main image (large), image thumbnails row, name, price, description, category
- "Buy Now" button → calls /api/checkout with this product
- If Stripe is not configured, show "Contact us to order" with a mailto link
- Related products (other 3 products) at bottom
- Same ivory/oxblood design system

---

## 4. PUBLIC SITE FIXES

### 4a. Remove dark mode toggle
- Remove ThemeToggle from Navbar and Footer entirely
- Remove `src/components/ui/ThemeToggle.tsx` or leave the file but stop rendering it
- The site is light-only. Remove ThemeProvider's darkMode support.
- In `src/app/layout.tsx` or providers, set theme to always "light" and disable toggle

### 4b. Navbar — move "Releases" out of main nav
The main nav has too many items. Change nav links to:
HOME | MEDIA | ABOUT | ROOM FOR YOU | CONTACT | BOOKING | SHOP

Move "Releases" to the footer under "Navigate" column (it's already there, just remove from top nav).

### 4c. Hero section improvements
In `src/components/home/HeroSection.tsx`:
- The "Yadah" display text should be `clamp(6rem, 14vw, 11rem)` — bigger and more dominant
- Add a thin animated horizontal line (1px, gold color, grows from left to right on load) below the tagline
- The scroll indicator should be bottom-right, vertical text "scroll" rotated

### 4d. About snippet layout fix
In `src/components/home/AboutSnippet.tsx`:
- Image column should be `aspect-[3/4]` and take up more space: change grid to `md:grid-cols-[4fr_6fr]`
- Stats row: make the numbers larger — `font-playfair text-5xl`

### 4e. Videos section — increase grid
In `src/components/home/VideosSection.tsx`:
- Change grid from 2 columns to 3 columns on desktop: `md:grid-cols-3`
- Show up to 6 videos on homepage (change query limit from 2 to 6)
- Each card: thumbnail, play button overlay, title below

### 4f. Media page — video grid
In `src/components/media/MediaPageClient.tsx`:
- Video grid: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` gap-6
- Each video card: 16:9 aspect ratio thumbnail, play button, title + "Watch on YouTube" link
- Photos tab: masonry-style grid `columns-2 md:columns-3 xl:columns-4` gap-3

---

## 5. RELEASE DETAIL PAGE — POLISH

### File: `src/app/(site)/releases/[slug]/page.tsx`

Full redesign of the release detail page:

```
Layout:
- Top: eyebrow "DISCOGRAPHY" + type (SINGLE / ALBUM / EP)
- Left column (40%): 
    - Square cover image (manuscript-frame class)
    - Streaming links below as pill buttons
- Right column (60%):
    - Title in display-1 Playfair
    - Feat artist in italic baskerville if present
    - Year + Type label
    - Gold horizontal rule
    - Description (body-lg) — if empty show: "This release is part of Yadah's discography."
    - If musicVideoYoutube is set: embedded YouTube player (16:9 iframe)
    
Streaming link pills:
- Spotify: green bg → "Listen on Spotify →"
- Apple Music: black bg → "Apple Music →"
- YouTube: red bg → "Watch on YouTube →"
Each as <a target="_blank"> with the respective brand color and white text

Bottom section "More Releases":
- 3 other releases in a row (exclude current)
- Same card style as /releases page
```

---

## 6. MISSING PAGES

### `src/app/not-found.tsx`
```tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8" 
         style={{ background: 'var(--bg)' }}>
      <p className="eyebrow mb-4">404</p>
      <h1 className="display-2 text-[var(--body)] mb-6 text-center">Page not found.</h1>
      <p className="body-lg text-center max-w-sm mb-10">
        The page you are looking for does not exist or has been moved.
      </p>
      <a href="/" className="btn-primary">Return Home</a>
    </div>
  )
}
```

### `src/app/loading.tsx`
```tsx
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" 
         style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <span className="font-playfair text-2xl italic text-[var(--body)] animate-pulse">
          Yadah
        </span>
        <div className="w-24 h-px origin-left animate-[lineGrow_1.5s_ease-in-out_infinite]"
             style={{ background: 'var(--gold)' }} />
      </div>
    </div>
  )
}
```

---

## 7. BOOKING DETAIL PAGE — COMPLETE IMPLEMENTATION

### File: `src/app/admin/(shell)/bookings/[id]/page.tsx`
### File: `src/components/admin/BookingDetailForm.tsx`

The booking detail page should show all submitted fields in a clean 2-column read-only layout, with an action panel on the right:

Left (read-only display):
- Section: "Contact" — Full name, email, phone
- Section: "Organisation" — Church/org name, website, address, phone, email  
- Section: "Event Details" — Event name, nature of event, what expected, description, date, time, address
- Section: "Additional" — Additional info if present

Right panel (editable):
- Status select: PENDING | REVIEWING | CONFIRMED | DECLINED
  - Each status has a color: PENDING=gold, REVIEWING=blue, CONFIRMED=green, DECLINED=red
- Admin Notes textarea
- "Save Changes" button → PATCH /api/admin/bookings/[id]
- "Reply by Email" button → opens mailto:{booker_email}?subject=Re: {eventName}&body=Dear {fullName},...
- Submitted date shown at top of panel

---

## 8. MESSAGES PAGE — EXPANDABLE ROWS

### File: `src/app/admin/(shell)/messages/page.tsx`
### File: `src/components/admin/messages/MessageCard.tsx`

- Table layout: Date | Name | Email | Subject | Status | Actions
- Clicking anywhere on a row expands it inline to show the full message text
- Expanded row has: full message in a quote block, "Mark as Read" button, "Reply" button (mailto:)
- Unread messages have a subtle left border in var(--accent) and slightly bolder subject text
- "Mark all as read" button at top right

---

## 9. PRISMA SCHEMA ADDITIONS

Add these fields to `SiteSettings` model in `prisma/schema.prisma`:

```prisma
// Social additions
socialTiktok          String?

// Payment integrations
paystackPublicKey     String?
paystackSecretKey     String?
paystackEnabled       Boolean @default(false)
flutterwavePublicKey  String?
flutterwaveSecretKey  String?
flutterwaveEnabled    Boolean @default(false)
stripeEnabled         Boolean @default(false)

// Brevo SMTP (stored in settings, used as override of env vars)
brevoSmtpUser         String?
brevoSmtpPass         String?
brevoFromEmail        String?
brevoFromName         String?
brevoNotifyEmail      String?

// Content fields
heroTagline           String?
aboutBioShort         String?
footerCopyright       String?
locationDisplay       String?
```

After editing schema run: `npx prisma db push`

---

## 10. TEST EMAIL API ROUTE

### `src/app/api/admin/test-email/route.ts`

```ts
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await sendMail({
      to: process.env.BREVO_NOTIFY_EMAIL ?? '',
      subject: 'Yadah Admin — Test Email',
      html: '<p>Your Brevo SMTP is configured correctly. This is a test from Yadah Studio.</p>',
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
```

---

## 11. AFTER ALL CHANGES

1. Run `npx prisma db push` to apply schema changes
2. Run `npm run build` — fix any TypeScript errors before committing
3. Run `npm run db:seed` if the DB needs re-seeding
4. Commit with message: `feat: tabbed settings with integrations, products CMS, public site polish, admin enhancements`
5. Push to GitHub — Vercel will auto-deploy
