import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getPublicBranding } from '@/lib/site-settings'
import BuyNowClient from '@/components/shop/BuyNowClient'

type Props = { params: { slug: string } }

function formatMoney(currency: string, amountMinor: number) {
  const major = amountMinor / 100
  const c = (currency || 'NGN').toUpperCase()
  if (c === 'NGN') return `₦${major.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  if (c === 'USD') return `$${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return `${c} ${major.toFixed(2)}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const branding = await getPublicBranding()
  const suffix = branding.metaTitleSuffix?.trim() || '| Yadah'
  let product = null
  try {
    product = await prisma.product.findUnique({ where: { slug: params.slug } })
  } catch {
    product = null
  }
  if (!product) return { title: `Product ${suffix}`.trim() }
  return {
    title: `${product.name} ${suffix}`.trim(),
    description: product.description?.trim() || product.name,
    openGraph: product.images[0] ? { images: [{ url: product.images[0] }] } : undefined,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  let product = null
  try {
    product = await prisma.product.findUnique({ where: { slug: params.slug } })
  } catch {
    product = null
  }
  if (!product) notFound()

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null)
  const stripeReady =
    Boolean(settings?.stripeEnabled) &&
    Boolean(settings?.stripeSecretKey?.trim() || process.env.STRIPE_SECRET_KEY)

  const related = await prisma.product
    .findMany({
      where: { NOT: { id: product.id } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    })
    .catch(() => [])

  const branding = await getPublicBranding()
  const mail = branding.contactEmail || branding.bookingEmail || 'yadahsings@gmail.com'

  return (
    <div className="min-h-screen pt-36 pb-28 px-8 md:px-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-screen-lg mx-auto">
        <Link href="/shop" className="ui-label text-muted hover:text-accent transition-colors">
          ← Shop
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <div className="manuscript-frame relative aspect-square w-full max-w-md overflow-hidden bg-surface shadow-[0_4px_24px_rgba(13,11,8,0.08)]">
              {product.images[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 420px" priority />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center ui-label text-muted">No image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.images.slice(1).map((src) => (
                  <div key={src} className="relative h-16 w-16 overflow-hidden rounded border border-gold-light/20">
                    <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.category && <p className="eyebrow mb-4">{product.category}</p>}
            <h1 className="display-3 text-body mb-4">{product.name}</h1>
            <p className="font-playfair text-2xl text-accent mb-8">{formatMoney(product.currency, product.price)}</p>
            {product.description && <p className="body-lg mb-10 whitespace-pre-wrap">{product.description}</p>}

            {stripeReady && product.inStock ? (
              <BuyNowClient productSlug={product.slug} />
            ) : stripeReady && !product.inStock ? (
              <p className="body-sm text-muted">This item is currently out of stock.</p>
            ) : (
              <p className="body-sm text-muted">
                Contact us to order:{' '}
                <a href={`mailto:${mail}?subject=Order%3A%20${encodeURIComponent(product.name)}`} className="link-underline text-accent">
                  {mail}
                </a>
              </p>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24 border-t border-gold-light/20 pt-16">
            <p className="eyebrow mb-6">More</p>
            <h2 className="display-3 text-body mb-10">Related products</h2>
            <ul className="grid gap-8 sm:grid-cols-3">
              {related.map((r) => (
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
                    <p className="ui-label mt-1 text-accent">{formatMoney(r.currency, r.price)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
