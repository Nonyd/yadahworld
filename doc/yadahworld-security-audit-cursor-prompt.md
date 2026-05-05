# Cursor Prompt — yadahworld.com Full Security Audit & Fix

You are a senior security engineer and ethical hacker. Your job is to audit the entire yadahworld.com Next.js codebase for security vulnerabilities and fix every one you find. Think like an attacker — look for every possible way a malicious user could exploit, manipulate, or damage this application.

Conduct a full security review across all the categories below, then fix every vulnerability found. Do not just report — fix.

---

## 1. Authentication & Authorization

- Is the admin login brute-force protected? If not, add rate limiting to `src/app/api/auth/[...nextauth]/route.ts` or the login endpoint.
- Are all `/api/admin/*` routes protected by session checks? Audit every single admin API route and confirm each one checks for a valid session before executing. If any route is missing the session check, add it.
- Can a logged-out user access any admin page or API endpoint? Check middleware.
- Is the `ADMIN_PASSWORD` hashed? If it's being compared as plain text, switch to `bcrypt` comparison.
- Are JWT/session tokens configured securely (httpOnly, secure, sameSite)?

## 2. API Input Validation & Injection

- Are all public API routes (`/api/booking`, `/api/contact`, `/api/campus-tour/apply`, `/api/newsletter/subscribe`) validating and sanitizing input with Zod or equivalent?
- Is there any risk of SQL injection through Prisma raw queries? Check for any `prisma.$queryRaw` or `prisma.$executeRaw` calls that use string interpolation.
- Is HTML/script content being sanitized before saving to the database or rendering? Check contact messages, booking requests, and any user-submitted text that gets rendered in the admin.
- Are file upload endpoints (`/api/admin/upload`, `/api/admin/cloudinary-upload-params`) validating file types server-side, not just client-side?

## 3. Rate Limiting & Abuse Prevention

- Are public form endpoints rate limited? `/api/contact`, `/api/booking`, `/api/newsletter/subscribe`, `/api/campus-tour/apply` should all have rate limiting to prevent spam and abuse.
- Add rate limiting using a simple in-memory store or `next-rate-limit` if not already present.
- Is the newsletter subscribe endpoint protected against mass subscription attacks?

## 4. CSRF Protection

- Are state-changing API routes (POST, PATCH, DELETE) protected against CSRF?
- Next.js App Router with JSON bodies is generally safe, but verify no form-encoded endpoints exist without protection.

## 5. Sensitive Data Exposure

- Are any API routes returning more data than needed? For example, does a public endpoint accidentally return password fields, secret keys, or internal IDs?
- Is the admin settings API (`/api/admin/settings`) masking sensitive fields like `brevoSmtpPass`, `stripeSecretKey`, `paystackSecretKey` when returning data to the frontend? These should never be returned in full — mask them as `••••••••` or return a boolean `isSet` flag instead.
- Are error messages in API routes generic enough to not leak stack traces or internal details to the client?

## 6. Security Headers

- Add security headers to `next.config.js` or middleware:
  - `X-Frame-Options: DENY` (prevents clickjacking)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy` — at minimum restrict `default-src` and `script-src`

## 7. Webhook Security

- Is the Paystack webhook (`/api/webhooks/paystack`) verifying the signature before processing? If not, anyone can POST fake payment confirmations to it.
- Confirm the webhook checks `x-paystack-signature` against an HMAC of the raw body using `PAYSTACK_SECRET_KEY`.

## 8. Cron Endpoint Protection

- Is `/api/cron/sync-youtube` protected by the `CRON_SECRET` bearer token? Confirm this check exists and is enforced. If not, anyone can trigger a YouTube sync.

## 9. Environment Variable Leakage

- Are any secret environment variables accidentally exposed to the client bundle? Search for any `NEXT_PUBLIC_` prefixed variables that contain secrets (API keys, passwords).
- Confirm `BREVO_SMTP_PASS`, `PAYSTACK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `DATABASE_URL` are server-only.

## 10. Booking & Event Registration Abuse

- Can someone register for the same event unlimited times with the same email?
- Can someone submit the booking form with a past date or obviously invalid data that passes Zod but causes issues?
- Add duplicate registration checks where missing.

## 11. Admin Panel Hardening

- Is there a maximum session duration configured for the admin?
- Is there protection against session fixation?

---

## Output Requirements

For every vulnerability found:
1. State what the vulnerability is
2. State which file it's in
3. Fix it directly in the code

After all fixes, provide a summary list of every vulnerability found and fixed.

Do not modify any frontend UI, design, or copy. Security fixes only.
