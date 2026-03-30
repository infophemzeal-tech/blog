import { MetadataRoute } from "next"

const SITE_URL = "https://nairaly.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── All crawlers ──────────────────────────────────────
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          // Auth & user flows
          "/auth/",
          "/api/",

          // App UI — not indexable content
          "/dashboard/",
          "/settings/",
          "/admin/",
          "/private/",
          "/preview/",

          // ✅ Block ALL query strings (topic, q, filter, etc)
          "/*?*",

          // Thin/legal pages — waste crawl budget
          "/privacy",
          "/terms",
          "/cookies",
          "/help",
        ],
      },

      // ── Block AI training crawlers ────────────────────────
      { userAgent: "GPTBot",          disallow: ["/"] },
      { userAgent: "ChatGPT-User",    disallow: ["/"] },
      { userAgent: "Google-Extended", disallow: ["/"] },
      { userAgent: "CCBot",           disallow: ["/"] },
      { userAgent: "anthropic-ai",    disallow: ["/"] },
      { userAgent: "Claude-Web",      disallow: ["/"] },
      { userAgent: "Omgilibot",       disallow: ["/"] },
      { userAgent: "FacebookBot",     disallow: ["/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}