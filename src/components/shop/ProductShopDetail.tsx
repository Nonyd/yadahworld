'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { Product, ProductVariant } from '@prisma/client'
import AddToCartButton from '@/components/shop/AddToCartButton'
import { formatNgnKobo } from '@/lib/shop-money'

type P = Product & { variants: ProductVariant[] }

function groupByName(variants: ProductVariant[]) {
  const map = new Map<string, ProductVariant[]>()
  for (const v of variants) {
    if (!map.has(v.name)) map.set(v.name, [])
    map.get(v.name)!.push(v)
  }
  return Array.from(map.entries())
}

export default function ProductShopDetail({ product }: { product: P }) {
  const [mainIdx, setMainIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const images = product.images.filter(Boolean)
  const mainSrc = images[mainIdx] ?? images[0]

  const groups = useMemo(() => groupByName(product.variants), [product.variants])
  const singleGroup = groups.length === 1

  const [variantId, setVariantId] = useState(() => product.variants.find((v) => v.stock > 0)?.id ?? product.variants[0]?.id ?? '')

  const activeVariant = product.variants.find((v) => v.id === variantId) ?? null

  const unitPrice = activeVariant ? activeVariant.price ?? product.price : product.price
  const stock = activeVariant?.stock ?? (product.type === 'DIGITAL' && product.variants.length === 0 ? 999 : 0)
  const stockLabel = stock <= 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'

  const variantLabel = activeVariant ? `${activeVariant.name}: ${activeVariant.value}` : undefined
  const requiresShipping = product.type === 'PHYSICAL' || product.type === 'BOOK'

  return (
    <div>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <div className="manuscript-frame relative aspect-square w-full max-w-md overflow-hidden bg-surface shadow-[0_4px_24px_rgba(13,11,8,0.08)]">
            {mainSrc ? (
              <Image src={mainSrc} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 420px" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center ui-label text-muted">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setMainIdx(i)}
                  className={`relative h-16 w-16 overflow-hidden rounded border ${i === mainIdx ? 'border-accent ring-1 ring-accent/30' : 'border-gold-light/20'}`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && <p className="eyebrow mb-4">{product.category}</p>}
          <h1 className="display-3 text-body mb-4">{product.name}</h1>
          <div className="mb-4 flex flex-wrap items-baseline gap-3">
            <p className="font-playfair text-2xl text-accent">{formatNgnKobo(unitPrice)}</p>
            {product.comparePrice != null && product.comparePrice > product.price ? (
              <p className="font-playfair text-lg text-muted line-through">{formatNgnKobo(product.comparePrice)}</p>
            ) : null}
          </div>
          <p className={`ui-label mb-6 ${stock <= 0 ? 'text-accent' : stock <= 5 ? 'text-amber-700' : 'text-muted'}`}>{stockLabel}</p>
          {product.description && (
            <div className="prose prose-sm mb-10 max-w-none text-body dark:prose-invert" dangerouslySetInnerHTML={{ __html: product.description }} />
          )}

          {product.variants.length > 0 && singleGroup && (
            <div className="mb-6">
              <p className="ui-label mb-3">{groups[0][0]}</p>
              <div className="flex flex-wrap gap-2">
                {groups[0][1].map((v: ProductVariant) => {
                  const active = variantId === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={v.stock <= 0}
                      onClick={() => setVariantId(v.id)}
                      className={`rounded-full border px-4 py-2 font-jost text-xs transition-colors ${
                        active ? 'border-accent bg-accent/10 text-accent' : 'border-[rgba(42,37,32,0.15)] text-body hover:border-accent/40'
                      } ${v.stock <= 0 ? 'opacity-40' : ''}`}
                    >
                      {v.value}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {product.variants.length > 0 && !singleGroup && (
            <div className="mb-6">
              <label className="ui-label mb-2 block" htmlFor="variant-select">
                Option
              </label>
              <select
                id="variant-select"
                className="w-full max-w-md border border-[rgba(42,37,32,0.15)] bg-transparent px-4 py-3 font-jost text-sm text-body"
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
              >
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                    {v.name}: {v.value} {v.stock <= 0 ? '(out of stock)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {product.variants.length > 0 && (
            <div className="mb-6 flex max-w-xs items-center gap-4">
              <label className="ui-label shrink-0" htmlFor="qty">
                Quantity
              </label>
              <input
                id="qty"
                type="number"
                min={1}
                max={Math.max(1, Math.min(99, stock))}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Math.min(Math.min(99, stock), parseInt(e.target.value, 10) || 1)))}
                className="w-24 border border-[rgba(42,37,32,0.12)] bg-transparent px-3 py-2 font-jost text-sm text-body"
              />
            </div>
          )}

          {product.type === 'DIGITAL' && (
            <p className="body-sm mb-6 rounded-lg border border-[rgba(42,37,32,0.1)] bg-surface/60 p-4 text-muted">
              Download after purchase — you will receive a link by email when your order is confirmed.
            </p>
          )}

          {product.variants.length === 0 && product.type === 'DIGITAL' ? (
            <AddToCartButton
              item={{
                productId: product.id,
                name: product.name,
                price: unitPrice,
                image: images[0] ?? '',
                quantity: qty,
                requiresShipping,
              }}
              disabled={stock <= 0}
            />
          ) : activeVariant && stock > 0 ? (
            <AddToCartButton
              item={{
                productId: product.id,
                variantId: activeVariant.id,
                name: product.name,
                variantLabel,
                price: unitPrice,
                image: images[0] ?? '',
                quantity: qty,
                requiresShipping,
              }}
            />
          ) : (
            <p className="body-sm text-muted">This item is unavailable.</p>
          )}
        </div>
      </div>
    </div>
  )
}
