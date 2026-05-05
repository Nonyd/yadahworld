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

  const releases = await prisma.siteRelease.findMany({ select: { slug: true, updatedAt: true } })
  const releasePages = releases.map((r) => ({
    url: `${base}/releases/${r.slug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const eventPages: MetadataRoute.Sitemap = []

  return [...staticPages, ...releasePages]
}
