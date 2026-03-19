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
  className={`bg-white dark:bg-stone-900 rounded-3xl border transition-all duration-300 overflow-hidden ${
    article.is_pinned 
      ? "border-blue-200 dark:border-blue-900 bg-blue-50/20 shadow-sm" 
      : "border-stone-100 dark:border-stone-800"
  } ${article.is_deactivated ? "opacity-60 grayscale" : "shadow-md shadow-stone-100 dark:shadow-none"}`}
>
  <div className="p-5 sm:p-7">
    {/* 1. Header Metadata Row */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-500 uppercase tracking-tighter">
          {(article.profiles?.full_name || "A")[0]}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
          By {article.profiles?.full_name || "Unknown"}
        </span>
      </div>
      
      <div className="flex gap-2">
        {article.is_pinned && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">📌 Pinned</span>}
        {article.is_deactivated && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">🚫 Deactivated</span>}
      </div>
    </div>

    {/* 2. Title Section */}
    <Link href={`/article/${article.slug}`}>
      <h2 className="font-serif font-bold text-lg sm:text-2xl text-stone-900 dark:text-white leading-tight hover:underline mb-2">
        {article.title}
      </h2>
    </Link>

    <div className="flex items-center gap-4 text-xs text-stone-400 font-medium">
      <span>{new Date(article.created_at).toLocaleDateString()}</span>
      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-tight ${
        article.published ? "bg-green-50 text-green-600" : "bg-stone-100 text-stone-500"
      }`}>
        {article.published ? "Active" : "Draft"}
      </span>
    </div>

    {/* 3. MODERN ADMIN ACTION BAR */}
    <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800/50 flex flex-wrap items-center justify-between gap-4">
      
      {/* Moderation Controls (The Icons) */}
      {isSuperAdmin && (
        <AdminControls 
          articleId={article.id} 
          isPinned={article.is_pinned}
          isDeactivated={article.is_deactivated}
          authorId={article.profiles?.id}
          currentRole={article.profiles?.role}
        />
      )}

      {/* Editor & Content Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/edit/${article.id}`}
          className="px-4 py-1.5 rounded-full text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Edit Story
        </Link>
        <DeleteButton articleId={article.id} />
      </div>
    </div>
  </div>
</div>
          ))}
        </div>
      )}
    </div>
  )
}