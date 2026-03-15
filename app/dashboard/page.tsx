import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import DeleteButton from "@/components/DeleteButton"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .eq("author_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white font-serif">
          Your stories
        </h1>
        <Link
          href="/dashboard/write"
          className="px-4 py-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
        >
          Write new story
        </Link>
      </div>

      {/* Articles list */}
      {!articles || articles.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center gap-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-stone-300 dark:text-stone-600">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
          <p className="text-stone-500 dark:text-stone-400 font-medium">
            You have not written any stories yet
          </p>
          <Link
            href="/dashboard/write"
            className="text-sm text-green-600 dark:text-green-500 hover:underline"
          >
            Write your first story →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800 px-6 py-5 flex items-start justify-between gap-4 group hover:border-stone-200 dark:hover:border-stone-700 transition-colors"
            >
              {/* Left */}
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                <Link href={`/article/${article.slug}`}>
                  <h2 className="font-serif font-bold text-stone-900 dark:text-white leading-snug hover:underline line-clamp-2">
                    {article.title}
                  </h2>
                </Link>
                {article.subtitle && (
                  <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1">
                    {article.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500 mt-1">
                  <span>
                    {new Date(article.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>{article.read_time}</span>
                  <span>·</span>
                  <span>👏 {article.claps_count}</span>
                  <span>💬 {article.comments_count}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    article.published
                      ? "bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                  }`}>
                    {article.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  href={`/dashboard/edit/${article.id}`}
                  className="px-3 py-1.5 rounded-lg text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton articleId={article.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}