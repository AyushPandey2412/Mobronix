import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mobronix.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',  // /legal/* is implicitly crawlable
        // Stateful / personalised pages — thin content, no indexing value.
        disallow: [
          '/admin',
          '/admin/',
          '/account',
          '/sell/storage',
          '/sell/condition',
          '/sell/quote',
          '/sell/photos',
          '/sell/checkout',
          '/sell/confirm',
          '/sell/manual',
          '/track',
          '/cart',
          '/api/',
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
