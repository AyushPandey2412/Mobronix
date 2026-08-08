import type { MetadataRoute } from 'next'
import { getModels } from '@/lib/data'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mobronix.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const static_pages: MetadataRoute.Sitemap = [
    {
      url:             APP_URL,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        1.0,
    },
    {
      url:             `${APP_URL}/#how`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.6,
    },
    {
      url:             `${APP_URL}/#faq`,
      lastModified:    new Date(),
      changeFrequency: 'monthly',
      priority:        0.5,
    },
    {
      url:             `${APP_URL}/sell/iphone`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    {
      url:             `${APP_URL}/sell/macbook`,
      lastModified:    new Date(),
      changeFrequency: 'weekly',
      priority:        0.9,
    },
  ]

  const legal_pages: MetadataRoute.Sitemap = [
    '/legal/privacy-policy',
    '/legal/terms-and-conditions',
    '/legal/terms-of-use',
  ].map((path) => ({
    url:             `${APP_URL}${path}`,
    lastModified:    new Date(),
    changeFrequency: 'yearly',
    priority:        0.3,
  }))

  // Dynamic model pages — one entry per active iPhone and MacBook model.
  const [iphoneModels, macbookModels] = await Promise.all([
    getModels('iphone').catch(() => []),
    getModels('macbook').catch(() => []),
  ])

  const model_pages: MetadataRoute.Sitemap = [
    ...iphoneModels.map((m) => ({
      url:             `${APP_URL}/sell/iphone/${m.slug}`,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        0.8,
    })),
    ...macbookModels.map((m) => ({
      url:             `${APP_URL}/sell/macbook/${m.slug}`,
      lastModified:    new Date(),
      changeFrequency: 'weekly' as const,
      priority:        0.8,
    })),
  ]

  return [...static_pages, ...legal_pages, ...model_pages]
}
