import { PrismaClient } from '@prisma/client'
import { images } from '../src/lib/imagePlaceholders'

const prisma = new PrismaClient()

async function main() {
  const releaseSeeds = [
    {
      slug: 'never-seen-live',
      order: 0,
      releasedAt: new Date('2024-08-20T12:00:00.000Z'),
      title: 'Never Seen (Live)',
      feat: 'ft. Sunmisola Agbebi',
      type: 'Single',
      year: '2024',
      cover: images.releaseNeverSeen,
      spotify: 'https://open.spotify.com/search/yadah%20never%20seen',
      isNew: true,
    },
    {
      slug: 'fathered-by-the-best',
      order: 1,
      releasedAt: new Date('2023-11-10T12:00:00.000Z'),
      title: 'Fathered By The Best',
      feat: '',
      type: 'Album',
      year: '2023',
      cover: images.releaseFathered,
      spotify: 'https://open.spotify.com/search/yadah%20fathered',
      isNew: false,
    },
    {
      slug: 'onye-nwere-jesus',
      order: 2,
      releasedAt: new Date('2023-05-18T12:00:00.000Z'),
      title: 'Onye Nwere Jesus',
      feat: '',
      type: 'Single',
      year: '2023',
      cover: images.releaseOnye,
      spotify: 'https://open.spotify.com/search/yadah%20onye',
      isNew: false,
    },
    {
      slug: 'beyond-me',
      order: 3,
      releasedAt: new Date('2022-04-07T12:00:00.000Z'),
      title: 'Beyond Me',
      feat: '',
      type: 'Single',
      year: '2022',
      cover: images.releaseBeyond,
      spotify: 'https://open.spotify.com/search/yadah%20beyond%20me',
      isNew: false,
    },
  ] as const

  for (const r of releaseSeeds) {
    await prisma.siteRelease.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        title: r.title,
        feat: r.feat || null,
        type: r.type,
        year: r.year,
        cover: r.cover,
        spotify: r.spotify,
        spotifyEmbed: null,
        apple: null,
        youtube: null,
        musicVideoYoutube: null,
        description: null,
        isNew: r.isNew,
        order: r.order,
        releasedAt: r.releasedAt,
        showOnHomepage: true,
      },
      update: {
        releasedAt: r.releasedAt,
        order: r.order,
      },
    })
  }

  await prisma.siteEvent.updateMany({
    where: { title: 'Room For You Global' },
    data: { title: 'Room For You' },
  })
  await prisma.siteEvent.updateMany({
    where: { title: 'Worship Night with Yadah' },
    data: { title: 'Campus Tour', link: '/campus-tour' },
  })

  if (!(await prisma.siteEvent.findFirst({ where: { title: 'Room For You' } }))) {
    await prisma.siteEvent.create({
      data: {
        title: 'Room For You',
        description: null,
        date: new Date('2026-06-01T12:00:00.000Z'),
        dateCaption: 'TBA',
        location: 'Multiple cities',
        link: 'https://rfyglobal.org',
        isActive: true,
      },
    })
  }

  if (!(await prisma.siteEvent.findFirst({ where: { title: 'Campus Tour' } }))) {
    await prisma.siteEvent.create({
      data: {
        title: 'Campus Tour',
        description: null,
        date: new Date('2026-12-01T12:00:00.000Z'),
        dateCaption: 'Coming soon',
        location: 'Abuja, Nigeria',
        link: '/campus-tour',
        isActive: true,
      },
    })
  }

  if (!(await prisma.siteVideo.findFirst({ where: { title: 'Never Seen (Live)' } }))) {
    await prisma.siteVideo.create({
      data: {
        title: 'Never Seen (Live)',
        youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        thumbnailUrl: images.videoNeverSeen,
        order: 0,
        isActive: true,
      },
    })
  }

  if (!(await prisma.siteVideo.findFirst({ where: { title: 'Na Your Hand' } }))) {
    await prisma.siteVideo.create({
      data: {
        title: 'Na Your Hand',
        youtubeUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
        thumbnailUrl: images.videoNaYourHand,
        order: 1,
        isActive: true,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
