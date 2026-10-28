# CLAUDE.md — yadahworld.com

You are now the primary development agent for this project (previously built with Cursor). Read this file fully before touching anything. Follow the conventions exactly — they exist because the production pipeline is live and fragile in specific, known ways.

## What this is

Official website of gospel music minister Yadah (Yadah Kukeurim Daniel), managed by SonsHub Media. Live at https://yadahworld.com. Brand line everywhere: "The Voice of Jesus to Nations." Never put promotional superlatives ("top female gospel minister…") in any user-visible text, page title, or OG title — those phrases exist ONLY in hidden SEO metadata (keywords, JSON-LD descriptions) and must stay invisible.

## Stack

- Next.js 14 App Router · TypeScript · Tailwind · Framer Motion · GSAP · Lenis
- Prisma 5 + PostgreSQL running locally on the production VPS (migrated off Neon — there is no Neon anymore)
- Cloudinary (media) · Brevo SMTP (email) · Paystack / Flutterwave / Payaza (payments)
- Design tokens: ivory `#F7F3EC`, oxblood `#6B2737`, gold `#8B6914`, dark `#0A0806`

## Production & deployment (critical — read twice)

- Repo: `github.com/Nonyd/yadahworld`, branch `master` (not main)
- Production: Webuzo VPS, app at `/home/yadahworld`, PM2 process `yadahworld` on port 3000 behind Apache proxy
- Auto-deploy: every push to `master` hits a GitHub webhook → `/home/yadahworld/deploy.sh` runs `git reset --hard && git pull && npm install && npx prisma generate && npx next build && pm2 restart`
- Because of `git reset --hard`, never rely on manual server-side file edits surviving — every fix must land in the repo
- Schema changes: the server build FAILS or pages 500 if new Prisma columns don't exist in the DB yet. The operator (Nony) runs `npx prisma db push` on the server manually. Whenever your work changes `prisma/schema.prisma`, end your summary with a bold reminder: "Run `cd /home/yadahworld && npx prisma db push` on the server, then rebuild if the auto-deploy already ran." This project uses `db push`, never `migrate dev`.
- Scheduled jobs run via system crontab calling `GET /api/cron/*` endpoints with `Authorization: Bearer ${CRON_SECRET}`. Existing: `sync-youtube` (15 min), `booking-reminder` (hourly), `sync-spotify` (daily). New scheduled work = new cron endpoint on the same pattern + a crontab line in your summary. Never add node-cron or any in-process scheduler.
- ModSecurity quirk: Apache WAF blocked PATCH on `/api/admin/*` until whitelisted. If a new route with an uncommon method/payload returns 403 in production but works locally, suspect ModSecurity and say so — the fix is an Apache conf whitelist, not app code.

## Project conventions (non-negotiable)

1. Integration keys: DB `SiteSettings` first, `.env` fallback — via helper functions in `src/lib/site-settings.ts` (`getPaystackConfig()`, `getSpotifyConfig()`, etc.). New integrations follow this pattern. All secret values are masked in the admin settings GET response (see the sanitize function in `src/app/api/admin/settings/route.ts`).
2. Admin audit: mutating calls under `/api/admin/**` are auto-logged to `AdminActivityLog` by middleware. Put admin actions under that path and logging is free — don't write custom logging.
3. Emails: always through `sendMail` in `src/lib/mailer.ts` (keeps `tls: { rejectUnauthorized: false }` and `replyTo` support — do not remove either) and the shared `renderEmailTemplate` helpers for branded layout. Ticket emails have their own richer layout in `src/lib/ticket-email.ts` with QR codes.
4. Auth: NextAuth credentials with plain env comparison in `src/lib/auth.ts` + minimal middleware. History lesson: a previous "hardening" pass (bcrypt + CSRF origin checks in middleware) broke admin login in production and was reverted. Do not reintroduce either without being explicitly asked, and never let middleware touch `/api/auth/*`.
5. Money: all prices stored in kobo, displayed as ₦ (divide by 100).
6. Spotify sync invariants: sync writes ONLY Spotify (+ matched Apple) links, merging into existing links — manual links (Audiomack, Boomplay…) must survive every re-sync. Admin-edited fields are recorded in `lockedFields` and skipped by sync. Manual releases (`spotifyAlbumId` null) are never touched.
7. CSP/security headers live in `next.config.mjs`. Extend minimally when a new external resource is needed (e.g. Spotify embeds needed `frame-src open.spotify.com`); never loosen broadly.
8. Public release/media images may come from Cloudinary or `i.scdn.co` (`coverExternalUrl`) — keep both paths working.

## Working style (how Nony works)

- Work in stages. After each stage: run `npx tsc --noEmit` and `npm run build`, fix everything, then give a short summary of what changed and STOP and wait for "continue."
- Never modify unrelated features "while you're in there." Booking, contact, shop, events, releases, campus-tour are all live systems.
- Commit messages: conventional style (`feat:`, `fix:`, `security:`). Nony pushes to `master` himself unless he asks you to.
- When a task needs server-side steps (crontab lines, `prisma db push`, `.env` additions, Apache conf), list them verbatim at the end of your summary as "Operator steps" — Nony runs them over SSH.
- Never print or commit real secrets. `.env` is server-side; reference keys by name only and keep `.env.example` updated.

## Key paths

- `src/app/(site)/…` public pages · `src/app/admin/(shell)/…` admin pages · `src/app/api/…` routes
- `src/lib/site-settings.ts` (config helpers) · `src/lib/mailer.ts` · `src/lib/spotify-sync.ts` · `src/lib/ticket-email.ts` · `src/lib/security.ts` (rate limiting, escaping)
- `prisma/schema.prisma` — models include SiteRelease (+ReleaseTrack), Event/TicketTier/EventRegistration/PromoCode, Product/ProductVariant/Order/OrderItem, ShippingRate, BookingRequest(+replies), ContactMessage(+replies), SiteSettings, AdminActivityLog

## Current state (as of handover)

- Live features: scroll hero, booking w/ status workflow + reply threads + 5-hour review reminder cron, contact w/ reply threads, full shop (variants, cart, 3 gateways, state-based shipping), event platform (tiers, promos, QR tickets, check-in, waitlist), Spotify release auto-sync + on-site previews, YouTube sync, SEO/JSON-LD, admin activity log
- Recently deployed: Spotify sync stages — verify QA items (merge survival, lock behavior, preview player) if asked
- Open/known items: Payaza verified only in test mode; systemd unit for local PostgreSQL misbehaves (rc.local handles boot start); mobile responsiveness audit and per-page SEO polish still pending
