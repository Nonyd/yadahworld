import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getPublicBranding } from '@/lib/site-settings'
import ProductShopDetail from '@/components/shop/ProductShopDetail'
import { formatNgnKobo } from '@/lib/shop-money'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const branding = await getPublicBranding()
  const suffix = branding.metaTitleSuffix?.trim() || '| Yadah'
  let product = null
  try {
    product = await prisma.product.findFirst({
      where: { slug: params.slug, isActive: true },
    })
  } catch {
    product = null
  }
  if (!product) return { title: `Product ${suffix}`.trim() }
  return {
    title: `${product.name} ${suffix}`.trim(),
    description: product.description?.replace(/<[^>]+>/g, ' ').trim().slice(0, 160) || product.name,
    openGraph: product.images[0] ? { images: [{ url: product.images[0] }] } : undefined,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product = null
  try {
    product = await prisma.product.findFirst({
      where: { slug: params.slug, isActive: true },
      include: { variants: true },
    })
  } catch {
    product = null
  }
  if (!product) notFound()

  const related = await prisma.product
    .findMany({
      where: { NOT: { id: product.id }, isActive: true },
      include: { variants: true },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 3,
    })
    .catch(() => [])

  return (
    <div className="min-h-screen pt-36 pb-28 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <Link href="/shop" className="ui-label text-muted hover:text-accent transition-colors">
          ← Shop
        </Link>

        <ProductShopDetail product={product} />

        {related.length > 0 && (
          <section className="mt-24 border-t border-[rgba(42,37,32,0.1)] pt-16">
            <p className="eyebrow mb-6">More</p>
            <h2 className="display-3 text-body mb-10">Related products</h2>
            <ul className="grid gap-8 sm:grid-cols-3">
              {related.map((r) => {
                const v0 = r.variants[0]
                const price = v0 ? v0.price ?? r.price : r.price
                return (
                  <li key={r.id}>
                    <Link href={`/shop/${r.slug}`} className="group block">
                      <div className="manuscript-frame relative mb-4 aspect-square overflow-hidden bg-surface">
                        {r.images[0] ? (
                          <Image
                            src={r.images[0]}
                            alt={r.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width:768px) 100vw, 33vw"
                          />
                        ) : null}
                      </div>
                      <p className="font-playfair text-lg text-body group-hover:text-accent">{r.name}</p>
                      <p className="ui-label mt-1 text-accent">{formatNgnKobo(price)}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
