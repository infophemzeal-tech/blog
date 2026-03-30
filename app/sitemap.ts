import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"

export const revalidate = 3600

const SITE_URL = "https://nairaly.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // ── Articles ──────────────────────────────────────────────
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at, created_at")
    .eq("published", true)
    .eq("is_deactivated", false)
    .order("updated_at", { ascending: false, nullsFirst: false })

  const articlePages: MetadataRoute.Sitemap = (articles ?? [])
    .filter((a) => a.slug && a.slug.trim() !== "" && !a.slug.includes("?"))
    .map((a) => ({
      url: `${SITE_URL}/article/${a.slug.trim()}`,
      lastModified: new Date(a.updated_at || a.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }))

  // ── Author profiles ───────────────────────────────────────
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, updated_at")
    .eq("is_banned", false)

  const authorPages: MetadataRoute.Sitemap = (authors ?? []).map((a) => ({
    url: `${SITE_URL}/author/${a.id}`,
    lastModified: new Date(a.updated_at ?? new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  // ── Static pages ──────────────────────────────────────────
  // ✅ No /privacy or /terms — low value, skip
  // ✅ No /write or /authors — 404, skip
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
  ]

  return [...staticPages, ...articlePages, ...authorPages]
}