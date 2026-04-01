import { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"


export const dynamic = "force-static"         


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


  if (articlesError) {
    console.error("[sitemap] articles query failed:", articlesError.message)
  }

  const articlePages: MetadataRoute.Sitemap = (articles ?? [])
    .filter((a) => {
      if (!a.slug || a.slug.trim() === "") return false
      if (a.slug.includes("?")) return false
     
      if (a.slug.includes("#")) return false
      if (a.slug.includes("%20") || a.slug.includes(" ")) return false
      return true
    })
    .map((a) => ({
      url: `${SITE_URL}/article/${a.slug.trim()}`,
   
      lastModified: a.updated_at
        ? new Date(a.updated_at)
        : a.created_at
        ? new Date(a.created_at)
        : new Date(0), // epoch fallback — valid XML date, signals "unknown"
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }))

 
  const { data: authors, error: authorsError } = await supabase
    .from("profiles")
    .select("id, updated_at")
    .eq("is_banned", false)
   
    .not("id", "is", null)

  if (authorsError) {
    console.error("[sitemap] authors query failed:", authorsError.message)
  }

  const authorPages: MetadataRoute.Sitemap = (authors ?? [])
  
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