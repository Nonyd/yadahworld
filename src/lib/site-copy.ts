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
    preFooterTitle: 'A Message',
    preFooterSubtitle: 'You can live forever\nby believing in Jesus.',
    preFooterAttribution: '— Yadah',
    preFooterCta: 'Read the Good News',
    preFooterSecondaryCta: 'Explore Music',
    newsletterEyebrow: 'Stay Connected',
    newsletterBody: 'Ministry updates, new releases,\nand moments from the field.',
    newsletterFinePrint: 'No spam. Unsubscribe at any time.',
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
    connectInstagram: 'Instagram',
    connectYoutube: 'YouTube',
    connectSpotify: 'Spotify',
    connectFacebook: 'Facebook',
    connectX: 'X (Twitter)',
    connectTiktok: 'TikTok',
    bottomPrivacy: 'Privacy Policy',
    bottomCookie: 'Cookie Policy',
    bottomCookieSettings: 'Cookie settings',
    creditLine: 'Designed with Love by SonsHub Media',
    creditHref: 'https://sonshubmedia.com',
    refundLink: 'Refund & Returns',
  },
  home: {
    heroDefaultEyebrow: '01 — The Voice of Jesus Christ to Nations',
    heroRoleLine: 'Gospel music minister',
    /** Hero subline middle segment — separate from legacy `heroStreamsLine` in saved JSON. */
    heroImpactLine: 'Millions of lives impacted',
    heroLocationFallback: 'Abuja, Nigeria',
    mantraEyebrow: '02 — Her Mantra',
    mantraLine1: '"I believe in the one and only true God.',
    mantraLine2: "I believe in Christ's cross and all",
    mantraLine3: 'that it is to a believer."',
    mantraAttribution: '— Yadah Kukeurim Daniel',
    aboutEyebrow: '03 — The Artist',
    aboutHeading1: 'A Voice Sent',
    aboutHeading2: 'From Heaven.',
    aboutStat1n: 'Millions',
    aboutStat1l: 'Lives Impacted Globally',
    aboutStat2n: '600K+',
    aboutStat2l: 'Social Followers',
    aboutStat3n: '7+',
    aboutStat3l: 'Years of Ministry',
    aboutReadStory: 'Read Her Story',
    musicEyebrow: '04 — The Sound',
    /** Homepage music block main title (single line). */
    musicTitle: 'Albums',
    musicHeading1: 'Recent',
    musicHeading2: 'Releases.',
    musicAllReleases: 'All Releases',
    videosEyebrow: '05 — The Visual',
    videosHeading1: 'Latest',
    videosHeading2: 'Videos.',
    videosSeeMore: 'See More',
    streamMarqueeLines:
      'Beyond Me\n· Lives impacted ·\nOnye Nwere Jesus\n· God in All Seasons ·\nFathered By The Best\n· Never Seen ·\nFree of Charge\n· Na Your Hand ·',
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
    bookingCta: 'Reach Out to Us',
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
    mantraEyebrow: 'Her Mantra',
    mantraQuote:
      "I believe in the one and only true God. I believe in Christ's cross and all that it is to a believer.",
    mantraAttribution: '— Yadah Kukeurim Daniel',
    ministerEyebrow: '03 — The Minister',
    stageName: 'Yadah',
    fullName: 'Kukeurim Daniel',
    body1:
      "Yadah Kukeurim Daniel, professionally known as Yadah, is a distinguished Nigerian singer, songwriter, and fashion designer whose impactful music centers on the themes of God's love and grace. Based in Abuja, Nigeria, Yadah has carved a significant niche in contemporary gospel music, captivating audiences worldwide with her soulful melodies and profound lyrical content.",
    faithDeclaration:
      'I believe in the one and only true God. I believe that He gave His Son who came as a man to die for our sins — and that through His death on the cross, we have the remission and forgiveness of sins. I believe that whosoever believes in the Son has eternal life and a hope for the coming glory and manifestation of sons. I believe in Christ\'s cross and all that it is to a believer.',
    body2:
      'She made her official debut in 2017 with "Goodie Goodie" under the management of SonsHub Media. Her discography includes hit songs such as "Beyond Me", "Never Seen", "Onye Nwere Jesus", "Free of Charge", and "Na Your Hand" — songs that have reached people across continents, inviting hearts into worship and the presence of God.',
    stat1n: 'Millions',
    stat1l: 'Lives Touched Globally',
    stat2n: '7+',
    stat2l: 'Years of Ministry',
    stat3n: 'Nations',
    stat3l: 'Reached Through Music',
    ministryEyebrow: 'Ministry',
    ministryLead: 'Yadah is available to minister.',
    ministryBody:
      'If you would like Yadah to minister at your church, conference, or worship event, you are welcome to reach out through the booking page.',
    ministryCta: 'Submit a Booking Request',
    blockquote:
      'I believe in the one and only true God. I believe in Christ\'s cross and all that it is to a believer!!',
    ctaLine: 'Want to invite Yadah to your event?',
    ctaButton: 'Book Yadah',
  },
  gospelPage: {
    heroEyebrow: 'A Message from Yadah',
    heroTitle: 'The Best News You Will Ever Hear.',
    section1Body:
      'We were all born separated from God. Not because He abandoned us — but because sin created a distance between us and Him. And no amount of good works, religion, or effort could bridge that gap.',
    scripture1Text: 'For all have sinned and fall short of the glory of God.',
    scripture1Cite: '— Romans 3:23',
    section2Body:
      'But God, in His immeasurable love, did something extraordinary. He sent His Son — Jesus Christ — to live the life we couldn\'t live, and die the death we deserved. On the cross, Jesus took our sin, our shame, and our separation — and replaced it with His righteousness.',
    scripture2Text:
      'For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.',
    scripture2Cite: '— John 3:16',
    section3Body:
      'Salvation is not earned. It is received. All you have to do is believe — truly believe — that Jesus is Lord, that He died for your sins, and that God raised Him from the dead.',
    scripture3Text:
      "If you declare with your mouth, 'Jesus is Lord,' and believe in your heart that God raised him from the dead, you will be saved.",
    scripture3Cite: '— Romans 10:9',
    prayerEyebrow: 'A Simple Prayer',
    prayerBody: `Lord Jesus, I believe You are the Son of God.
I believe You died for my sins and rose again.
I receive You as my Lord and Saviour.
Forgive me of my sins and give me a new life.
I am Yours.
Amen.`,
    closingBody1:
      'If you just prayed that prayer and meant it — welcome to the family of God. Your life will never be the same.',
    closingBody2:
      "We would love to hear from you. Reach out to Yadah's team and let us know. We want to celebrate with you.",
    ctaContact: 'Get in Touch',
    ctaMusic: "Explore Yadah's Music",
    scripture4Text:
      'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!',
    scripture4Cite: '— 2 Corinthians 5:17',
  },
  ministrationsPage: {
    eyebrow: 'Ministry',
    titleBefore: 'Live',
    titleEmphasis: 'Ministrations.',
    intro: 'Watch Yadah minister live — worship sessions, church services, and moments of encounter with God.',
  },
  eventsPage: {
    eyebrow: 'Ministry',
    title: 'Events.',
    intro: 'Join Yadah live — worship nights, live recordings, conferences, and encounters with God.',
    emptyTitle: 'No upcoming events at this time.',
    emptyBody: 'Check back soon or subscribe to ministry updates.',
    pastEyebrow: 'Past Events',
    badgeComingSoon: 'Coming Soon',
    badgeSoldOut: 'Sold Out',
    badgeOnline: 'Online',
    venueTba: 'Venue TBA',
    tierFree: 'Free',
    tierFromPrefix: 'From',
  },
  unsubscribedPage: {
    eyebrow: 'Newsletter',
    title: 'You have been unsubscribed.',
    body: 'You will no longer receive ministry updates from Yadah. We are sorry to see you go. God bless you.',
    ctaHome: 'Return Home',
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
    eyebrow: 'Reach Out',
    title: "Let's Connect.",
    intro:
      "Whether you have a testimony to share, a question about the ministry, or simply want to say hello — Yadah's team would love to hear from you.",
    bookingPrompt: 'For event bookings, please visit the {{booking}} instead.',
    body:
      "For general enquiries, press, partnerships, or questions about Yadah's ministry. For event bookings, please use the {{booking}}.",
    bookingUrl: '/booking',
    bookingLinkLabel: 'Booking page',
    officeEyebrow: 'Ministry Office',
    connectEyebrow: 'Connect Online',
    prayerEyebrow: 'Prayer Requests',
    prayerBody:
      'Have a testimony or prayer request? We read every message and believe in the power of prayer.',
    connectLabelInstagram: 'Instagram',
    connectLabelYoutube: 'YouTube',
    connectLabelSpotify: 'Spotify',
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
    /** Primary campus-tour modal CTA — use this key so DB `bookCta` overrides do not show legacy “Book Yadah” copy. */
    applyCta: 'APPLY FOR YOUR CAMPUS',
    bookCta: 'APPLY FOR YOUR CAMPUS',
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
    pageSubjectPlaceholder: 'Testimony, prayer request, general enquiry…',
    pageSubmitLabel: 'SEND',
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

/** Split CMS copy on a placeholder token (e.g. `"{{booking}}"`). */
export function splitCopyByToken(text: string, token: string): string[] {
  return text.split(token)
}

/** Turn the last segment of a dot-path into readable words for admin labels. */
export function formatSiteTextLeafLabel(path: string): string {
  const leaf = path.includes('.') ? path.slice(path.lastIndexOf('.') + 1) : path
  const spaced = leaf.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
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
