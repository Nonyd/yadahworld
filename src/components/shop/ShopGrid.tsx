import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@prisma/client'
import PublicHrefLink from '@/components/ui/PublicHrefLink'
import { getCopyString, roomForYouHrefFromCopy, type SiteCopy } from '@/lib/site-copy'

function formatMoney(currency: string, amountMinor: number) {
  const major = amountMinor / 100
  const c = (currency || 'NGN').toUpperCase()
  if (c === 'NGN') {
    return `₦${major.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  if (c === 'USD') {
    return `$${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: c }).format(major)
  } catch {
    return `${c} ${major.toFixed(2)}`
  }
}

export default function ShopGrid({ products, copy }: { products: Product[]; copy: SiteCopy }) {
  const s = (k: string) => getCopyString(copy, `shop.${k}`)
  const roomForYouHref = roomForYouHrefFromCopy(copy)

  if (!products.length) {
    return (
      <div className="max-w-xl">
        <p className="body-lg mb-6 text-muted">{s('emptyTitle')}</p>
        <p className="body-sm text-muted">{s('emptyBody')}</p>
        <PublicHrefLink href={roomForYouHref} className="btn-outline mt-6 inline-flex">
          {s('emptyCta')}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </PublicHrefLink>
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => {
        const img = p.images[0]
        return (
          <Link key={p.id} href={`/shop/${p.slug}`} className="group block">
            <article
              className="relative overflow-hidden border manuscript-frame bg-surface/50"
              style={{ borderColor: 'rgba(42,37,32,0.1)' }}
            >
              <div className="relative aspect-square bg-surface">
                {img ? (
                  <Image
                    src={img}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center ui-label text-muted">No image</div>
                )}
                {!p.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-deep/70 backdrop-blur-[2px]">
                    <span className="rounded-full border border-ivory/40 bg-deep/80 px-4 py-2 font-jost text-[10px] font-medium uppercase tracking-[0.2em] text-ivory">
                      Out of stock
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="font-playfair text-xl text-body mb-2 group-hover:text-accent transition-colors">{p.name}</h2>
                {p.description && <p className="body-sm line-clamp-2 mb-4 text-muted">{p.description}</p>}
                <p className="ui-label text-accent">{formatMoney(p.currency, p.price)}</p>
              </div>
            </article>
          </Link>
        )
      })}
    </div>
  )
}
