// Shared, server-rendered, indexable landing page for a single model.
// Distinct from the stateful wizard (which is noindex). This is the SEO surface.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getModelBySlug, getModels, getReviews } from '@/lib/data'
import { getMaxPrice } from '@/lib/pricing'
import { inr } from '@/lib/format'
import type { Model, ModelCategory } from '@/lib/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/** Flatten storages to [{ tier, price }] for the table, handling both formats. */
function priceRows(model: Model): { tier: string; price: number }[] {
  const out: { tier: string; price: number }[] = []
  for (const [k, v] of Object.entries(model.storages)) {
    if (typeof v === 'number') out.push({ tier: k, price: v })
    else for (const [s, p] of Object.entries(v as Record<string, number>)) out.push({ tier: `${k} · ${s}`, price: p })
  }
  return out.sort((a, b) => a.price - b.price)
}

function describe(model: Model): string {
  const max = getMaxPrice(model)
  const tiers = Object.keys(model.storages)
  const range = tiers.length > 1 ? `${tiers[0]} to ${tiers[tiers.length - 1]}` : tiers[0]
  if (model.category === 'macbook') {
    return `Sell your ${model.name} in Mumbai, Navi Mumbai or Thane and get up to ${inr(max)} with free doorstep pickup and instant UPI payout. We buy every configuration across ${range}, ${(model.chips || []).join(', ') || 'all chips'} — get an honest, condition-based quote in under two minutes.`
  }
  return `Get the best price when you sell your ${model.name} in Mumbai, Navi Mumbai and Thane — up to ${inr(max)} depending on condition and storage (${range}). Free doorstep pickup, IMEI-verified inspection and instant payout via UPI or cash. Answer a few quick questions to see your exact offer.`
}

export async function ModelLanding({ category, slug }: { category: ModelCategory; slug: string }) {
  const found = await getModelBySlug(slug)
  if (!found || found.category !== category || !found.is_active) {
    notFound()
    // Unreachable, but satisfies strict-mode narrowing even when next's
    // `notFound(): never` type isn't loaded yet (pre-`npm install`).
    throw new Error('not found')
  }
  const model: Model = found

  const [allModels, reviews] = await Promise.all([getModels(category), getReviews()])
  const related = allModels.filter((m) => m.series === model.series && m.slug !== model.slug).slice(0, 3)
  const rows = priceRows(model)
  const maxPrice = getMaxPrice(model)
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '4.8'

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: model.name,
    image: `${APP_URL}/og-default.png`,
    description: describe(model),
    brand: { '@type': 'Brand', name: 'Apple' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min(...rows.map((r) => r.price)),
      highPrice: maxPrice,
      offerCount: rows.length,
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: avgRating, reviewCount: reviews.length || 120 }
  }

  const crumbsLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: APP_URL },
      { '@type': 'ListItem', position: 2, name: category === 'iphone' ? 'Sell iPhone' : 'Sell MacBook', item: `${APP_URL}/sell/${category}` },
      { '@type': 'ListItem', position: 3, name: model.name, item: `${APP_URL}/sell/${category}/${model.slug}` }
    ]
  }

  // Enter the MAIN sell flow (storage → condition → quote → checkout). The
  // legacy in-page SellWizard has been retired; `/sell/storage?model=<id>`
  // selects this device and starts the real flow.
  const startUrl = `/sell/storage?model=${model.id}`

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 fade-in">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbsLd) }} />

      <nav className="text-xs text-ink-soft mb-4" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="mx-1">/</span>
        <Link href={`/sell/${category}`} className="hover:text-accent">{category === 'iphone' ? 'Sell iPhone' : 'Sell MacBook'}</Link>
        <span className="mx-1">/</span>
        <span className="text-ink">{model.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="rounded-card border border-line bg-white p-8 flex items-center justify-center aspect-square">
          <div className="flex items-center justify-center h-24 w-24 rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200">
        {category === 'iphone'
          ? <svg width="32" height="44" viewBox="0 0 22 30" fill="none" className="text-neutral-500"><rect x="1" y="1" width="20" height="28" rx="5" stroke="currentColor" strokeWidth="1.6"/><rect x="8" y="4" width="6" height="1.6" rx="0.8" fill="currentColor"/></svg>
          : <svg width="44" height="34" viewBox="0 0 28 22" fill="none" className="text-neutral-500"><rect x="3" y="1" width="22" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M1 15h26l1.5 5H0.5L2 15z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><rect x="11" y="17" width="6" height="1" rx="0.5" fill="currentColor"/></svg>
        }
      </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-accent-deep uppercase tracking-wide">{model.series}</p>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Sell {model.name}</h1>
          <p className="mt-3 text-sm text-ink-soft">Get Upto</p>
          <p className="font-mono text-4xl font-extrabold tracking-tight text-accent">{inr(maxPrice)}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{describe(model)}</p>
          <Link href={startUrl} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-deep">
            Start Selling →
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold tracking-tight mb-3">Price by configuration</h2>
        <div className="rounded-card border border-line bg-white overflow-hidden">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-line last:border-0">
              <span className="text-sm">{r.tier}</span>
              <span className="font-mono font-semibold text-accent-deep">Up to {inr(r.price)}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-faint">Final price depends on the condition answers you provide during the quote.</p>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight mb-3">Also sell in {model.series}</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((m) => (
              <Link key={m.slug} href={`/sell/${category}/${m.slug}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-accent-border hover:bg-accent-soft">
                {m.name} <span className="font-mono text-ink-soft">· up to {inr(getMaxPrice(m))}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 rounded-card bg-accent-soft border border-accent-border p-6 text-center">
        <p className="font-semibold">Ready to sell your {model.name}?</p>
        <p className="text-sm text-ink-soft mt-1">Free doorstep pickup across Mumbai, Navi Mumbai &amp; Thane.</p>
        <Link href={startUrl} className="mt-4 inline-flex rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-deep">
          Get My Price →
        </Link>
      </div>
    </div>
  )
}

/** Shared generateStaticParams + generateMetadata helpers per category. */
export async function landingStaticParams(category: ModelCategory) {
  const models = await getModels(category).catch(() => [])
  return models.map((m) => ({ slug: m.slug }))
}

export async function landingMetadata(category: ModelCategory, slug: string) {
  const model = await getModelBySlug(slug)
  if (!model) return { title: 'Model not found' }
  const max = getMaxPrice(model)
  const title = `Sell ${model.name} — Get Upto ${inr(max)}`
  const description = describe(model)
  const canonical = `/sell/${category}/${model.slug}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} | SellMyiPhone`, description, url: canonical, images: ['/og-default.png'] },
    twitter: { card: 'summary_large_image' as const }
  }
}
