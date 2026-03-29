import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const revalidate = 1800

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
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nairaly.com').replace(/\/$/, '')

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, created_at, title, subtitle, cover_image')
    .eq('published', true)
    .eq('is_deactivated', false)
    .order('updated_at', { ascending: false, nullsFirst: false })

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
    <loc>${xmlEscape(page.url)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>\n`
  })

  // 2. Article Pages
  if (articles && articles.length > 0) {
    articles.forEach((post: any) => {
      // Skip articles with missing or invalid slugs
      if (!post.slug || post.slug.trim() === '') return

      const lastMod = post.updated_at
        ? new Date(post.updated_at).toISOString()
        : new Date(post.created_at).toISOString()

      // Use slug directly — do NOT encodeURIComponent (slugs should already be URL-safe)
      const articleUrl = `${baseUrl}/article/${post.slug.trim()}`

      xml += `  <url>
    <loc>${xmlEscape(articleUrl)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.75</priority>`

      // Only add image if URL looks valid
      if (post.cover_image && post.cover_image.startsWith('http')) {
        xml += `
    <image:image>
      <image:loc>${xmlEscape(post.cover_image)}</image:loc>
      <image:title>${xmlEscape(post.title)}</image:title>
      <image:caption>${xmlEscape(post.subtitle || post.title)}</image:caption>
    </image:image>`
      }

      xml += `\n  </url>\n`
    })
  }

  // 3. Topic Pages — only include if topics have dedicated URLs (not query params)
  // Query-param URLs (?topic=x) are skipped as they cause sitemap validation warnings.
  // Uncomment and adapt below if you add /topic/[slug] routes in the future:
  //
  // if (topics && topics.length > 0) {
  //   topics
  //     .filter((t: any) => t.slug && t.slug.trim() !== '' && t.slug !== 'null')
  //     .forEach((topic: any) => {
  //       xml += `  <url>
  //   <loc>${xmlEscape(`${baseUrl}/topic/${topic.slug.trim()}`)}</loc>
  //   <lastmod>${new Date().toISOString()}</lastmod>
  //   <changefreq>weekly</changefreq>
  //   <priority>0.55</priority>
  // </url>\n`
  //     })
  // }

  xml += '</urlset>'

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  })
}