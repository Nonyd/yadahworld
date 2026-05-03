import Image from 'next/image'
import type { Product } from '@prisma/client'

function formatMoney(currency: string, amountMinor: number) {
  const major = amountMinor / 100
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency === 'NGN' ? 'NGN' : 'USD' }).format(major)
  } catch {
    return `${currency} ${major.toFixed(2)}`
  }
}

export default function ShopGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="max-w-xl">
        <p className="body-lg mb-6">
          The online store is being prepared. For merch and ministry updates, visit Room For You Global.
        </p>
        <a href="https://rfyglobal.org" target="_blank" rel="noopener noreferrer" className="btn-outline">
          Room For You
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((p) => {
        const img = p.images[0]
        return (
          <article
            key={p.id}
            className="group border manuscript-frame overflow-hidden bg-surface/50"
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
            </div>
            <div className="p-6">
              <h2 className="font-playfair text-xl text-body mb-2">{p.name}</h2>
              {p.description && <p className="body-sm line-clamp-2 mb-4">{p.description}</p>}
              <p className="ui-label text-accent">{formatMoney(p.currency, p.price)}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
