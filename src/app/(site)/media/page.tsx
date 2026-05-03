import MediaPageClient from '@/components/media/MediaPageClient'
import { getPublicVideos } from '@/lib/site-content'
import { getGalleryUrls } from '@/lib/site-settings'

export default async function MediaPage() {
  const [videos, galleryUrls] = await Promise.all([getPublicVideos(), getGalleryUrls()])
  return <MediaPageClient videos={videos} galleryUrls={galleryUrls} />
}
