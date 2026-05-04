import MinistrationsClient from '@/components/ministrations/MinistrationsClient'
import { getPublicMinistrationsVideos } from '@/lib/site-content'

export const metadata = { title: 'Ministrations' }

export default async function MinistrationsPage() {
  const { videos, total } = await getPublicMinistrationsVideos()

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-6">Ministry</p>
        <h1 className="display-1 text-[var(--body)] mb-4">
          Live
          <br />
          <em className="font-playfair italic text-[var(--accent)]">Ministrations.</em>
        </h1>
        <p className="body-lg max-w-lg mb-16">
          Watch Yadah minister live — worship sessions, church services, and moments of encounter with God.
        </p>

        <MinistrationsClient videos={videos} videoTotal={total} />
      </div>
    </div>
  )
}
