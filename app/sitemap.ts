// app/sitemap.ts
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 1800

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nairaly.com').replace(/\/$/, '')

  // Fetch published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, created_at')
    .eq('published', true)
    .eq('is_deactivated', false)
    .order('updated_at', { ascending: false, nullsFirst: false })

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: "https://nairaly.com", 
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // Article pages
  const articlePages: MetadataRoute.Sitemap = (articles || [])
    .filter((post) => post.slug && post.slug.trim() !== '')
    .map((post) => ({
      url: `${baseUrl}/article/${post.slug.trim()}`,
      lastModified: new Date(post.updated_at || post.created_at),
      changeFrequency: 'weekly',
      priority: 0.75,
    }))

 const { data: authors } = await supabase
  .from("profiles")
  .select("id, updated_at")
  .eq("is_banned", false)

const authorPages: MetadataRoute.Sitemap = (authors || []).map((a) => ({
  url: `${baseUrl}/author/${a.id}`,
  lastModified: new Date(a.updated_at ?? new Date()),
  changeFrequency: "weekly" as const,
  priority: 0.5,
}))

return [...staticPages, ...articlePages, ...authorPages]
}