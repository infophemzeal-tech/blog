import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ArticleCard from "@/components/ArticleCard"
import type { Article } from "@/data/articles"

// ─── Constants ────────────────────────────────────────────────────────────────

const SITE_URL = "https://nairaly.com"

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ slug: string }>
}

interface TopicResponse {
  id: number
  name: string
}

interface ArticleResponse {
  id: string
  slug: string
  title: string
  subtitle: string | null
  cover_image: string | null
  publication: string | null
  read_time: string | null
  views_count: number
  claps_count: number
  comments_count: number
  created_at: string
  profiles: { full_name: string | null; avatar_url: string | null } | null
}

// ─── Caching ──────────────────────────────────────────────────────────────────

// ✅ Cache at the edge for 5 minutes
export const revalidate = 300

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  
  // Reverse the slugify (e.g., "job-vacancies" -> "job vacancies")
  const topicName = slug.replace(/-/g, " ")

  const { data: topic } = await supabase
    .from("topics")
    .select("name")
    .ilike("name", topicName)
    .single() as { data: Pick<TopicResponse, "name"> | null }

  if (!topic) {
    return { title: "Topic Not Found" }
  }

  const title = `${topic.name} — Latest News, Stories & Insights | Nairaly`
  const description = `Discover the latest articles, deep reads, and expert insights on ${topic.name} in Nigeria and beyond. Stay updated with Nairaly.`

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/topic/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/topic/${slug}`,
      siteName: "Nairaly",
      type: "website",
      images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og-default.jpg`],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  
  const topicName = slug.replace(/-/g, " ")

  // 1. Fetch Topic ID
  const { data: topic } = await supabase
    .from("topics")
    .select("id, name")
    .ilike("name", topicName)
    .single() as { data: TopicResponse | null }

  if (!topic) notFound()

  // 2. Fetch Articles for this Topic
  const { data: articlesData } = await supabase
    .from("articles")
    .select("id, title, subtitle, slug, publication, read_time, claps_count, comments_count, views_count, cover_image, created_at, profiles ( full_name )")
    .eq("published", true)
    .eq("is_deactivated", false)
    .eq("topic_id", topic.id)
    .order("created_at", { ascending: false })
    .limit(30)

    // 3. Transform data to match ArticleCard expectations
  const articles: Article[] = (articlesData || []).map((a: any) => {
    // ✅ FIX: Safely extract profile from Supabase's default array return format
    const profile = a.profiles?.[0] || a.profiles

    return {
      id: String(a.id),
      author: profile?.full_name || "Nairaly Writer",
      authorInitial: (profile?.full_name?.[0] || "N").toUpperCase(),
      publication: a.publication || "",
      slug: a.slug,
      title: a.title,
      subtitle: a.subtitle || "",
      // ✅ Includes year to prevent stale look
      date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      // ✅ Hide 0 claps to prevent "dead site" signal
      claps: a.claps_count > 0 ? String(a.claps_count) : "",
      comments: a.comments_count || 0,
      readTime: a.read_time || "5 min read",
      body: "",
      coverImage: a.cover_image || "",
      views_count: a.views_count || 0,
    }
  })

  // 4. JSON-LD Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: topic.name, item: `${SITE_URL}/topic/${slug}` },
    ],
  }

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16">
        {/* ✅ Visible SEO H1 */}
        <header className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
            {topic.name}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-stone-500 dark:text-stone-400 font-serif italic">
            The latest stories, deep reads, and insights on {topic.name.toLowerCase()} in Nigeria.
          </p>
        </header>

        {/* Article Feed */}
        {articles.length > 0 ? (
          <div className="flex flex-col">
            {articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto w-14 h-14 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-5 text-2xl">
              📝
            </div>
            <h2 className="text-xl font-medium text-stone-900 dark:text-white mb-2">
              No articles yet
            </h2>
            <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto text-sm">
              We don't have any stories filed under {topic.name} yet. Check back soon or{" "}
              <a href="/write" className="text-green-600 hover:underline">write one</a>.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}