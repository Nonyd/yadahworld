'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Product, ProductVariant } from '@prisma/client'
import AddToCartButton from '@/components/shop/AddToCartButton'
import PublicHrefLink from '@/components/ui/PublicHrefLink'
import { getCopyString, roomForYouHrefFromCopy, type SiteCopy } from '@/lib/site-copy'
import { formatNgnKobo } from '@/lib/shop-money'

export type ShopProduct = Product & { variants: ProductVariant[] }

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function stockTotal(p: ShopProduct): number {
  if (p.variants.length === 0) return p.type === 'DIGITAL' ? 999 : 0
  return p.variants.reduce((s, v) => s + v.stock, 0)
}

function outOfStock(p: ShopProduct): boolean {
  if (p.type === 'DIGITAL' && p.variants.length === 0) return false
  return stockTotal(p) <= 0
}

export default function ShopProductGrid({ products, copy }: { products: ShopProduct[]; copy: SiteCopy }) {
  const s = (k: string) => getCopyString(copy, `shop.${k}`)
  const roomForYouHref = roomForYouHrefFromCopy(copy)
  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category?.trim()) set.add(p.category.trim())
    })
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [products])
  const [cat, setCat] = useState('All')

  const filtered = useMemo(() => {
    let list = products.filter((p) => (cat === 'All' ? true : (p.category || '').trim() === cat))
    list = [...list].sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [products, cat])

  if (!products.length) {
    return (
      <div className="max-w-xl">
        <p className="body-lg mb-6 text-muted">No products yet. Check back soon.</p>
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
    <div>
      {categories.length > 1 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-2 font-jost text-[10px] font-medium uppercase tracking-[0.16em] transition-colors ${
                cat === c
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-[rgba(42,37,32,0.15)] text-muted hover:border-accent/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const img = p.images[0]
          const oos = outOfStock(p)
          const primaryVariant = p.variants[0]
          const unit = primaryVariant ? primaryVariant.price ?? p.price : p.price
          return (
            <article
              key={p.id}
              className="relative overflow-hidden border manuscript-frame bg-surface/50"
              style={{ borderColor: 'rgba(42,37,32,0.1)' }}
            >
              <Link href={`/shop/${p.slug}`} className="group block">
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
                  {oos && (
                    <div className="absolute inset-0 flex items-center justify-center bg-deep/70 backdrop-blur-[2px]">
                      <span className="rounded-full border border-ivory/40 bg-deep/80 px-4 py-2 font-jost text-[10px] font-medium uppercase tracking-[0.2em] text-ivory">
                        Out of stock
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {p.category && <p className="eyebrow mb-2 text-[10px]">{p.category}</p>}
                  <h2 className="font-playfair text-xl text-body mb-2 group-hover:text-accent transition-colors">{p.name}</h2>
                  {p.description && (
                    <p className="body-sm line-clamp-2 mb-4 text-muted">{stripHtml(p.description).slice(0, 180)}</p>
                  )}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="ui-label text-accent">{formatNgnKobo(unit)}</p>
                    {p.comparePrice != null && p.comparePrice > p.price ? (
                      <p className="ui-label text-muted line-through">{formatNgnKobo(p.comparePrice)}</p>
                    ) : null}
                  </div>
                </div>
              </Link>
              <div className="border-t border-[rgba(42,37,32,0.08)] px-6 pb-6 pt-4">
                {!oos && p.variants.length <= 1 ? (
                  <AddToCartButton
                    label="Add to Cart"
                    item={{
                      productId: p.id,
                      variantId: primaryVariant?.id,
                      name: p.name,
                      variantLabel: primaryVariant ? `${primaryVariant.name}: ${primaryVariant.value}` : undefined,
                      price: unit,
                      image: img ?? '',
                      requiresShipping: p.type === 'PHYSICAL' || p.type === 'BOOK',
                    }}
                  />
                ) : !oos ? (
                  <Link href={`/shop/${p.slug}`} className="btn-outline inline-flex w-full justify-center text-center">
                    Choose options
                  </Link>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
