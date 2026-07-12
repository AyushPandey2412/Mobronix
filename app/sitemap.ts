import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default function sitemap(): MetadataRoute.Sitemap {
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
      url:             `${APP_URL}/sell/storage`,
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

  return [...static_pages, ...legal_pages]
}
