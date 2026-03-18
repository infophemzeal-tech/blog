import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'



export const revalidate = 3600; // Revalidate at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gistpadi.com'

  // 1. Fetch all Published Articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false })

  // 2. Fetch Active Topics (Categories)
  const { data: topics } = await supabase
    .from('topics')
    .select('slug')

  // 3. Map Articles to Sitemap Format
  const articleEntries: MetadataRoute.Sitemap = (articles || []).map((post) => ({
    url: `${baseUrl}/article/${post.slug}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: 'daily',
    priority: 0.8, // High priority for content
  }))

  // 4. Map Topics to Sitemap Format
  const topicEntries: MetadataRoute.Sitemap = (topics || []).map((topic) => ({
    url: `${baseUrl}/?topic=${topic.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  // 5. Static Pages (Legal & Core)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0, // Home page is most important
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
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

  return [...staticPages, ...articleEntries, ...topicEntries]
}