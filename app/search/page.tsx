import type { Metadata } from "next"
import { createPublicClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ArticleCard from "@/components/ArticleCard"
import type { Article } from "@/data/articles"

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  searchParams: Promise<{ q?: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  const query = q?.trim() || ""
  
  return {
    title: query ? `Search results for "${query}" — Nairaly` : "Search — Nairaly",
    description: query 
      ? `Find articles, stories, and insights about "${query}" on Nairaly.`
      : "Search Nairaly for stories on Nigeria, tech, business, and culture.",
    robots: { index: false, follow: true }, // Don't index search results pages
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ""
  const supabase = createPublicClient()

  let articles: Article[] = []

  // Only query Supabase if there's an actual search term
  if (query.length > 0) {
    const { data } = await supabase
      .from("articles")
      .select(`
        id, title, subtitle, slug, publication, read_time,
        claps_count, comments_count, views_count, cover_image,
        created_at, published, is_pinned, is_deactivated, topic_id,
        profiles ( full_name, avatar_url )
      `)
      .eq("published", true)
      .eq("is_deactivated", false)
      // Search in title and subtitle (case-insensitive)
      .or(`title.ilike.%${query}%,subtitle.ilike.%${query}%`)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20)

    articles = (data || []).map((a: any) => {
      const profile = a.profiles?.[0] || a.profiles
      
      return {
        id: String(a.id),
        author: profile?.full_name || "Nairaly Writer",
        authorInitial: (profile?.full_name?.[0] || "N").toUpperCase(),
        publication: a.publication || "",
        slug: a.slug,
        title: a.title,
        subtitle: a.subtitle || "",
        date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        claps: a.claps_count > 0 ? String(a.claps_count) : "",
        comments: a.comments_count || 0,
        readTime: a.read_time || "5 min read",
        body: "",
        coverImage: a.cover_image || "",
        views_count: a.views_count || 0,
      }
    })
  }

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16">
        <header className="mb-10">
          {query ? (
            <>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
                Results for &ldquo;{query}&rdquo;
              </h1>
              <p className="mt-3 text-base text-stone-500 dark:text-stone-400 font-serif italic">
                {articles.length} {articles.length === 1 ? "story" : "stories"} found
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white tracking-tight">
                Search Nairaly
              </h1>
              <p className="mt-3 text-base text-stone-500 dark:text-stone-400 font-serif italic">
                Type a keyword above to find stories, deep reads, and insights.
              </p>
            </>
          )}
        </header>

        {/* Results List */}
        {query.length > 0 && articles.length > 0 ? (
          <div className="flex flex-col">
            {articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                priority={index === 0}
              />
            ))}
          </div>
        ) : query.length > 0 && articles.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-14 h-14 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-5 text-2xl">
              🔍
            </div>
            <h2 className="text-xl font-medium text-stone-900 dark:text-white mb-2">
              No results found
            </h2>
            <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto text-sm">
              We couldn&apos;t find any articles matching &ldquo;{query}&rdquo;. Try checking your spelling or using different keywords.
            </p>
          </div>
        ) : null}
      </div>

      <Footer />
    </main>
  )
}