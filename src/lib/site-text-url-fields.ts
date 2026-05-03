/** Site text keys that are URLs — shown in a dedicated admin block (not the generic label grid). */
export const SITE_TEXT_URL_FIELDS = [
  {
    path: 'nav.roomForYouUrl',
    title: 'Room For You — link URL',
    hint:
      'Used for the “Room For You” item in the navbar, the footer Ministry column, the {{rfy}} link on the Campus tour page, and the empty-shop CTA. Use a full URL (https://…).',
  },
  {
    path: 'footer.creditHref',
    title: 'Footer credit link',
    hint: 'Destination for the “Designed with Love by…” line at the bottom of the footer.',
  },
  {
    path: 'contactPage.bookingUrl',
    title: 'Booking link',
    hint:
      'Used for the {{booking}} placeholder on Contact, the booking line on single release pages, hero and footer “Book” actions, the booking CTA section, About/Campus tour buttons, and the “Booking” nav item. Use /booking or a full https URL.',
  },
] as const

export const SITE_TEXT_URL_PATH_SET: Set<string> = new Set(SITE_TEXT_URL_FIELDS.map((f) => f.path))
