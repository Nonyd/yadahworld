# Cursor Prompt — Payment Gateway Admin Settings + QR Ticket Email

Wire all payment gateways into the admin settings panel, add test/live mode toggles, webhook URL display, and redesign the QR code ticket email. Follow every instruction exactly.

---

## Overview

The app currently reads payment keys from `.env`. We want all keys configurable from **Admin → Settings → Integrations** — stored in the database, read at runtime. `.env` values are fallback only.

Gateways to support:
- **Paystack** (already partially in settings)
- **Flutterwave** (not in settings yet)
- **Payaza** (not in settings yet)

---

## 1. Update Prisma Schema — `prisma/schema.prisma`

Add the following fields to `SiteSettings`:

```prisma
// Paystack
paystackPublicKey       String?
paystackSecretKey       String?
paystackEnabled         Boolean  @default(false)
paystackMode            String   @default("test")  // "test" | "live"
paystackWebhookSecret   String?

// Flutterwave
flutterwavePublicKey    String?
flutterwaveSecretKey    String?
flutterwaveEnabled      Boolean  @default(false)
flutterwaveMode         String   @default("test")  // "test" | "live"
flutterwaveWebhookSecret String?

// Payaza
payazaPublicKey         String?
payazaSecretKey         String?
payazaEnabled           Boolean  @default(false)
payazaMode              String   @default("test")  // "test" | "live"
payazaWebhookSecret     String?
```

Only add fields that don't already exist. Run `prisma db push` after.

---

## 2. Update `src/lib/site-settings.ts`

Add helper functions to retrieve payment gateway settings:

```ts
export async function getPaystackConfig() {
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  return {
    publicKey: s?.paystackPublicKey?.trim() || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    secretKey: s?.paystackSecretKey?.trim() || process.env.PAYSTACK_SECRET_KEY || '',
    enabled: s?.paystackEnabled ?? false,
    mode: (s?.paystackMode || 'test') as 'test' | 'live',
    webhookSecret: s?.paystackWebhookSecret?.trim() || process.env.PAYSTACK_WEBHOOK_SECRET || '',
  }
}

export async function getFlutterwaveConfig() {
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  return {
    publicKey: s?.flutterwavePublicKey?.trim() || process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || '',
    secretKey: s?.flutterwaveSecretKey?.trim() || process.env.FLUTTERWAVE_SECRET_KEY || '',
    enabled: s?.flutterwaveEnabled ?? false,
    mode: (s?.flutterwaveMode || 'test') as 'test' | 'live',
    webhookSecret: s?.flutterwaveWebhookSecret?.trim() || process.env.FLUTTERWAVE_WEBHOOK_SECRET || '',
  }
}

export async function getPayazaConfig() {
  const s = await prisma.siteSettings.findUnique({ where: { id: 1 } })
  return {
    publicKey: s?.payazaPublicKey?.trim() || process.env.PAYAZA_PUBLIC_KEY || '',
    secretKey: s?.payazaSecretKey?.trim() || process.env.PAYAZA_SECRET_KEY || '',
    enabled: s?.payazaEnabled ?? false,
    mode: (s?.payazaMode || 'test') as 'test' | 'live',
    webhookSecret: s?.payazaWebhookSecret?.trim() || process.env.PAYAZA_WEBHOOK_SECRET || '',
  }
}
```

---

## 3. Update Admin Settings API — `src/app/api/admin/settings/route.ts`

Accept and save all new payment gateway fields in the PATCH handler. Mask all secret keys in GET response (show `••••••••` if set, empty string if not).

Fields to add to PATCH body handling:
- `paystackPublicKey`, `paystackSecretKey`, `paystackEnabled`, `paystackMode`, `paystackWebhookSecret`
- `flutterwavePublicKey`, `flutterwaveSecretKey`, `flutterwaveEnabled`, `flutterwaveMode`, `flutterwaveWebhookSecret`
- `payazaPublicKey`, `payazaSecretKey`, `payazaEnabled`, `payazaMode`, `payazaWebhookSecret`

---

## 4. Update Admin Settings UI — `src/app/admin/(shell)/settings/page.tsx` and the settings form component

In the **Integrations** tab, replace the existing basic payment section with three full gateway cards:

### Paystack Card
```
Header: "Payments — Paystack" + Live/Not set badge
- Enable Paystack toggle
- Mode selector: Test | Live (radio or toggle)
- Public key input (shows live badge if set)
- Secret key input (password field, shows live badge if set)
- Webhook secret input (password field)
- Info box: "Set your Paystack webhook URL to: https://yadahworld.com/api/webhooks/paystack"
- Copy button next to webhook URL
```

### Flutterwave Card
```
Header: "Payments — Flutterwave" + Live/Not set badge
- Enable Flutterwave toggle
- Mode selector: Test | Live
- Public key input
- Secret key input (password field)
- Webhook secret input (password field)
- Info box: "Set your Flutterwave webhook URL to: https://yadahworld.com/api/webhooks/flutterwave"
- Copy button next to webhook URL
```

### Payaza Card
```
Header: "Payments — Payaza" + Live/Not set badge
- Enable Payaza toggle
- Mode selector: Test | Live
- Public key input
- Secret key input (password field)
- Webhook secret input (password field)
- Info box: "Set your Payaza webhook URL to: https://yadahworld.com/api/webhooks/payaza"
- Copy button next to webhook URL
- Note: "Payaza API base: https://api.payaza.africa — Auth header: Payaza-Auth: Bearer {secret}"
```

All three cards follow the same visual pattern as the existing Brevo SMTP card.

---

## 5. Wire Payment APIs to Use DB Settings

### `src/app/api/shop/checkout/paystack/route.ts`
Replace hardcoded `process.env.PAYSTACK_SECRET_KEY` with `(await getPaystackConfig()).secretKey`

### `src/app/api/shop/checkout/verify-paystack/route.ts`
Same — use `getPaystackConfig()`

### `src/app/api/webhooks/paystack/route.ts`
Use `getPaystackConfig()` for webhook secret verification

### `src/app/api/shop/checkout/flutterwave/route.ts`
Use `getFlutterwaveConfig()`

### `src/app/api/shop/checkout/verify-flutterwave/route.ts`
Use `getFlutterwaveConfig()`

### `src/app/api/shop/checkout/payaza/route.ts`
Implement Payaza payment initialization:
```ts
// POST — initialize Payaza payment
const config = await getPayazaConfig()
const baseUrl = config.mode === 'live' 
  ? 'https://api.payaza.africa' 
  : 'https://sandbox.payaza.africa'

const response = await fetch(`${baseUrl}/send-request/checkout/initiate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Payaza-Auth': `Bearer ${config.secretKey}`,
  },
  body: JSON.stringify({
    transaction_type: 'PAYAZA_ACCOUNT',
    requested_amount: amount, // in kobo
    currency_code: 'NGN',
    transaction_reference: reference,
    email_address: email,
    merchant_reference: orderRef,
    callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/shop/checkout/verify-payaza`,
  })
})
```

### `src/app/api/shop/checkout/verify-payaza/route.ts`
Implement Payaza payment verification:
```ts
const config = await getPayazaConfig()
const baseUrl = config.mode === 'live'
  ? 'https://api.payaza.africa'
  : 'https://sandbox.payaza.africa'

const response = await fetch(`${baseUrl}/send-request/checkout/transaction-status/${reference}`, {
  headers: {
    'Payaza-Auth': `Bearer ${config.secretKey}`,
  }
})
```

### `src/app/api/webhooks/payaza/route.ts` (create if not exists)
Handle Payaza webhook events for payment confirmation.

### Event registration payment routes
Also update:
- `src/app/api/events/[slug]/register/route.ts` — use `getPaystackConfig()` instead of `process.env`
- `src/app/api/events/[slug]/verify-payment/route.ts` — same

---

## 6. Redesign QR Code Ticket Email — `src/lib/ticket-email.ts`

Redesign the ticket email with a premium branded layout:

```
┌─────────────────────────────────────┐
│  [Yadah Logo]                        │
│  THE VOICE OF JESUS TO NATIONS      │
│  gradient header (oxblood #6B2737)  │
├─────────────────────────────────────┤
│                                      │
│  🎫 YOUR TICKET                     │
│                                      │
│  [Event Name — large, bold]         │
│                                      │
│  📅  [Date & Time]                  │
│  📍  [Venue Name]                   │
│      [Address]                       │
│  🎟️  [Tier Name] — [Attendee Name] │
│                                      │
├─────────────────────────────────────┤
│                                      │
│  SCAN TO CHECK IN                   │
│                                      │
│  ┌───────────────┐                  │
│  │               │                  │
│  │   [QR CODE]   │                  │  ← 200x200px, centered
│  │               │                  │
│  └───────────────┘                  │
│                                      │
│  Ticket Code: [TICKET-CODE]         │
│  (monospace, subtle)                │
│                                      │
├─────────────────────────────────────┤
│  ⚠️  Please present this QR code   │
│  at the entrance for check-in.      │
│  Do not share this ticket.          │
├─────────────────────────────────────┤
│  Yadahworld.com                     │
│  © 2026 SonsHub Media               │
└─────────────────────────────────────┘
```

For multiple tickets in one order, show each ticket as a separate card stacked vertically in the same email.

**Implementation details:**
- QR code: use `qrcode` package, generate as base64 PNG, embed as `<img src="data:image/png;base64,..." />`
- QR code size: 200x200px, white background, dark modules
- QR code value: the raw `ticketCode` string
- Colors: oxblood header `#6B2737`, gold accent `#8B6914`, ivory background `#F7F3EC`
- Logo: use `https://res.cloudinary.com/dxliuat50/image/upload/v1777837569/Yadah_White_4x_cd09dg.png` in header (white logo on dark background)
- Font: system fonts (Arial, sans-serif) for email compatibility
- Subject line: `Your ticket for [Event Name] — [Date]`

---

## 7. Test the Full Flow

After implementing, the flow should be:
1. Admin fills in Paystack/Flutterwave/Payaza keys in Settings → Integrations → Save
2. User registers for event or buys product
3. Payment goes through selected gateway
4. On payment success: ticket/order confirmation email sent with QR code
5. At the door: admin scans QR code at `/admin/events/[id]/checkin`

---

## Rules

- Do not modify any public-facing non-payment pages
- Do not change the Brevo SMTP section
- All secret keys masked in GET responses
- Use existing admin layout and design patterns
- Run `prisma db push` after schema changes
- Do not break existing booking or contact features
