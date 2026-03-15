import { createClient } from "@/lib/supabase/server"

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, claps_count, comments_count, published, created_at, read_time")
    .eq("author_id", user!.id)
    .order("claps_count", { ascending: false })

  const totalClaps = articles?.reduce((sum, a) => sum + (a.claps_count || 0), 0) ?? 0
  const totalComments = articles?.reduce((sum, a) => sum + (a.comments_count || 0), 0) ?? 0
  const totalArticles = articles?.length ?? 0
  const publishedArticles = articles?.filter((a) => a.published).length ?? 0

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total stories", value: totalArticles },
          { label: "Published", value: publishedArticles },
          { label: "Total claps", value: totalClaps >= 1000 ? `${(totalClaps / 1000).toFixed(1)}K` : totalClaps },
          { label: "Total responses", value: totalComments },
        ].map((stat) => (
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

          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
            <span className="col-span-6">Story</span>
            <span className="col-span-2 text-center">Claps</span>
            <span className="col-span-2 text-center">Responses</span>
            <span className="col-span-2 text-center">Status</span>
          </div>

          {articles.map((article) => (
            <div
              key={article.id}
              className="grid grid-cols-12 gap-4 items-center bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 px-4 py-4 hover:border-stone-200 dark:hover:border-stone-700 transition-colors"
            >
              {/* Title */}
              <div className="col-span-6 flex flex-col gap-0.5 min-w-0">
                
                <a
                  href={`/article/${article.slug}`}
                  className="font-serif text-sm font-medium text-stone-900 dark:text-white hover:underline line-clamp-2 leading-snug"
                >
                  {article.title}
                </a>
                <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                  <span>
                    {new Date(article.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>{article.read_time}</span>
                </div>
              </div>

              {/* Claps */}
              <div className="col-span-2 flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                  <path d="M14.5 2.5c0-1.1-.9-2-2-2s-2 .9-2 2v7.5L9 8.5c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8l5.3 5.3A6 6 0 0020 11.3V6.5c0-1.1-.9-2-2-2s-2 .9-2 2"/>
                  <path d="M14.5 5.5c0-1.1-.9-2-2-2"/>
                </svg>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {article.claps_count >= 1000
                    ? `${(article.claps_count / 1000).toFixed(1)}K`
                    : article.claps_count}
                </span>
              </div>

              {/* Comments */}
              <div className="col-span-2 flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {article.comments_count}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 flex justify-center">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  article.published
                    ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                }`}>
                  {article.published ? "Published" : "Draft"}
                </span>
              </div>

            </div>
          ))}

          {/* Totals row */}
          <div className="grid grid-cols-12 gap-4 items-center px-4 py-3 border-t border-stone-100 dark:border-stone-800 mt-2">
            <span className="col-span-6 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
              Total
            </span>
            <span className="col-span-2 text-center text-sm font-bold text-stone-900 dark:text-white">
              {totalClaps >= 1000 ? `${(totalClaps / 1000).toFixed(1)}K` : totalClaps}
            </span>
            <span className="col-span-2 text-center text-sm font-bold text-stone-900 dark:text-white">
              {totalComments}
            </span>
            <span className="col-span-2" />
          </div>
        </div>
      )}

    </div>
  )
}