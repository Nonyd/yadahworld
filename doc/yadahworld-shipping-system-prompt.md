# Cursor Prompt — yadahworld.com Shipping System

Implement a full shipping system for the yadahworld.com shop. Follow every instruction exactly.

---

## Overview

- Shipping rates configurable per Nigerian state (36 states + FCT) from the admin panel
- International shipping: single rate for all countries outside Nigeria
- Digital products skip shipping entirely
- Rates stored in the database
- Displayed to customer at checkout before payment

---

## 1. Prisma Schema — `prisma/schema.prisma`

Add the following model:

```prisma
model ShippingRate {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  zone        String   // Nigerian state name, "International", or "Default"
  label       String   // Display name e.g. "Lagos", "International"
  rate        Int      // shipping fee in kobo
  isActive    Boolean  @default(true)
}
```

Also add to `SiteSettings`:
```prisma
freeShippingThreshold  Int?   // order subtotal in kobo above which shipping is free (null = never free)
defaultShippingRate    Int    @default(150000)  // fallback rate in kobo (₦1,500)
```

Run `prisma db push` after schema changes.

---

## 2. Seed Default Shipping Rates

Create `src/lib/seed-shipping.ts` with a function `seedShippingRates()` that inserts default rates for all 36 Nigerian states + FCT + International if no rates exist yet:

```ts
const DEFAULT_RATES = [
  { zone: 'Abia', label: 'Abia', rate: 250000 },
  { zone: 'Adamawa', label: 'Adamawa', rate: 350000 },
  { zone: 'Akwa Ibom', label: 'Akwa Ibom', rate: 280000 },
  { zone: 'Anambra', label: 'Anambra', rate: 250000 },
  { zone: 'Bauchi', label: 'Bauchi', rate: 350000 },
  { zone: 'Bayelsa', label: 'Bayelsa', rate: 300000 },
  { zone: 'Benue', label: 'Benue', rate: 300000 },
  { zone: 'Borno', label: 'Borno', rate: 400000 },
  { zone: 'Cross River', label: 'Cross River', rate: 300000 },
  { zone: 'Delta', label: 'Delta', rate: 280000 },
  { zone: 'Ebonyi', label: 'Ebonyi', rate: 280000 },
  { zone: 'Edo', label: 'Edo', rate: 280000 },
  { zone: 'Ekiti', label: 'Ekiti', rate: 250000 },
  { zone: 'Enugu', label: 'Enugu', rate: 250000 },
  { zone: 'FCT', label: 'FCT (Abuja)', rate: 150000 },
  { zone: 'Gombe', label: 'Gombe', rate: 350000 },
  { zone: 'Imo', label: 'Imo', rate: 250000 },
  { zone: 'Jigawa', label: 'Jigawa', rate: 380000 },
  { zone: 'Kaduna', label: 'Kaduna', rate: 300000 },
  { zone: 'Kano', label: 'Kano', rate: 300000 },
  { zone: 'Katsina', label: 'Katsina', rate: 350000 },
  { zone: 'Kebbi', label: 'Kebbi', rate: 380000 },
  { zone: 'Kogi', label: 'Kogi', rate: 280000 },
  { zone: 'Kwara', label: 'Kwara', rate: 250000 },
  { zone: 'Lagos', label: 'Lagos', rate: 200000 },
  { zone: 'Nasarawa', label: 'Nasarawa', rate: 200000 },
  { zone: 'Niger', label: 'Niger', rate: 250000 },
  { zone: 'Ogun', label: 'Ogun', rate: 200000 },
  { zone: 'Ondo', label: 'Ondo', rate: 250000 },
  { zone: 'Osun', label: 'Osun', rate: 250000 },
  { zone: 'Oyo', label: 'Oyo', rate: 250000 },
  { zone: 'Plateau', label: 'Plateau', rate: 300000 },
  { zone: 'Rivers', label: 'Rivers', rate: 300000 },
  { zone: 'Sokoto', label: 'Sokoto', rate: 400000 },
  { zone: 'Taraba', label: 'Taraba', rate: 380000 },
  { zone: 'Yobe', label: 'Yobe', rate: 380000 },
  { zone: 'Zamfara', label: 'Zamfara', rate: 400000 },
  { zone: 'International', label: 'International', rate: 2500000 },
]
```

Call `seedShippingRates()` from the admin shipping settings page on first load if no rates exist.

---

## 3. Shipping Rate API

### `src/app/api/shipping/rate/route.ts` (new — public)
```
POST { state: string, country: string, subtotal: number }
Returns { rate: number, label: string, isFree: boolean }
```

Logic:
- If all items in cart are digital → return `{ rate: 0, label: 'Digital delivery', isFree: true }`
- If country is "Nigeria" → look up `ShippingRate` by state
- If country is not "Nigeria" → look up `ShippingRate` where zone = "International"
- If no matching rate found → use `SiteSettings.defaultShippingRate`
- If subtotal >= `SiteSettings.freeShippingThreshold` (and threshold is set) → return free shipping

### `src/app/api/admin/shipping/route.ts` (new — admin)
```
GET → return all ShippingRate records ordered by zone
PATCH { rates: { id: string, rate: number, isActive: boolean }[] } → bulk update rates
```

### `src/app/api/admin/shipping/seed/route.ts` (new — admin)
```
POST → run seedShippingRates() if no rates exist yet
```

---

## 4. Update Checkout Flow

### `src/app/(site)/shop/checkout/page.tsx`

Update the shipping address step:

**For Nigerian addresses:**
- Add a **State** dropdown with all 36 states + FCT
- Country field defaults to "Nigeria"
- On state selection: fetch shipping rate from `/api/shipping/rate`
- Show shipping fee dynamically in the order summary

**For international addresses:**
- Country dropdown (full list)
- On country selection (non-Nigeria): fetch international rate
- Show international shipping fee

**Checkout order summary** should show:
```
Subtotal:     ₦X,XXX
Shipping:     ₦X,XXX  (or "Free" if applicable)
─────────────────────
Total:        ₦X,XXX
```

**Digital-only orders:**
- Skip the shipping address step entirely
- Show "Digital delivery — no shipping required" in order summary
- `shippingFee: 0` in the order

---

## 5. Update Order Creation

In `src/app/api/shop/orders/route.ts`:
- Accept `shippingFee` from the checkout payload
- Store `shippingAddress` as JSON: `{ name, street, city, state, country, zip?, phone }`
- Include shipping fee in total calculation: `total = subtotal + shippingFee - discount`

---

## 6. Admin Shipping Settings Page

### `src/app/admin/(shell)/shipping/page.tsx` (new)

Full shipping management page with two sections:

**Section 1 — General Settings**
- Free shipping threshold input (₦ amount, leave blank to disable)
- Default shipping rate input (fallback if no zone rate found)
- Save button

**Section 2 — Shipping Rates by State**
- Table with columns: State, Rate (₦), Active toggle
- All 36 states + FCT + International row
- Each rate is editable inline (click to edit)
- "Seed default rates" button (shown only if no rates exist)
- "Save all rates" button
- Rates displayed in ₦ (divided by 100), stored in kobo

---

## 7. Admin Sidebar

Add **Shipping** link to the admin sidebar under the Shop section (alongside Products and Orders).

---

## 8. Update Order Confirmation Email

In the order confirmation email template, add a **Shipping Details** section for physical orders:

```
Shipping to:
[Customer Name]
[Street Address]
[City, State]
[Country]

Shipping fee: ₦X,XXX
```

For digital orders show:
```
Delivery: Digital — download link will be provided
```

---

## 9. Update Admin Order Detail

In `src/app/admin/(shell)/orders/[id]/page.tsx`, show the full shipping address and shipping fee in the order detail view.

---

## Rules

- All rates stored in kobo, displayed as ₦ (divide by 100)
- Digital products (type = DIGITAL) always have ₦0 shipping
- Do not break existing checkout, payment, or order flows
- Do not modify any non-shop public pages
- Use existing admin layout and design patterns
- Use Tailwind + existing design tokens
