// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nairaly.com'

  return {
    rules: [
      // ── Default: all crawlers ──────────────────────────
      {
        userAgent: '*',
        allow: [
          '/',
          '/_next/static/',   // JS & CSS — must be crawlable
          '/_next/image/',    // Next.js optimized images
        ],
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard/',
          '/settings/',
          '/admin/',
          '/private/',
          '/preview/',
          '/*?topic=null',    // block only null topic pages
        ],
      },

      // ── Block AI training crawlers ─────────────────────
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],

    sitemap: `${baseUrl}/sitemap.xml`,
  }
}