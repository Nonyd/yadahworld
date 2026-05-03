import { getCopyString } from '@/lib/site-copy'
import { getSiteCopy } from '@/lib/site-settings'

export default async function RefundPolicyPage() {
  const copy = await getSiteCopy()
  const l = (k: string) => getCopyString(copy, `legal.${k}`)

  return (
    <div className="min-h-screen pt-40 pb-24 px-8 md:px-20 bg-bg">
      <div className="max-w-2xl mx-auto">
        <p className="eyebrow mb-4">{l('refundEyebrow')}</p>
        <h1 className="display-3 text-body mb-8">{l('refundTitle')}</h1>
        <p className="body-lg">{l('refundBody')}</p>
      </div>
    </div>
  )
}
