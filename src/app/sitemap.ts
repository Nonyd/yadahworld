import { prisma } from '@/lib/prisma'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://yadahworld.com'

  const staticPages = [
    '',
    '/about',
    '/releases',
    '/events',
    '/media',
    '/ministrations',
    '/gospel',
    '/contact',
    '/booking',
    '/campus-tour',
    '/shop',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const releases = await prisma.release.findMany({ select: { slug: true, updatedAt: true } })
  const releasePages = releases.map((r) => ({
    url: `${base}/releases/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const events = await prisma.event.findMany({ select: { slug: true, updatedAt: true } })
  const eventPages = events.map((e) => ({
    url: `${base}/events/${e.slug}`,
    lastModified: e.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...releasePages, ...eventPages]
}
