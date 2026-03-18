import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import DeleteButton from "@/components/DeleteButton"
import AdminControls from "@/components/AdminControls" // New Client Component we'll create

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/signin")

  // 1. Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  const isSuperAdmin = profile?.role === "super_admin"

  // 2. Fetch Articles (All for Admin, personal for User)
    let query = supabase
    .from("articles")
    .select(`
      *,
      profiles!author_id (
        id,
        full_name,
        role
      )
    `)
    .order("created_at", { ascending: false })

  if (!isSuperAdmin) {
    query = query.eq("author_id", user.id)
  }

  const { data: articles, error } = await query

  if (error) {
    console.error("Dashboard Fetch Error:", error.message)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white font-serif">
            {isSuperAdmin ? "Content Moderation" : "Your stories"}
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            {isSuperAdmin 
              ? `Manage all ${articles?.length || 0} stories across the platform.` 
              : "Manage your personal stories and drafts."}
          </p>
        </div>
        <Link
          href="/dashboard/write"
          className="px-4 py-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors shadow-sm"
        >
          Write new story
        </Link>
      </div>

      {/* Articles list */}
      {!articles || articles.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-stone-100 dark:border-stone-800 rounded-2xl flex flex-col items-center gap-4">
          <p className="text-stone-400">No stories found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {articles.map((article) => (
            <div
              key={article.id}
              className={`bg-white dark:bg-stone-900 rounded-xl border px-6 py-5 flex items-start justify-between gap-4 group transition-all ${
                article.is_pinned ? "border-blue-200 bg-blue-50/30 ring-1 ring-blue-100" : "border-stone-100 dark:border-stone-800"
              } ${article.is_deactivated ? "opacity-60 grayscale" : ""}`}
            >
              <div className="flex flex-col gap-2 min-w-0 flex-1">
                {/* Admin metadata */}
                {isSuperAdmin && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                      By {article.profiles?.full_name || "Unknown"}
                    </span>
                    {article.is_pinned && <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter bg-blue-100 px-1.5 py-0.5 rounded">📌 Pinned</span>}
                    {article.is_deactivated && <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter bg-red-100 px-1.5 py-0.5 rounded">🚫 Deactivated</span>}
                  </div>
                )}

                <Link href={`/article/${article.slug}`}>
                  <h2 className="font-serif font-bold text-stone-900 dark:text-white leading-snug hover:underline line-clamp-1">
                    {article.title}
                  </h2>
                </Link>

                <div className="flex items-center gap-3 text-[11px] text-stone-400 dark:text-stone-500">
                  <span className="uppercase">{new Date(article.created_at).toLocaleDateString()}</span>
                  <span>·</span>
                  <span className={`px-2 py-0.5 rounded-full ${
                    article.published ? "bg-green-50 text-green-600" : "bg-stone-100 text-stone-500"
                  }`}>
                    {article.published ? "Active" : "Draft"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/dashboard/edit/${article.id}`}
                  className="px-3 py-1.5 rounded-lg text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Edit
                </Link>

                {/* SUPER ADMIN CONTROLS COMPONENT */}
                {isSuperAdmin && (
                  <AdminControls 
                    articleId={article.id} 
                    isPinned={article.is_pinned}
                    isDeactivated={article.is_deactivated}
                    authorId={article.profiles?.id}
                    currentRole={article.profiles?.role}
                  />
                )}
                
                <DeleteButton articleId={article.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}