import Link from "next/link"
import { ARTICLES } from "@/components/Feed"
import ArticleCard from "@/components/ArticleCard"
import Navbar from "@/components/Navbar"

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.toLowerCase().trim() ?? ""

  const results = query
    ? ARTICLES.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.subtitle.toLowerCase().includes(query) ||
          article.author.toLowerCase().includes(query) ||
          article.publication.toLowerCase().includes(query)
      )
    : []

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

        {/* Results */}
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

        {results.length > 0 && (
          <div className="flex flex-col">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

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