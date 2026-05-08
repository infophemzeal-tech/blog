import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-static"

const SITE_URL = "https://nairaly.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("slug, updated_at, created_at")
    .eq("published", true)
    .eq("is_deactivated", false)
    .not("slug", "is", null)          // ← BUG FIX 8: filter nulls at DB level
    .order("updated_at", { ascending: false, nullsFirst: false })

  if (articlesError) {
    console.error("[sitemap] articles query failed:", articlesError.message)
  }

  const articlePages: MetadataRoute.Sitemap = (articles ?? [])
    .filter((a) => {
      if (!a.slug || a.slug.trim() === "") return false
      if (a.slug.includes("?")) return false
      if (a.slug.includes("#")) return false
      if (a.slug.includes("%20") || a.slug.includes(" ")) return false
      // ── BUG FIX 9 ──────────────────────────────────────────────────────────
      // Slugs with path traversal segments or double slashes produce malformed
      // URLs that Google rejects and could expose unintended routes.
      // ───────────────────────────────────────────────────────────────────────
      if (a.slug.includes("..") || a.slug.includes("//")) return false
      return true
    })
    .map((a) => ({
      // ── BUG FIX 10 ─────────────────────────────────────────────────────────
      // Use encodeURIComponent on the slug so any remaining special characters
      // (apostrophes, commas, non-ASCII) produce a valid XML URL rather than
      // breaking the sitemap parser entirely.
      // ───────────────────────────────────────────────────────────────────────
      url: `${SITE_URL}/article/${encodeURIComponent(a.slug.trim())}`,
      lastModified: a.updated_at
        ? new Date(a.updated_at)
        : a.created_at
        ? new Date(a.created_at)
        : new Date(0),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }))

  const { data: authors, error: authorsError } = await supabase
    .from("profiles")
    .select("id, updated_at, username")   // ── BUG FIX 11: fetch username too
    .eq("is_banned", false)
    .not("id", "is", null)

  if (authorsError) {
    console.error("[sitemap] authors query failed:", authorsError.message)
  }

  const authorPages: MetadataRoute.Sitemap = (authors ?? [])
    .filter((a) => Boolean(a.id))
    .map((a) => ({
      // ── BUG FIX 11 ─────────────────────────────────────────────────────────
      // /author/{uuid} is not human-readable and gets near-zero organic traffic.
      // Use username slug if available, fall back to id.
      // Make sure your /author/[slug] route handles both.
      // ───────────────────────────────────────────────────────────────────────
      url: `${SITE_URL}/author/${a.username?.trim() ?? a.id}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(0),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))

  // ── BUG FIX 12 ─────────────────────────────────────────────────────────────
  // Sitemap spec caps at 50,000 URLs per file. If articles + authors exceeds
  // that, Google silently truncates. Split into an index when you grow.
  // For now, log a warning so you know when you're approaching the limit.
  // ───────────────────────────────────────────────────────────────────────────
  const total = articlePages.length + authorPages.length
  if (total > 40_000) {
    console.warn(`[sitemap] ${total} URLs — approaching 50k limit, consider splitting into sitemap index`)
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    // ── BUG FIX 13 ───────────────────────────────────────────────────────────
    // /writers and /authors are linked in your footer but missing from the
    // sitemap — Google may not discover or prioritise them.
    // ─────────────────────────────────────────────────────────────────────────
    {
      url: `${SITE_URL}/authors`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/write`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ]

  return [...staticPages, ...articlePages, ...authorPages]
}