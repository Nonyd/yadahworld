'use client'

import PublicVideoCard from '@/components/media/PublicVideoCard'
import type { PublicVideo } from '@/lib/site-content'
import { usePublicVideoLightbox } from '@/components/media/usePublicVideoLightbox'

export default function MinistrationsClient({ videos }: { videos: PublicVideo[] }) {
  const { openAtVideoIndex, videoLightbox } = usePublicVideoLightbox(videos)

  return (
    <div>
      <p className="body-lg text-[var(--muted)] mb-10">
        {videos.length} Ministration Videos
      </p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((v, i) => (
          <PublicVideoCard key={v.id} video={v} videoIndex={i} onPlayClick={openAtVideoIndex} />
        ))}
      </div>
      {videoLightbox}
    </div>
  )
}
