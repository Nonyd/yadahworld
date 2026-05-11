import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://yadahworld.com'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/events/*?*ical=1',
        '/events/*?*outlook-ical=1',
        '/events/list/',
        '/events/month/',
        '/event-category/',
        '/*?tribe-bar-date*',
        '/*?tribe_venue*',
        '/*?__wpdm*',
        '/release-category*',
        '/releases/page/',
        '/gallery-category*',
        '/download/',
        '/discography/',
        '/embed/',
        '/yalic/',
        '/legal/',
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}