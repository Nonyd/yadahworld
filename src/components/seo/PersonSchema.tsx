export default function PersonSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://yadahworld.com/#yadah',
        name: 'Yadah Kukeurim Daniel',
        alternateName: 'Yadah',
        description:
          'Yadah Kukeurim Daniel, professionally known as Yadah, is one of the top female gospel music ministers in Nigeria. A leading worship minister, singer, and songwriter based in Abuja, Nigeria, with millions of lives impacted globally.',
        url: 'https://yadahworld.com',
        image:
          'https://res.cloudinary.com/dxliuat50/image/upload/v1777918925/yadahworld/site/voxdyeip8crn9czxrrxx.png',
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
        sameAs: ['https://open.spotify.com/artist/6g6Ks0QTbGQ8qrZV6QV6Qk', 'https://www.youtube.com/@yadahworld'],
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

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}
