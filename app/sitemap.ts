import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

// ── BUG FIX 1 ─────────────────────────────────────────────────────────────────
// export const revalidate = 3600 is silently ignored on async route handlers
// in Next.js App Router. sitemap.ts is a special route segment — it uses its
// own cache config. Use the correct export instead:
export const dynamic = "force-static"          // generate once at build
// OR, if you need ISR-style re-generation:
// export const revalidate = 3600              // this DOES work on route.ts
//                                             // but NOT on sitemap.ts — use
//                                             // next.config revalidation or
//                                             // on-demand revalidation instead.
// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = "https://nairaly.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // ── Articles ─────────────────────────────────────────────────────────────────
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("slug, updated_at, created_at")
    .eq("published", true)
    .eq("is_deactivated", false)
    .order("updated_at", { ascending: false, nullsFirst: false })

  // ── BUG FIX 2 ───────────────────────────────────────────────────────────────
  // Original silently swallowed DB errors with (articles ?? []).
  // Log the error so you know when your sitemap is silently incomplete.
  // ─────────────────────────────────────────────────────────────────────────────
  if (articlesError) {
    console.error("[sitemap] articles query failed:", articlesError.message)
  }

  const articlePages: MetadataRoute.Sitemap = (articles ?? [])
    .filter((a) => {
      if (!a.slug || a.slug.trim() === "") return false
      if (a.slug.includes("?")) return false
      // ── BUG FIX 3 ──────────────────────────────────────────────────────────
      // Also strip slugs with # fragments and encoded spaces (%20) — both
      // produce invalid sitemap URLs that Google will reject.
      // ─────────────────────────────────────────────────────────────────────────
      if (a.slug.includes("#")) return false
      if (a.slug.includes("%20") || a.slug.includes(" ")) return false
      return true
    })
    .map((a) => ({
      url: `${SITE_URL}/article/${a.slug.trim()}`,
      // ── BUG FIX 4 ────────────────────────────────────────────────────────────
      // new Date(null) and new Date(undefined) both return Invalid Date.
      // If updated_at AND created_at are both null, this produces an invalid
      // XML date in the sitemap → Google ignores or errors on the whole entry.
      // Fall back to a known-good date rather than an Invalid Date object.
      // ─────────────────────────────────────────────────────────────────────────
      lastModified: a.updated_at
        ? new Date(a.updated_at)
        : a.created_at
        ? new Date(a.created_at)
        : new Date(0), // epoch fallback — valid XML date, signals "unknown"
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }))

  // ── Author profiles ──────────────────────────────────────────────────────────
  const { data: authors, error: authorsError } = await supabase
    .from("profiles")
    .select("id, updated_at")
    .eq("is_banned", false)
    // ── BUG FIX 5 ────────────────────────────────────────────────────────────
    // No filter on empty/null IDs. An author row with a null or blank id
    // produces the URL "https://nairaly.com/author/null" in your sitemap.
    // Google will crawl it, get a 404, and log a 4xx error in Search Console.
    // ─────────────────────────────────────────────────────────────────────────
    .not("id", "is", null)

  if (authorsError) {
    console.error("[sitemap] authors query failed:", authorsError.message)
  }

  const authorPages: MetadataRoute.Sitemap = (authors ?? [])
    // ── BUG FIX 6 ────────────────────────────────────────────────────────────
    // Belt-and-suspenders JS-side guard in case the DB returns a null id
    // despite the .not() filter (e.g. a type mismatch, RLS policy, etc.)
    // ─────────────────────────────────────────────────────────────────────────
    .filter((a) => Boolean(a.id))
    .map((a) => ({
      url: `${SITE_URL}/author/${a.id}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(0),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))

  // ── Static pages ─────────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      // ── BUG FIX 7 ──────────────────────────────────────────────────────────
      // new Date() at render time is fine for static pages but if you ever
      // switch to ISR you'll want a real last-modified date here. For now,
      // keeping new Date() is acceptable — just be aware it will always report
      // "today" to Google regardless of whether the page actually changed.
      // ─────────────────────────────────────────────────────────────────────────
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
  ]

  return [...staticPages, ...articlePages, ...authorPages]
}