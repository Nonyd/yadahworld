import MediaPageClient from '@/components/media/MediaPageClient'
import { getPublicMusicVideosForMedia, getPublicPlaylistsForMedia } from '@/lib/site-content'
import { getGalleryUrls, getSiteCopy } from '@/lib/site-settings'

export default async function MediaPage() {
  const [{ videos, total }, playlists, galleryUrls, copy] = await Promise.all([
    getPublicMusicVideosForMedia(),
    getPublicPlaylistsForMedia(),
    getGalleryUrls(),
    getSiteCopy(),
  ])
  return (
    <MediaPageClient
      videos={videos}
      videoTotal={total}
      playlists={playlists}
      galleryUrls={galleryUrls}
      copy={copy}
    />
  )
}
