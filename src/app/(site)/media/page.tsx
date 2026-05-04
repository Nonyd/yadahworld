import MediaPageClient from '@/components/media/MediaPageClient'
import { getPublicMusicVideosForMedia } from '@/lib/site-content'
import { getGalleryUrls, getSiteCopy } from '@/lib/site-settings'

export default async function MediaPage() {
  const [videos, galleryUrls, copy] = await Promise.all([getPublicMusicVideosForMedia(), getGalleryUrls(), getSiteCopy()])
  return <MediaPageClient videos={videos} galleryUrls={galleryUrls} copy={copy} />
}
