# Cursor Prompt — yadahworld.com Full Ecommerce Shop

Build a full ecommerce shop for yadahworld.com. This is a complete overhaul of the existing basic shop. Follow every instruction exactly.

---

## Overview

The shop sells:
- Physical merch (shirts, hoodies, etc.)
- Books / devotionals
- Digital downloads

Payment gateways: **Paystack**, **Flutterwave**, **Payaza**

Features:
- Product variants (size, color, etc.)
- Cart with multiple items
- Inventory / stock tracking per variant
- Full order management in admin (statuses, mark as shipped, etc.)
- Order confirmation emails to customer
- Order notification emails to admin

---

## 1. Prisma Schema Changes

Add/update the following models in `prisma/schema.prisma`:

```prisma
model Product {
  id            String           @id @default(cuid())
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  name          String
  slug          String           @unique
  description   String?
  type          ProductType      @default(PHYSICAL)
  price         Int              // price in kobo (NGN) or smallest currency unit
  comparePrice  Int?             // original price for showing discount
  images        String[]         // array of image URLs
  isActive      Boolean          @default(true)
  isFeatured    Boolean          @default(false)
  category      String?
  tags          String[]
  variants      ProductVariant[]
  orders        OrderItem[]
  digitalFile   String?          // URL for digital downloads
}

enum ProductType {
  PHYSICAL
  DIGITAL
  BOOK
}

model ProductVariant {
  id        String     @id @default(cuid())
  productId String
  product   Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  name      String     // e.g. "Size" or "Color"
  value     String     // e.g. "XL" or "Red"
  stock     Int        @default(0)
  price     Int?       // override product price if different
  sku       String?
  orders    OrderItem[]
}

model Order {
  id              String        @id @default(cuid())
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  orderNumber     String        @unique
  status          OrderStatus   @default(PENDING)
  customerName    String
  customerEmail   String
  customerPhone   String?
  shippingAddress Json?         // { street, city, state, country, zip }
  items           OrderItem[]
  subtotal        Int
  shippingFee     Int           @default(0)
  discount        Int           @default(0)
  total           Int
  paymentGateway  String?       // "paystack" | "flutterwave" | "payaza"
  paymentRef      String?
  paymentStatus   PaymentStatus @default(UNPAID)
  notes           String?
  trackingNumber  String?
  shippedAt       DateTime?
  deliveredAt     DateTime?
}

model OrderItem {
  id        String          @id @default(cuid())
  orderId   String
  order     Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product         @relation(fields: [productId], references: [id])
  variantId String?
  variant   ProductVariant? @relation(fields: [variantId], references: [id])
  quantity  Int
  price     Int             // price at time of purchase
  name      String          // product name at time of purchase
  variantLabel String?      // e.g. "Size: XL, Color: Red"
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  UNPAID
  PAID
  REFUNDED
  FAILED
}
```

Run `prisma db push` after schema changes.

---

## 2. Public Shop Pages

### `src/app/(site)/shop/page.tsx`
- Fetch all active products
- Display in a grid with product image, name, price, compare price (strikethrough if set)
- Filter by category (tabs or dropdown)
- "Add to Cart" button on each product card
- Featured products shown first
- Empty state: "No products yet. Check back soon."

### `src/app/(site)/shop/[slug]/page.tsx`
- Full product detail page
- Image gallery (main image + thumbnails)
- Product name, description, price
- Variant selector (grouped by name — e.g. Size buttons, Color swatches)
- Stock indicator ("In Stock", "Low Stock" if ≤5, "Out of Stock")
- Quantity selector
- "Add to Cart" button
- Digital products: show "Download after purchase" note instead of shipping info
- Related products section at bottom

### `src/app/(site)/shop/cart/page.tsx`
- Cart page showing all items
- Each item: image, name, variant, quantity (adjustable), price, remove button
- Order summary: subtotal, shipping fee (flat rate or free over threshold), total
- "Proceed to Checkout" button
- Empty cart state with link back to shop

### `src/app/(site)/shop/checkout/page.tsx`
- Multi-step checkout:
  - Step 1: Customer info (name, email, phone)
  - Step 2: Shipping address (for physical/book products; skip for digital-only orders)
  - Step 3: Payment — show Paystack, Flutterwave, Payaza buttons
- Order summary sidebar throughout
- On payment success: redirect to `/shop/order-confirmed/[orderNumber]`

### `src/app/(site)/shop/order-confirmed/[orderNumber]/page.tsx`
- Thank you page showing order number, items purchased, total
- "Check your email for order confirmation"
- Link back to shop

---

## 3. Cart State Management

Create `src/lib/cart.ts` with a React Context + localStorage cart:

```ts
// CartItem type
type CartItem = {
  productId: string
  variantId?: string
  name: string
  variantLabel?: string
  price: number
  image: string
  quantity: number
}
```

Create `src/components/shop/CartProvider.tsx` — wrap the app with cart context. Expose:
- `cart: CartItem[]`
- `addToCart(item: CartItem)`
- `removeFromCart(productId, variantId?)`
- `updateQuantity(productId, variantId?, quantity)`
- `clearCart()`
- `cartTotal: number`
- `cartCount: number`

Add `CartProvider` to `src/app/layout.tsx`.

---

## 4. Payment Integration

### Paystack
Use existing Paystack integration. On checkout:
- Initialize transaction via `/api/shop/checkout/paystack`
- Redirect to Paystack hosted page or use inline popup
- Verify via `/api/shop/checkout/verify-paystack`

### Flutterwave
- Initialize via `/api/shop/checkout/flutterwave`
- Use Flutterwave inline JS SDK
- Verify via `/api/shop/checkout/verify-flutterwave`

### Payaza
- Initialize via `/api/shop/checkout/payaza`
- Use Payaza payment page redirect
- Verify via `/api/shop/checkout/verify-payaza`
- Payaza API base: `https://api.payaza.africa`
- Auth header: `Payaza-Auth: Bearer {PAYAZA_SECRET_KEY}`

Add env vars to `.env.example`:
```
PAYAZA_PUBLIC_KEY=
PAYAZA_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
```

---

## 5. Order API Routes

### `src/app/api/shop/orders/route.ts`
- POST: Create a new order (called after payment verification)
- Deducts stock from `ProductVariant.stock`
- Generates `orderNumber` (e.g. `YDH-2026-0001`)
- Sends order confirmation email to customer
- Sends order notification email to admin (`brevoNotifyEmail`)

### `src/app/api/shop/orders/[orderNumber]/route.ts`
- GET: Fetch order by order number (for thank you page)

---

## 6. Admin Shop Pages

### `src/app/admin/(shell)/products/page.tsx` (update existing)
- Table of all products with: image thumbnail, name, type badge, price, stock total, status toggle, edit/delete actions
- "Add Product" button

### `src/app/admin/(shell)/products/new/page.tsx` and `[id]/page.tsx` (update existing)
Full product form:
- Name, slug (auto-generated from name), description (rich textarea)
- Product type selector (Physical / Digital / Book)
- Price, compare price
- Category, tags
- Images (multiple Cloudinary uploads)
- Digital file URL (shown only for DIGITAL type)
- Variants section:
  - Add variant group (e.g. "Size") with values (S, M, L, XL) each with stock and optional price override
  - Add another variant group (e.g. "Color")
- Active / Featured toggles
- Save button

### `src/app/admin/(shell)/orders/page.tsx` (new)
- Table of all orders: order number, date, customer name, items count, total, payment status badge, order status badge, actions
- Filter by status
- Search by order number or customer email
- Export to CSV button

### `src/app/admin/(shell)/orders/[id]/page.tsx` (new)
Full order detail:
- Order info: number, date, customer details, shipping address
- Items list with images, variants, quantities, prices
- Order status selector (PENDING → PROCESSING → SHIPPED → DELIVERED → CANCELLED)
- When status = SHIPPED: show tracking number input
- Payment status badge
- Notes field
- "Send status update email to customer" button
- Timeline showing status history

---

## 7. Admin Sidebar

Add "Orders" link to the admin sidebar navigation, grouped under "Shop" with "Products".

---

## 8. Email Templates

Use the existing `renderEmailTemplate` helper for:

### Order Confirmation (to customer)
- Subject: `Your order #YDH-2026-0001 has been received`
- Show: order items table, subtotal, shipping, total, shipping address (if physical)
- Footer: "We'll notify you when your order ships."

### Order Notification (to admin)
- Subject: `New order #YDH-2026-0001 — ₦X,XXX`
- Show: customer info, items, total, payment gateway used

### Order Status Update (to customer)
- Subject: `Your order #YDH-2026-0001 has been [status]`
- Show: status, tracking number (if shipped), estimated delivery

---

## Rules

- Do not modify any non-shop public pages
- Do not break existing booking, events, or contact features
- All prices stored in **kobo** (smallest NGN unit), displayed divided by 100
- Currency display: `₦` prefix
- Use Tailwind + existing design tokens for all UI
- Admin pages use existing admin layout and component patterns
