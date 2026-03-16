import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

// Icon SVG Components
const EyeIcon = ({ className = "" }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const ClapsIcon = ({ className = "" }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M14.5 2.5c0-1.1-.9-2-2-2s-2 .9-2 2v7.5L9 8.5c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8l5.3 5.3A6 6 0 0020 11.3V6.5c0-1.1-.9-2-2-2s-2 .9-2 2" />
  </svg>
)

const MessageIcon = ({ className = "" }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

// Utility function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

// Utility function to format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Status Badge Component
const StatusBadge = ({ published }: { published: boolean }) => (
  <span
    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
      published
        ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
        : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
    }`}
  >
    {published ? "Published" : "Draft"}
  </span>
)

export default async function StatsPage() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw new Error("Unable to authenticate user")
    }

    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select(
        "id, title, slug, claps_count, comments_count, views_count, published, created_at, read_time"
      )
      .eq("author_id", user.id)
      .order("claps_count", { ascending: false })

    if (articlesError) {
      throw new Error(`Failed to fetch articles: ${articlesError.message}`)
    }

    // Calculate aggregated stats
    const totalClaps = articles?.reduce((sum, a) => sum + (a.claps_count || 0), 0) ?? 0
    const totalComments = articles?.reduce((sum, a) => sum + (a.comments_count || 0), 0) ?? 0
    const totalViews = articles?.reduce((sum, a) => sum + (a.views_count || 0), 0) ?? 0
    const totalArticles = articles?.length ?? 0
    const publishedArticles = articles?.filter((a) => a.published).length ?? 0

    const statsData = [
      { label: "Total stories", value: totalArticles },
      { label: "Published", value: publishedArticles },
      { label: "Total views", value: formatNumber(totalViews) },
      { label: "Total claps", value: formatNumber(totalClaps) },
      { label: "Total responses", value: totalComments },
    ]

    return (
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">
            Stats
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Overview of your stories performance
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {statsData.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 px-5 py-4 flex flex-col gap-1"
            >
              <p className="text-2xl font-bold text-stone-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Per article stats */}
        {!articles || articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-500 dark:text-stone-400">
              No stories yet — write your first one!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-stone-900 dark:text-white">
              Per story
            </h2>

            {/* Table header — desktop only */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
              <span className="col-span-5">Story</span>
              <span className="col-span-2 text-center">Views</span>
              <span className="col-span-2 text-center">Claps</span>
              <span className="col-span-1 text-center">Replies</span>
              <span className="col-span-2 text-center">Status</span>
            </div>

            {/* Articles list */}
            {articles.map((article) => (
              <div
                key={article.id}
                className="grid grid-cols-12 gap-4 items-center bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 px-4 py-4 hover:border-stone-200 dark:hover:border-stone-700 transition-colors"
              >
                {/* Title and metadata */}
                <div className="col-span-12 sm:col-span-5 flex flex-col gap-0.5 min-w-0">
                  <Link
                    href={`/article/${article.slug}`}
                    className="font-serif text-sm font-medium text-stone-900 dark:text-white hover:underline line-clamp-2 leading-snug"
                  >
                    {article.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                    <span>{formatDate(article.created_at)}</span>
                    <span>·</span>
                    <span>{article.read_time}</span>
                  </div>

                  {/* Mobile stats */}
                  <div className="flex items-center gap-4 mt-2 sm:hidden text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-1">
                      <EyeIcon />
                      <span>{article.views_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClapsIcon />
                      <span>{article.claps_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageIcon />
                      <span>{article.comments_count || 0}</span>
                    </div>
                    <div className="ml-auto">
                      <StatusBadge published={article.published} />
                    </div>
                  </div>
                </div>

                {/* Views — desktop */}
                <div className="hidden sm:flex col-span-2 items-center justify-center gap-1.5">
                  <EyeIcon className="text-stone-400" />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {formatNumber(article.views_count || 0)}
                  </span>
                </div>

                {/* Claps — desktop */}
                <div className="hidden sm:flex col-span-2 items-center justify-center gap-1.5">
                  <ClapsIcon className="text-stone-400" />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {formatNumber(article.claps_count || 0)}
                  </span>
                </div>

                {/* Comments — desktop */}
                <div className="hidden sm:flex col-span-1 items-center justify-center gap-1.5">
                  <MessageIcon className="text-stone-400" />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {article.comments_count || 0}
                  </span>
                </div>

                {/* Status — desktop */}
                <div className="hidden sm:flex col-span-2 justify-center">
                  <StatusBadge published={article.published} />
                </div>
              </div>
            ))}

            {/* Totals row — desktop only */}
            <div className="hidden sm:grid grid-cols-12 gap-4 items-center px-4 py-3 border-t border-stone-100 dark:border-stone-800 mt-2">
              <span className="col-span-5 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Total
              </span>
              <span className="col-span-2 text-center text-sm font-bold text-stone-900 dark:text-white">
                {formatNumber(totalViews)}
              </span>
              <span className="col-span-2 text-center text-sm font-bold text-stone-900 dark:text-white">
                {formatNumber(totalClaps)}
              </span>
              <span className="col-span-1 text-center text-sm font-bold text-stone-900 dark:text-white">
                {totalComments}
              </span>
              <span className="col-span-2" />
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("StatsPage error:", error)
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">
            Stats
          </h1>
        </div>
        <div className="text-center py-16">
          <p className="text-red-500 dark:text-red-400">
            Unable to load stats. Please try again later.
          </p>
        </div>
      </div>
    )
  }
}