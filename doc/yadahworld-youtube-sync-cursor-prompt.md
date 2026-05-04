# YADAHWORLD — YouTube Playlist Sync System
## Cursor AI Build Prompt

---

## OVERVIEW

Replace the manual SiteVideo system with a YouTube Data API v3 playlist sync system.
Videos are cached in the database from YouTube playlists. A Vercel Cron job syncs 
every 15 minutes. Each playlist is assigned a "slot" that determines where it appears 
on the site. Videos open in a lightbox when clicked.

Credentials:
- YouTube API Key: AIzaSyCvONdovEejCzn1C8Io3k4SwlA1x82PaGI (store in env, not hardcoded)
- Channel ID: UCvNAZbtM-sWGJs0jlA-Tbag
- Ministrations playlist ID: PLezwiS29b1XhSMwEY_owWSvoW8ux4I-9N
- Music Videos playlist ID: PLezwiS29b1XjZxCrSvu5KqZGUhNnZW4VD

---

## PART 1 — ENVIRONMENT VARIABLES

Add to .env.example and .env.local:
```
YOUTUBE_API_KEY=AIzaSyCvONdovEejCzn1C8Io3k4SwlA1x82PaGI
YOUTUBE_CHANNEL_ID=UCvNAZbtM-sWGJs0jlA-Tbag
CRON_SECRET=generate_a_random_string_here
```

Also add YOUTUBE_API_KEY and CRON_SECRET to Vercel environment variables.

---

## PART 2 — PRISMA SCHEMA CHANGES

In prisma/schema.prisma, REPLACE the SiteVideo model entirely and ADD YouTubePlaylist model:

```prisma
enum PlaylistSlot {
  MUSIC_VIDEOS      // Media page videos tab + homepage latest videos
  MINISTRATIONS     // /ministrations page
  GENERAL           // Generic, can be used anywhere
}

model YouTubePlaylist {
  id              String       @id @default(cuid())
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  name            String       // e.g. "Official Music Videos"
  youtubePlaylistId String     @unique // e.g. "PLezwiS29b1XjZxCrSvu5KqZGUhNnZW4VD"
  slot            PlaylistSlot @default(GENERAL)
  maxVideos       Int          @default(50)
  isActive        Boolean      @default(true)
  lastSyncedAt    DateTime?
  videos          CachedVideo[]
}

model CachedVideo {
  id              String          @id @default(cuid())
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  youtubeVideoId  String          @unique // The actual YouTube video ID (e.g. "dQw4w9WgXcQ")
  title           String
  description     String?         @db.Text
  thumbnailUrl    String          // maxres thumbnail from YouTube
  publishedAt     DateTime        // When published on YouTube
  duration        String?         // e.g. "PT4M33S" from YouTube API
  viewCount       String?         // View count string from YouTube
  isActive        Boolean         @default(true) // Admin can hide individual videos
  playlistId      String
  playlist        YouTubePlaylist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
}
```

After editing schema run: npx prisma db push

---

## PART 3 — YOUTUBE SYNC SERVICE

Create src/lib/youtube-sync.ts:

```typescript
import { prisma } from '@/lib/prisma'

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3'

interface YouTubePlaylistItem {
  snippet: {
    title: string
    description: string
    publishedAt: string
    resourceId: { videoId: string }
    thumbnails: {
      maxres?: { url: string }
      high?: { url: string }
      medium?: { url: string }
    }
  }
}

interface YouTubeVideoDetails {
  id: string
  contentDetails: { duration: string }
  statistics: { viewCount: string }
}

export async function syncPlaylist(playlistDbId: string): Promise<{ synced: number; errors: string[] }> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY not set')

  const playlist = await prisma.youTubePlaylist.findUnique({
    where: { id: playlistDbId },
  })
  if (!playlist || !playlist.isActive) return { synced: 0, errors: [] }

  const errors: string[] = []
  let synced = 0
  let nextPageToken: string | undefined

  const allItems: YouTubePlaylistItem[] = []

  // Fetch all pages of playlist items
  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId: playlist.youtubePlaylistId,
      maxResults: '50',
      key: apiKey,
      ...(nextPageToken ? { pageToken: nextPageToken } : {}),
    })

    const res = await fetch(`${YT_API_BASE}/playlistItems?${params}`)
    if (!res.ok) {
      errors.push(`Playlist fetch failed: ${res.status} ${res.statusText}`)
      break
    }

    const data = await res.json()
    allItems.push(...(data.items ?? []))
    nextPageToken = data.nextPageToken
  } while (nextPageToken && allItems.length < playlist.maxVideos)

  const items = allItems.slice(0, playlist.maxVideos)
  if (items.length === 0) return { synced: 0, errors }

  // Fetch video details (duration + view count) in batches of 50
  const videoIds = items.map((i) => i.snippet.resourceId.videoId)
  const detailsMap = new Map<string, YouTubeVideoDetails>()

  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const params = new URLSearchParams({
      part: 'contentDetails,statistics',
      id: batch.join(','),
      key: apiKey,
    })
    const res = await fetch(`${YT_API_BASE}/videos?${params}`)
    if (res.ok) {
      const data = await res.json()
      for (const video of data.items ?? []) {
        detailsMap.set(video.id, video)
      }
    }
  }

  // Upsert each video into the database
  for (const item of items) {
    try {
      const videoId = item.snippet.resourceId.videoId
      const thumbnails = item.snippet.thumbnails
      const thumbnailUrl =
        thumbnails.maxres?.url ?? thumbnails.high?.url ?? thumbnails.medium?.url ?? ''

      const details = detailsMap.get(videoId)

      await prisma.cachedVideo.upsert({
        where: { youtubeVideoId: videoId },
        create: {
          youtubeVideoId: videoId,
          title: item.snippet.title,
          description: item.snippet.description ?? null,
          thumbnailUrl,
          publishedAt: new Date(item.snippet.publishedAt),
          duration: details?.contentDetails?.duration ?? null,
          viewCount: details?.statistics?.viewCount ?? null,
          isActive: true,
          playlistId: playlist.id,
        },
        update: {
          title: item.snippet.title,
          description: item.snippet.description ?? null,
          thumbnailUrl,
          duration: details?.contentDetails?.duration ?? null,
          viewCount: details?.statistics?.viewCount ?? null,
          // Don't overwrite isActive — admin may have hidden a video
        },
      })
      synced++
    } catch (err) {
      errors.push(`Video ${item.snippet.resourceId.videoId}: ${String(err)}`)
    }
  }

  // Update lastSyncedAt
  await prisma.youTubePlaylist.update({
    where: { id: playlistDbId },
    data: { lastSyncedAt: new Date() },
  })

  return { synced, errors }
}

export async function syncAllPlaylists() {
  const playlists = await prisma.youTubePlaylist.findMany({
    where: { isActive: true },
  })
  const results = []
  for (const playlist of playlists) {
    const result = await syncPlaylist(playlist.id)
    results.push({ name: playlist.name, ...result })
  }
  return results
}

// Helper to get videos for a specific slot
export async function getVideosBySlot(slot: string, limit?: number) {
  return prisma.cachedVideo.findMany({
    where: {
      isActive: true,
      playlist: { slot: slot as any, isActive: true },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
    include: { playlist: true },
  })
}
```

---

## PART 4 — VERCEL CRON JOB

Create src/app/api/cron/sync-youtube/route.ts:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { syncAllPlaylists } from '@/lib/youtube-sync'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await syncAllPlaylists()
    return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('YouTube sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
```

Create vercel.json (or update existing):
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-youtube",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

Note: Vercel Cron automatically adds the correct authorization header. 
The CRON_SECRET provides extra protection against external calls.

---

## PART 5 — ADMIN PLAYLIST MANAGEMENT

### New admin route: /admin/playlists

Create these files:
- src/app/admin/(shell)/playlists/page.tsx
- src/app/admin/(shell)/playlists/new/page.tsx  
- src/app/admin/(shell)/playlists/[id]/page.tsx
- src/components/admin/cms/PlaylistForm.tsx
- src/components/admin/cms/DeletePlaylistButton.tsx
- src/app/api/admin/playlists/route.ts (GET, POST)
- src/app/api/admin/playlists/[id]/route.ts (PATCH, DELETE)
- src/app/api/admin/playlists/[id]/sync/route.ts (POST — trigger sync for one playlist)

### Playlists list page (src/app/admin/(shell)/playlists/page.tsx):

Display a table with columns:
- Playlist name
- Slot (MUSIC_VIDEOS / MINISTRATIONS / GENERAL)
- YouTube Playlist ID
- Videos cached (count from CachedVideo)
- Last synced (relative time, e.g. "3 minutes ago")
- Status (Active/Inactive toggle)
- Actions: Edit | Sync Now | Delete

"Sync All" button at top right — calls POST /api/admin/playlists/sync-all
"Add Playlist" button — links to /admin/playlists/new

Show last global sync time at top.

### Playlist form fields (src/components/admin/cms/PlaylistForm.tsx):
- Name (text, required) — e.g. "Official Music Videos"
- YouTube Playlist URL or ID (text, required)
  - Accept full URL like https://www.youtube.com/playlist?list=PLezwi...
  - OR just the playlist ID like PLezwi...
  - Auto-extract the ID from URL on blur
  - Show extracted ID below the input
- Slot (select):
  - MUSIC_VIDEOS — "Media page + Homepage latest videos"
  - MINISTRATIONS — "/ministrations page"
  - GENERAL — "General use"
- Max Videos (number, default 50, min 1, max 200)
- Active (toggle)

On create: immediately trigger a sync after saving.

### Sync API (src/app/api/admin/playlists/[id]/sync/route.ts):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { syncPlaylist } from '@/lib/youtube-sync'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await syncPlaylist(params.id)
    return NextResponse.json({ success: true, ...result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
```

### Sync All API (src/app/api/admin/playlists/sync-all/route.ts):
Same pattern but calls syncAllPlaylists().

### Update AdminSidebar:
Add "Playlists" link between "Videos" and "Releases":
{ label: 'Playlists', href: '/admin/playlists', icon: '▶' }

### Remove old Videos admin:
- Keep /admin/videos as a redirect to /admin/playlists
- OR repurpose /admin/videos to show CachedVideo list with hide/show toggles
  (recommended — keep the video list for admin to hide specific videos)

### Update /admin/videos to show CachedVideo list:
Instead of VideoForm (manual entry), show:
- Table of all CachedVideo rows ordered by publishedAt desc
- Columns: Thumbnail (40px), Title, Playlist name, Published date, Views, Active toggle
- Active toggle calls PATCH /api/admin/videos/[id] { isActive: boolean }
- No "Add Video" button (videos come from YouTube sync only)
- "Manage Playlists" button links to /admin/playlists

---

## PART 6 — LIGHTBOX FOR ALL VIDEO CARDS

All video cards across the site should open a YouTube lightbox when clicked 
instead of linking to YouTube.

The existing usePublicVideoLightbox hook and yet-another-react-lightbox with 
the youtube plugin should handle this. Ensure it works for CachedVideo.

### Update src/components/media/PublicVideoCard.tsx:

The card receives a CachedVideo object. On click, opens lightbox with the 
YouTube embed. 

Card design:
- 16:9 aspect ratio container
- Thumbnail image (fill, object-cover)
- Dark gradient overlay at bottom
- Centered play button: white circle with oxblood/dark play triangle inside
  - On hover: circle scales to 1.1, shadow appears
- Title text at bottom-left over gradient
- Duration badge top-right (if available) — parse ISO 8601 duration to "4:33"
- Published date bottom-right in small text

```tsx
// Duration parser helper
function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''
  const h = match[1] ? `${match[1]}:` : ''
  const m = match[2] ?? '0'
  const s = (match[3] ?? '0').padStart(2, '0')
  return `${h}${h ? m.padStart(2, '0') : m}:${s}`
}
```

### Update usePublicVideoLightbox hook to work with CachedVideo[]:

```typescript
// Input: CachedVideo[]
// Output: { openLightbox: (index: number) => void, LightboxComponent: JSX.Element }
// Use youtubeVideoId as the video ID for the YouTube lightbox plugin
```

---

## PART 7 — PUBLIC PAGES

### 7a. Update Media page (src/app/(site)/media/page.tsx)

Fetch videos from MUSIC_VIDEOS slot:
```typescript
import { getVideosBySlot } from '@/lib/youtube-sync'
const videos = await getVideosBySlot('MUSIC_VIDEOS')
```

Pass to MediaPageClient. Videos tab shows these. 
Grid: grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6
Each card uses PublicVideoCard + lightbox.

### 7b. Update Homepage Videos Section (src/components/home/VideosSection.tsx)

Fetch top 6 from MUSIC_VIDEOS slot ordered by publishedAt desc.
Display in grid-cols-1 md:grid-cols-3 gap-6.
Each card uses PublicVideoCard + lightbox.
"See More" links to /media.

### 7c. New Ministrations page (src/app/(site)/ministrations/page.tsx)

```tsx
import { getVideosBySlot } from '@/lib/youtube-sync'

export const metadata = { title: 'Ministrations' }

export default async function MinistrationsPage() {
  const videos = await getVideosBySlot('MINISTRATIONS')
  
  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-6">Ministry</p>
        <h1 className="display-1 text-[var(--body)] mb-4">
          Live<br />
          <em className="font-playfair italic text-[var(--accent)]">Ministrations.</em>
        </h1>
        <p className="body-lg max-w-lg mb-16">
          Watch Yadah minister live — worship sessions, church services, 
          and moments of encounter with God.
        </p>
        
        <MinistrationsClient videos={videos} />
      </div>
    </div>
  )
}
```

Create src/components/ministrations/MinistrationsClient.tsx:
- Client component (for lightbox)
- Receives CachedVideo[]
- Grid: grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6
- Each card: PublicVideoCard with lightbox
- Total video count shown: "X Ministration Videos"

### 7d. Add /ministrations to Navbar and Footer

Navbar: No change to main nav (keep it clean)
Footer → Navigate column: Add "Ministrations" link → /ministrations
Footer → Events column: keep as-is

---

## PART 8 — SEED THE PLAYLISTS

Update prisma/seed.ts to seed the two playlists on first run:

```typescript
// Upsert playlists
const musicPlaylist = await prisma.youTubePlaylist.upsert({
  where: { youtubePlaylistId: 'PLezwiS29b1XjZxCrSvu5KqZGUhNnZW4VD' },
  create: {
    name: 'Official Music Videos',
    youtubePlaylistId: 'PLezwiS29b1XjZxCrSvu5KqZGUhNnZW4VD',
    slot: 'MUSIC_VIDEOS',
    maxVideos: 50,
    isActive: true,
  },
  update: { name: 'Official Music Videos', slot: 'MUSIC_VIDEOS' },
})

const ministrationsPlaylist = await prisma.youTubePlaylist.upsert({
  where: { youtubePlaylistId: 'PLezwiS29b1XhSMwEY_owWSvoW8ux4I-9N' },
  create: {
    name: 'Live Ministrations',
    youtubePlaylistId: 'PLezwiS29b1XhSMwEY_owWSvoW8ux4I-9N',
    slot: 'MINISTRATIONS',
    maxVideos: 100,
    isActive: true,
  },
  update: { name: 'Live Ministrations', slot: 'MINISTRATIONS' },
})

console.log('Playlists seeded:', musicPlaylist.name, ministrationsPlaylist.name)
```

---

## PART 9 — ADMIN OVERVIEW UPDATE

Update src/app/admin/(shell)/page.tsx overview stats:
- Replace "Videos" stat card with "Playlists" stat card showing playlist count
- Add "Cached Videos" stat card showing total CachedVideo count
- Add "Last Sync" info: show the most recent lastSyncedAt across all playlists

Add a "Sync All Now" button on the overview page that calls the sync-all endpoint.

---

## PART 10 — NEXT.CONFIG UPDATE

Ensure img.youtube.com and i.ytimg.com are in remotePatterns in next.config.mjs:

```javascript
{
  protocol: 'https',
  hostname: 'i.ytimg.com', // YouTube thumbnails
},
{
  protocol: 'https', 
  hostname: 'img.youtube.com',
},
```

---

## PART 11 — AFTER ALL CHANGES

1. Run: npx prisma db push
2. Run: npm run db:seed (to seed the two playlists)
3. Test sync manually: POST /api/admin/playlists/sync-all from admin
   OR go to /admin/playlists and click "Sync All"
4. Verify videos appear in /admin/videos list
5. Verify videos appear on /media and homepage
6. Run: npm run build — fix any TypeScript errors
7. Add to Vercel environment variables:
   YOUTUBE_API_KEY=AIzaSyCvONdovEejCzn1C8Io3k4SwlA1x82PaGI
   YOUTUBE_CHANNEL_ID=UCvNAZbtM-sWGJs0jlA-Tbag
   CRON_SECRET=generate_random_32_char_string
8. Commit: "feat: YouTube playlist sync, cron job, ministrations page, video lightbox"
9. Push to origin

---

## SUMMARY OF WHAT CHANGES

REMOVED:
- SiteVideo model (replaced by YouTubePlaylist + CachedVideo)
- Manual video CRUD forms
- Old /api/admin/videos create/update endpoints (keep PATCH for isActive toggle)

ADDED:
- YouTubePlaylist model
- CachedVideo model  
- src/lib/youtube-sync.ts (sync service)
- src/app/api/cron/sync-youtube/route.ts (cron endpoint)
- src/app/api/admin/playlists/* (playlist CRUD + sync)
- src/app/admin/(shell)/playlists/* (playlist management UI)
- src/app/(site)/ministrations/page.tsx (new public page)
- vercel.json cron schedule (every 15 minutes)
- Lightbox on all video cards

UPDATED:
- Media page → pulls from MUSIC_VIDEOS slot
- Homepage videos section → pulls from MUSIC_VIDEOS slot  
- Admin videos page → shows CachedVideo list with hide/show only
- Admin sidebar → Playlists link
- Admin overview → updated stats
- Footer → Ministrations link
- next.config.mjs → YouTube image domains
- prisma/seed.ts → seeds two playlists
