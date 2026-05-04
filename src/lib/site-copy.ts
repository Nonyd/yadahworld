import type { Prisma } from '@prisma/client'

/** All values are strings; nested objects for grouping. */
export type SiteCopyTree = { [key: string]: string | SiteCopyTree }

function isTree(x: unknown): x is SiteCopyTree {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function deepMergeCopy(defaults: SiteCopyTree, patch: unknown): SiteCopyTree {
  const out: SiteCopyTree = structuredClone(defaults)
  if (!isTree(patch)) return out
  for (const key of Object.keys(patch)) {
    const pv = patch[key]
    const dv = out[key]
    if (typeof pv === 'string') out[key] = pv
    else if (isTree(pv)) {
      out[key] = deepMergeCopy(isTree(dv) ? dv : {}, pv)
    }
  }
  return out
}

/** Default public copy — overridden by `SiteSettings.siteContentJson`. */
export const DEFAULT_SITE_COPY: SiteCopyTree = {
  nav: {
    home: 'Home',
    media: 'Media',
    about: 'About',
    roomForYou: 'Room For You',
    roomForYouUrl: 'https://rfyglobal.org',
    releases: 'Releases',
    contact: 'Contact',
    booking: 'Booking',
    shop: 'Shop',
  },
  footer: {
    preFooterTitle: 'Have you heard the good news?',
    preFooterSubtitle: 'You can live forever by believing in Jesus.',
    preFooterCta: 'Book Yadah',
    taglineQuote: 'The Voice of Jesus Christ to Nations.',
    colNavigate: 'Navigate',
    colMinistry: 'Ministry',
    colConnect: 'Connect',
    linkHome: 'Home',
    linkMedia: 'Media',
    linkMinistrations: 'Ministrations',
    linkAbout: 'About',
    linkReleases: 'Releases',
    linkContact: 'Contact',
    linkBooking: 'Booking',
    linkShop: 'Shop',
    ministryRoomForYou: 'Room For You',
    ministryCampusTour: 'Campus Tour',
    ministryEvents: 'Events',
    connectInstagram: 'Instagram',
    connectYoutube: 'YouTube',
    connectSpotify: 'Spotify',
    connectFacebook: 'Facebook',
    connectX: 'X (Twitter)',
    connectTiktok: 'TikTok',
    bottomPrivacy: 'Privacy Policy',
    bottomCookie: 'Cookie Policy',
    creditLine: 'Designed with Love by SonsHub Media',
    creditHref: 'https://sonshubmedia.com',
    refundLink: 'Refund & Returns',
  },
  home: {
    heroDefaultEyebrow: '01 — The Voice of Jesus Christ to Nations',
    heroRoleLine: 'Gospel music minister',
    heroStreamsLine: '100M+ streams',
    heroLocationFallback: 'Abuja, Nigeria',
    mantraEyebrow: '02 — Her Mantra',
    mantraLine1: '"I believe in the one and only true God.',
    mantraLine2: "I believe in Christ's cross and all",
    mantraLine3: 'that it is to a believer."',
    mantraAttribution: '— Yadah Kukeurim Daniel',
    aboutEyebrow: '03 — The Artist',
    aboutHeading1: 'A Voice Sent',
    aboutHeading2: 'From Heaven.',
    aboutStat1n: '100M+',
    aboutStat1l: 'Streams',
    aboutStat2n: '600K+',
    aboutStat2l: 'Followers',
    aboutStat3n: '7+',
    aboutStat3l: 'Years of Ministry',
    aboutReadStory: 'Read Her Story',
    musicEyebrow: '04 — The Sound',
    musicHeading1: 'Recent',
    musicHeading2: 'Releases.',
    musicAllReleases: 'All Releases',
    videosEyebrow: '05 — The Visual',
    videosHeading1: 'Latest',
    videosHeading2: 'Videos.',
    videosSeeMore: 'See More',
    streamMarqueeLines:
      'Beyond Me\n· 100M+ Streams ·\nOnye Nwere Jesus\n· God in All Seasons ·\nFathered By The Best\n· Never Seen ·\nFree of Charge\n· Na Your Hand ·',
    eventsEyebrow: '06 — On the Road',
    eventsHeading1: 'Ministry',
    eventsHeading2: 'Expressions.',
    eventsDetails: 'Details',
    eventsBookInquire: 'Book / inquire',
    bookingEyebrow: '07 — Invite Yadah',
    bookingLine1: 'Yadah is always',
    bookingLine2: 'glad to be',
    bookingLine3: 'a blessing.',
    bookingSubline: 'Concert · Church Conference · Worship Night · Album Launch',
    bookingCta: 'Submit Booking Request',
  },
  media: {
    eyebrow: 'Library',
    title: 'Media',
    tabVideos: 'Videos',
    tabPhotos: 'Photos',
    watchYoutube: 'Watch on YouTube →',
  },
  aboutPage: {
    heroEyebrow: 'The Artist',
    heroTitle: 'Yadah.',
    heroSubtitle: 'The Voice Of Jesus To Nations.',
    blockquote:
      'I believe in the one and only true God. I believe in Christ\'s cross and all that it is to a believer!!',
    body1:
      "Yadah Kukeurim Daniel, professionally known as Yadah, is a distinguished Nigerian singer, songwriter, and fashion designer whose impactful music centers on the themes of God's love and grace. Based in Abuja, Nigeria, Yadah has carved a significant niche in contemporary gospel music, captivating audiences worldwide with her soulful melodies and profound lyrical content.",
    body2:
      'She made her official debut in 2017 with "Goodie Goodie" under the management of SonsHub Media. Her discography includes hit songs such as "Beyond Me", "Never Seen", "Onye Nwere Jesus", "Free of Charge", and "Na Your Hand" — collectively garnering over 100 million streams globally.',
    stat1n: '100M+',
    stat1l: 'Streams Globally',
    stat2n: '600K+',
    stat2l: 'Social Followers',
    stat3n: '7+',
    stat3l: 'Years Ministry',
    ctaLine: 'Want to invite Yadah to your event?',
    ctaButton: 'Book Yadah',
  },
  bookingPage: {
    eyebrow: 'Invitations',
    heading1: 'Book',
    heading2: 'Yadah.',
    intro:
      'Yadah is always glad to be a blessing to the body of Christ. Please provide all necessary information about your event below.',
    note: 'Note: This form is for scheduling purposes only and does not confirm an event.',
  },
  contactPage: {
    eyebrow: 'Get in Touch',
    title: 'Contact.',
    body:
      "For general enquiries, press, partnerships, or questions about Yadah's ministry. For event bookings, please use the {{booking}}.",
    bookingUrl: '/booking',
    bookingLinkLabel: 'Booking page',
    labelLocation: 'Location',
    labelPhone: 'Phone',
    labelEmail: 'Email',
  },
  campusTour: {
    eyebrow: 'Ministry',
    headingLine1: 'Campus',
    headingLine2: 'Tour.',
    body1:
      'Campus Tour is a ministry expression — taking worship, the good news of Jesus, and the presence of God into campuses and communities. It sits alongside other outreaches such as {{rfy}}, pointing people to salvation, discipleship, and a life with Christ.',
    body2:
      'Details for upcoming Campus Tour stops, cities, and how to host or partner are shared through official channels. For ministry bookings and appearances, use the booking form — we will respond with next steps.',
    rfyLinkLabel: 'Room For You',
    bookCta: 'Book Yadah',
    contactCta: 'Contact',
  },
  shop: {
    eyebrow: 'The Store',
    heading1: 'Shop',
    heading2: 'Yadah.',
    emptyTitle: 'No products yet. Add your first product.',
    emptyBody: 'For merch and ministry updates, you can also visit Room For You Global.',
    emptyCta: 'Room For You',
  },
  releases: {
    eyebrow: 'Discography',
    title: 'Releases',
    intro: 'Each release has its own page with streaming links when you add them in the studio.',
    badgeNew: 'New',
  },
  releaseDetail: {
    backLink: '← All releases',
    eyebrow: 'Discography',
    listenSpotify: 'Listen on Spotify →',
    listenApple: 'Apple Music →',
    listenYoutube: 'Watch on YouTube →',
    spotifyEmbedHeading: 'Listen on Spotify',
    musicVideoHeading: 'Music video',
    bookingTeaserBefore: 'Looking for a live experience? ',
    bookingTeaserLink: 'Book Yadah',
    bookingTeaserAfter: ' for your event.',
    moreEyebrow: 'Discography',
    moreTitle: 'More releases',
    bodyFallback: "This release is part of Yadah's discography.",
  },
  legal: {
    privacyEyebrow: 'Legal',
    privacyTitle: 'Privacy Policy',
    privacyBody:
      'This is a placeholder page. Replace with your full privacy policy covering data collection, cookies, mailing lists, and booking form data retention (aligned with SonsHub Media / Yadah management practices).',
    refundEyebrow: 'Legal',
    refundTitle: 'Refund & Returns',
    refundBody:
      "Placeholder policy for merchandise orders. Update with your store's refund windows, defective item process, and digital product rules when the shop goes live.",
    cookieEyebrow: 'Legal',
    cookieTitle: 'Cookie Policy',
    cookieBody:
      'This site may use cookies and similar technologies to improve your experience, remember preferences, and understand traffic. Update this text to match your actual cookie categories, consent banner, and third-party tools.',
  },
  contactForm: {
    successTitle: 'Message sent.',
    successBody: 'Thank you for reaching out. We will be in touch shortly.',
    nameLabel: 'Your Name',
    namePh: 'Full name',
    emailLabel: 'Email Address',
    emailPh: 'your@email.com',
    subjectLabel: 'Subject',
    subjectPh: 'How can we help?',
    messageLabel: 'Message',
    messagePh: 'Write your message…',
    submit: 'Send message',
    sending: 'Sending…',
  },
}

export type SiteCopy = SiteCopyTree

export function mergeSiteContent(json: Prisma.JsonValue | null | undefined): SiteCopy {
  return deepMergeCopy(DEFAULT_SITE_COPY, json)
}

export function listSiteCopyDotPaths(): string[] {
  const out: string[] = []
  const walk = (node: SiteCopyTree, prefix: string) => {
    for (const [k, v] of Object.entries(node)) {
      const p = prefix ? `${prefix}.${k}` : k
      if (typeof v === 'string') out.push(p)
      else walk(v, p)
    }
  }
  walk(DEFAULT_SITE_COPY, '')
  return out
}

export function getCopyString(copy: SiteCopy, path: string): string {
  const parts = path.split('.')
  let cur: unknown = copy
  for (const part of parts) {
    if (!isTree(cur)) return ''
    cur = cur[part]
  }
  return typeof cur === 'string' ? cur : ''
}

export function roomForYouHrefFromCopy(copy: SiteCopy): string {
  return getCopyString(copy, 'nav.roomForYouUrl').trim() || 'https://rfyglobal.org'
}

export function bookingHrefFromCopy(copy: SiteCopy): string {
  return getCopyString(copy, 'contactPage.bookingUrl').trim() || '/booking'
}

export type PublicNavLink = { label: string; href: string; external?: boolean }

/** Navbar rows — hrefs for Room For You and Booking follow Site text URLs. */
export function buildPublicNavLinks(copy: SiteCopy): PublicNavLink[] {
  const rfy = roomForYouHrefFromCopy(copy)
  const book = bookingHrefFromCopy(copy)
  return [
    { label: 'Home', href: '/' },
    { label: 'Media', href: '/media' },
    { label: 'About', href: '/about' },
    { label: 'Room For You', href: rfy, external: /^https?:\/\//i.test(rfy) },
    { label: 'Releases', href: '/releases' },
    { label: 'Contact', href: '/contact' },
    { label: 'Booking', href: book, external: /^https?:\/\//i.test(book) },
    { label: 'Shop', href: '/shop' },
  ]
}

/** Map nav `href` → label for `Navbar` (internal paths + configurable URLs). */
export function navLabelsFromCopy(copy: SiteCopy): Record<string, string> {
  const rfy = roomForYouHrefFromCopy(copy)
  const book = bookingHrefFromCopy(copy)
  return {
    '/': getCopyString(copy, 'nav.home'),
    '/media': getCopyString(copy, 'nav.media'),
    '/about': getCopyString(copy, 'nav.about'),
    [rfy]: getCopyString(copy, 'nav.roomForYou'),
    '/releases': getCopyString(copy, 'nav.releases'),
    '/contact': getCopyString(copy, 'nav.contact'),
    [book]: getCopyString(copy, 'nav.booking'),
    '/shop': getCopyString(copy, 'nav.shop'),
  }
}

export function buildSiteContentJsonFromDotMap(map: Record<string, string>): SiteCopyTree {
  const root: SiteCopyTree = {}
  for (const [path, value] of Object.entries(map)) {
    const parts = path.split('.')
    let cur: SiteCopyTree = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      if (i === parts.length - 1) {
        cur[part] = value
      } else {
        const next = cur[part]
        if (!isTree(next)) cur[part] = {}
        cur = cur[part] as SiteCopyTree
      }
    }
  }
  return root
}
