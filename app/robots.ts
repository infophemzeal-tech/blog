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
  "/*?*",
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