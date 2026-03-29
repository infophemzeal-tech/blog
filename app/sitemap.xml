import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 1800 // 30 minutes – good balance for new articles

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nairaly.com'

  // Fetch Published Articles with cover images
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, created_at, title, subtitle, cover_image')
    .eq('published', true)
    .eq('is_deactivated', false)
    .order('updated_at', { ascending: false, nullsFirst: false })

  // Fetch Active Topics
  const { data: topics } = await supabase
    .from('topics')
    .select('slug')

  // Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
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
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
  ]

  // Article Entries + Simple Image Support (string array)
  const articleEntries: MetadataRoute.Sitemap = (articles || []).map((post) => {
    const lastModified = post.updated_at 
      ? new Date(post.updated_at) 
      : new Date(post.created_at)

    // Simple image array – only the URL (this satisfies the type)
    const images: string[] = post.cover_image ? [post.cover_image] : []

    return {
      url: `${baseUrl}/article/${post.slug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.75,
      images,                    // ← Fixed: now a string array
    }
  })

  // Topic Entries
  const topicEntries: MetadataRoute.Sitemap = (topics || [])
    .filter((topic) => topic.slug && topic.slug.trim() !== '' && topic.slug !== 'null')
    .map((topic) => ({
      url: `${baseUrl}/?topic=${encodeURIComponent(topic.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.55,
    }))

  // Combine: Static → Articles → Topics
  return [...staticPages, ...articleEntries, ...topicEntries]
}