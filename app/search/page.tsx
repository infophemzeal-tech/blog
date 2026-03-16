// app/search/page.tsx
import Link from "next/link"
import ArticleCard from "@/components/ArticleCard"
import Navbar from "@/components/Navbar"
import { createClient } from "@/lib/supabase/server"
import type { Article } from "@/data/articles"

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  let results: Article[] = []

  if (query) {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("articles")
      .select(`
        id, title, subtitle, slug, publication,
        read_time, claps_count, comments_count,
        cover_image, created_at,
        profiles ( full_name, avatar_url )
      `)
      .eq("published", true)
      .or(
        `title.ilike.%${query}%,subtitle.ilike.%${query}%,publication.ilike.%${query}%`
      )
      .order("created_at", { ascending: false })

    if (!error && data) {
      results = data.map((a: any) => ({
        id: String(a.id),
        author: a.profiles?.full_name || "Anonymous",
        authorInitial: (a.profiles?.full_name?.[0] || "A").toUpperCase(),
        publication: a.publication || "",
        slug: a.slug,
        title: a.title,
        subtitle: a.subtitle || "",
        date: new Date(a.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        }),
        claps: a.claps_count >= 1000
          ? `${(a.claps_count / 1000).toFixed(1)}K`
          : String(a.claps_count),
        comments: a.comments_count,
        readTime: a.read_time,
        body: "",
        coverImage: a.cover_image || "",
      }))
    }
  }

  return (
    <main className="max-w-5xl mx-auto">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          {query ? (
            <>
              <p className="text-sm text-stone-400 dark:text-stone-500 mb-1">
                Search results for
              </p>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                "{q}"
              </h1>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-2">
                {results.length} {results.length === 1 ? "result" : "results"} found
              </p>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              Search
            </h1>
          )}
        </div>

        {/* No results */}
        {query && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-stone-500 dark:text-stone-400 font-medium">
              No results for "{q}"
            </p>
            <p className="text-sm text-stone-400 dark:text-stone-500 mt-2">
              Try searching for something else
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm text-green-600 dark:text-green-500 hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="flex flex-col">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!query && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">✍️</p>
            <p className="text-stone-500 dark:text-stone-400">
              Type something in the search bar above
            </p>
          </div>
        )}

      </div>
    </main>
  )
}