import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 1800 // 30 minutes – good for fresh articles

// Helper to escape XML special characters
function xmlEscape(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nairaly.com'

  // Fetch published articles with cover images
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, created_at, title, subtitle, cover_image')
    .eq('published', true)
    .eq('is_deactivated', false)
    .order('updated_at', { ascending: false, nullsFirst: false })

  // Fetch active topics
  const { data: topics } = await supabase
    .from('topics')
    .select('slug')

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

  // 1. Static Pages
  const staticPages = [
    { url: baseUrl, priority: '1.0', changefreq: 'daily' },
    { url: `${baseUrl}/about`, priority: '0.6', changefreq: 'monthly' },
    { url: `${baseUrl}/blog`, priority: '0.85', changefreq: 'daily' },
    { url: `${baseUrl}/privacy`, priority: '0.3', changefreq: 'monthly' },
    { url: `${baseUrl}/terms`, priority: '0.3', changefreq: 'monthly' },
  ]

  staticPages.forEach((page) => {
    xml += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`
  })

  // 2. Article Pages with Full Image Support
  if (articles && articles.length > 0) {
    articles.forEach((post: any) => {
      const lastMod = post.updated_at 
        ? new Date(post.updated_at).toISOString() 
        : new Date(post.created_at).toISOString()

      xml += `  <url>
    <loc>${baseUrl}/article/${encodeURIComponent(post.slug)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>`

      // Add image if cover_image exists
      if (post.cover_image) {
        const imageTitle = xmlEscape(post.title)
        const imageCaption = xmlEscape(post.subtitle || post.title)

        xml += `
    <image:image>
      <image:loc>${post.cover_image}</image:loc>
      <image:title>${imageTitle}</image:title>
      <image:caption>${imageCaption}</image:caption>
    </image:image>`
      }

      xml += `\n  </url>\n`
    })
  }

  // 3. Topic Pages
  if (topics && topics.length > 0) {
    topics
      .filter((t: any) => t.slug && t.slug.trim() !== '' && t.slug !== 'null')
      .forEach((topic: any) => {
        const topicUrl = `${baseUrl}/?topic=${encodeURIComponent(topic.slug)}`
        xml += `  <url>
    <loc>${topicUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.55</priority>
  </url>\n`
      })
  }

  xml += '</urlset>'

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  })
}