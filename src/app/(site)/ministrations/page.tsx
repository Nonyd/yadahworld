import MinistrationsClient from '@/components/ministrations/MinistrationsClient'
import { getPublicMinistrationsVideos } from '@/lib/site-content'
import { getCopyString } from '@/lib/site-copy'
import { getSiteCopy } from '@/lib/site-settings'

export const metadata = { title: 'Ministrations' }

export default async function MinistrationsPage() {
  const [{ videos, total }, copy] = await Promise.all([getPublicMinistrationsVideos(), getSiteCopy()])
  const m = (k: string) => getCopyString(copy, `ministrationsPage.${k}`)

  return (
    <div className="min-h-screen pt-40 pb-32 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-xl mx-auto">
        <p className="eyebrow mb-6">{m('eyebrow')}</p>
        <h1 className="display-1 text-[var(--body)] mb-4">
          {m('titleBefore')}
          <br />
          <em className="font-playfair italic text-[var(--accent)]">{m('titleEmphasis')}</em>
        </h1>
        <p className="body-lg max-w-lg mb-16">{m('intro')}</p>

        <MinistrationsClient videos={videos} videoTotal={total} />
      </div>
    </div>
  )
}
