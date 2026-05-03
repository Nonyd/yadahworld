# Yadah World

Official site for **Yadah** — gospel music minister. Built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, GSAP, Lenis, Prisma, and NextAuth.

## Development

```bash
npm install
cp .env.example .env.local
# Set DATABASE_URL, NEXTAUTH_*, ADMIN_*, optional Resend/Stripe
npx prisma db push
npm run dev
```

Deploy on [Vercel](https://vercel.com) with a Neon (or other) PostgreSQL database.
