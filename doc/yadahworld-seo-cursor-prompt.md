# Cursor Prompt — yadahworld.com SEO & AI Search Optimization

Implement comprehensive SEO and AI search optimization for yadahworld.com. Make the following changes exactly. Do not modify any visual UI, component logic, or frontend copy.

---

## 1. Create `src/app/sitemap.ts`

```ts
import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://yadahworld.com'

  const staticPages = [
    '', '/about', '/releases', '/events', '/media',
    '/ministrations', '/gospel', '/contact', '/booking',
    '/campus-tour', '/shop'
  ].map(path => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const releases = await prisma.release.findMany({ select: { slug: true, updatedAt: true } })
  const releasePages = releases.map(r => ({
    url: `${base}/releases/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const events = await prisma.event.findMany({ select: { slug: true, updatedAt: true } })
  const eventPages = events.map(e => ({
    url: `${base}/events/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...releasePages, ...eventPages]
}
```

---

## 2. Create `src/app/robots.ts`

```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://yadahworld.com'
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  }
}
```

---

## 3. Update root metadata in `src/app/layout.tsx`

Replace or update the existing `metadata` export with this:

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yadahworld.com'),
  title: {
    default: 'Yadah — Top Female Gospel Music Minister in Nigeria',
    template: '%s | Yadah',
  },
  description: 'Yadah Kukeurim Daniel is a leading Nigerian female gospel music minister, singer, and songwriter. One of the top worship ministers in Nigeria with millions of lives impacted globally.',
  keywords: [
    'Yadah', 'Yadah gospel', 'Nigerian gospel artist', 'female gospel music minister',
    'top gospel music ministers in Nigeria', 'top female gospel music ministers',
    'gospel artist in Nigeria', 'top worship ministers in Nigeria',
    'Nigerian gospel singer', 'Yadah Kukeurim Daniel', 'SonsHub Media',
    'Beyond Me', 'Never Seen', 'Onye Nwere Jesus', 'God in All Seasons',
  ],
  authors: [{ name: 'Yadah Kukeurim Daniel', url: 'https://yadahworld.com' }],
  creator: 'Yadah Kukeurim Daniel',
  publisher: 'SonsHub Media',
  openGraph: {
    type: 'profile',
    locale: 'en_US',
    url: 'https://yadahworld.com',
    siteName: 'Yadah',
    title: 'Yadah — Top Female Gospel Music Minister in Nigeria',
    description: 'Yadah Kukeurim Daniel is one of the top female gospel music ministers in Nigeria. Her music has reached millions across nations with songs like Beyond Me, Never Seen, and Onye Nwere Jesus.',
    images: [
      {
        url: 'https://res.cloudinary.com/dxliuat50/image/upload/v1777918925/yadahworld/site/voxdyeip8crn9czxrrxx.png',
        width: 1200,
        height: 630,
        alt: 'Yadah — Nigerian Gospel Music Minister',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yadah — Top Female Gospel Music Minister in Nigeria',
    description: 'One of the top worship ministers in Nigeria. Gospel music that carries the presence of God.',
    images: ['https://res.cloudinary.com/dxliuat50/image/upload/v1777918925/yadahworld/site/voxdyeip8crn9czxrrxx.png'],
    creator: '@yadahworld1',
  },
  alternates: {
    canonical: 'https://yadahworld.com',
  },
  verification: {
    google: '', // Leave empty for now — add Google Search Console code after setup
  },
}
```

---

## 4. Create `src/components/seo/PersonSchema.tsx`

This is the most important file for AI search optimization. It tells Google, ChatGPT, Perplexity, and other AI systems exactly who Yadah is as an entity.

```tsx
export default function PersonSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://yadahworld.com/#yadah',
        name: 'Yadah Kukeurim Daniel',
        alternateName: 'Yadah',
        description: 'Yadah Kukeurim Daniel, professionally known as Yadah, is one of the top female gospel music ministers in Nigeria. A leading worship minister, singer, and songwriter based in Abuja, Nigeria, with millions of lives impacted globally.',
        url: 'https://yadahworld.com',
        image: 'https://res.cloudinary.com/dxliuat50/image/upload/v1777918925/yadahworld/site/voxdyeip8crn9czxrrxx.png',
        birthPlace: { '@type': 'Place', name: 'Nigeria' },
        nationality: 'Nigerian',
        jobTitle: ['Gospel Music Minister', 'Worship Minister', 'Singer', 'Songwriter'],
        knowsAbout: ['Gospel Music', 'Worship', 'Christian Ministry', 'Songwriting'],
        genre: ['Gospel', 'Contemporary Gospel', 'Worship'],
        sameAs: [
          'https://open.spotify.com/artist/6g6Ks0QTbGQ8qrZV6QV6Qk',
          'https://www.youtube.com/@yadahworld',
          'https://instagram.com/yadahworld',
          'https://facebook.com/yadahworld',
          'https://twitter.com/yadahworld1',
        ],
      },
      {
        '@type': 'MusicGroup',
        '@id': 'https://yadahworld.com/#yadah-music',
        name: 'Yadah',
        description: 'Nigerian gospel music minister and worship artist Yadah, one of the top female gospel artists in Nigeria.',
        url: 'https://yadahworld.com',
        genre: ['Gospel', 'Christian Music', 'Worship'],
        foundingLocation: { '@type': 'Place', name: 'Abuja, Nigeria' },
        member: { '@id': 'https://yadahworld.com/#yadah' },
        sameAs: [
          'https://open.spotify.com/artist/6g6Ks0QTbGQ8qrZV6QV6Qk',
          'https://www.youtube.com/@yadahworld',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://yadahworld.com/#website',
        url: 'https://yadahworld.com',
        name: 'Yadah',
        description: 'Official website of Yadah — top female gospel music minister in Nigeria',
        publisher: { '@id': 'https://yadahworld.com/#yadah' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://yadahworld.com/?s={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

---

## 5. Add `<PersonSchema />` to `src/app/layout.tsx`

Import `PersonSchema` and render it inside the root layout `<body>` or `<head>`:

```tsx
import PersonSchema from '@/components/seo/PersonSchema'

// Inside the layout return, add anywhere in <body>:
<PersonSchema />
```

---

## 6. Add page-specific metadata to `src/app/(site)/about/page.tsx`

```ts
export const metadata: Metadata = {
  title: 'About Yadah — Nigerian Female Gospel Music Minister',
  description: 'Learn about Yadah Kukeurim Daniel — one of the top female gospel music ministers and worship ministers in Nigeria. Based in Abuja, Nigeria, with 7+ years of ministry and millions of lives touched globally.',
  alternates: { canonical: 'https://yadahworld.com/about' },
  openGraph: {
    title: 'About Yadah — Nigerian Female Gospel Music Minister',
    description: 'Yadah Kukeurim Daniel is one of the top female gospel music ministers in Nigeria with songs like Beyond Me, Never Seen, and Onye Nwere Jesus.',
    url: 'https://yadahworld.com/about',
  },
}
```

---

## 7. Add page-specific metadata to `src/app/(site)/releases/page.tsx`

```ts
export const metadata: Metadata = {
  title: 'Releases — Yadah Gospel Music Discography',
  description: "Explore Yadah's full gospel music discography. Songs include Beyond Me, Never Seen, Onye Nwere Jesus, Free of Charge, Na Your Hand, God in All Seasons, and more.",
  alternates: { canonical: 'https://yadahworld.com/releases' },
}
```

---

## 8. Add page-specific metadata to `src/app/(site)/contact/page.tsx`

```ts
export const metadata: Metadata = {
  title: 'Contact — Book Yadah for Your Event',
  description: "Contact Yadah's ministry team for bookings, press enquiries, or general questions. Book one of Nigeria's top female gospel music ministers for your church, conference, or worship event.",
  alternates: { canonical: 'https://yadahworld.com/contact' },
}
```

---

## Rules

- Do **not** modify any visual UI, page copy, or component logic
- Do **not** show any of these keywords on the frontend
- Do **not** modify any other files beyond those listed above
- All changes are metadata, schema, and SEO infrastructure only
