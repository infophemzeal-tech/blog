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
          "/auth/",
          "/api/",
          "/dashboard/",
          "/settings/",
          "/admin/",
          "/private/",
          "/preview/",
          "/help",
          // ✅ FIX 8: Removed /*?* — was blocking UTM, pagination, topic filters
        ],
      },

      // ✅ FIX 8: Surgical query-string rules instead of blanket ban
      {
        userAgent: "*",
        disallow: [
          "/*?utm_*",     // UTM tracking params (not indexable content)
          "/*?fbclid=*",  // Facebook click ID
          "/*?gclid=*",   // Google click ID
          "/search?",     // Internal search results (usually low-quality duplicates)
        ],
      },

      // ── AI Answer-Engine Crawlers ─────────────────────────
      // ✅ FIX 5: ALLOW these — they fetch content live for user queries
      { userAgent: "ChatGPT-User",    allow: ["/"] },  // ChatGPT citations
      { userAgent: "Google-Extended", allow: ["/"] },  // Gemini / AI Overviews
      { userAgent: "Claude-Web",      allow: ["/"] },  // Claude browsing
      
      // ── AI Training Crawlers (keep blocked to opt out of training) ──
      { userAgent: "GPTBot",       disallow: ["/"] },  // OpenAI training data
      { userAgent: "CCBot",        disallow: ["/"] },  // Common Crawl
      { userAgent: "anthropic-ai", disallow: ["/"] },  // Anthropic training
      { userAgent: "Omgilibot",    disallow: ["/"] },  // Perplexity training

      // ✅ BONUS FIX: Allow FacebookBot for OG link previews
      { userAgent: "FacebookBot", allow: ["/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}