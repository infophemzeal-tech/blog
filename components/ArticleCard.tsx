"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { Article } from "../data/articles"
import { isSuperAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/client"

type ArticleCardProps = {
  article: Article
  priority?: boolean
  compact?: boolean
}

export default function ArticleCard({
  article,
  priority = false,
  compact = false,
}: ArticleCardProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    isSuperAdmin().then(setIsAdmin)
  }, [])

  const handleTogglePin = async () => {
    const { error } = await supabase
      .from("articles")
      .update({ is_pinned: !article.is_pinned })
      .eq("id", article.id)
    if (!error) router.refresh()
  }

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to hide this article from the public?")) return
    const { error } = await supabase
      .from("articles")
      .update({ is_deactivated: true })
      .eq("id", article.id)
    if (!error) router.refresh()
  }

  const handleBanUser = async () => {
    if (!confirm(`Ban ${article.author} from posting?`)) return
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: true })
      .eq("id", (article as any).author_id)
    if (!error) alert("User has been restricted.")
  }

  const viewCount = Number(article.views_count)
  const formattedViews =
    viewCount >= 1000 ? `${(viewCount / 1000).toFixed(1)}K` : viewCount || 0

  return (
    <article className="group relative py-2 border-t mb-0 mt-0 border-stone-100 dark:border-stone-800/60 last:border-b-0">
      

      {/* Admin status badges */}
      {isAdmin && (article.is_pinned || article.is_deactivated) && (
        <div className="flex gap-1 mb-0">
          {article.is_pinned && (
            <span className="text-[9px] bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 px-1.5 py-px rounded-sm font-bold uppercase tracking-wider">
              Pinned
            </span>
          )}
          {article.is_deactivated && (
            <span className="text-[9px] bg-red-50 text-red-500 dark:bg-red-950 dark:text-red-400 px-1.5 py-px rounded-sm font-bold uppercase tracking-wider">
              Hidden
            </span>
          )}
        </div>
      )}

      {/* Main row */}
      <div className="flex items-start gap-2.5">

        {/* Left — content */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">

          

          {/* Title */}
          <Link href={`/article/${article.slug}`}>
            <h3 className="font-serif text-[14px] sm:text-[14px] font-bold text-stone-900 dark:text-white leading-[1.35] hover:text-stone-600 dark:hover:text-stone-300 transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>

          {/* Subtitle — desktop only */}
          {article.subtitle && (
            <p className="hidden sm:block text-[12px] text-stone-400 dark:text-stone-500 leading-snug line-clamp-2 font-serif mt-px">
              {article.subtitle}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-0">
            <div
              className="w-[14px] h-[14px] rounded-full bg-green-600 dark:bg-stone-500 flex items-center justify-center text-white shrink-0"
              style={{ fontSize: "7px", fontWeight: 700, lineHeight: 1 }}
              aria-hidden
            >
              {article.authorInitial}
            </div>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 whitespace-nowrap leading-none">
              {article.author}
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 whitespace-nowrap leading-none">
              {article.date}
            </span>
            

            <div className="flex items-center gap-0.5 text-stone-400 dark:text-stone-500">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M14.5 2.5c0-1.1-.9-2-2-2s-2 .9-2 2v7.5L9 8.5c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8l5.3 5.3A6 6 0 0020 11.3V6.5c0-1.1-.9-2-2-2s-2 .9-2 2" />
              </svg>
              <span className="text-[10px] leading-none">{article.claps}</span>
            </div>

            <div className="flex items-center gap-0.5 text-stone-400 dark:text-stone-500">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-[10px] leading-none">{formattedViews}</span>
            </div>

            {/* Bookmark */}
            <button
              className="ml-auto text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-300 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
              aria-label="Save article"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Thumbnail */}
        <Link
          href={`/article/${article.slug}`}
          className="shrink-0 self-start"
          aria-label={`Read ${article.title}`}
          tabIndex={-1}
        >
          <div className="relative w-[64px] h-[44px] sm:w-[88px] sm:h-[60px] rounded overflow-hidden bg-stone-100 dark:bg-stone-800 hover:opacity-75 transition-opacity">
            {article.coverImage ? (
              <Image
                src={article.coverImage}
                alt=""
                fill
                sizes="(max-width: 640px) 64px, 88px"
                className="object-cover"
                priority={priority}
              />
            ) : (
              <div className="w-full h-full bg-stone-200 dark:bg-stone-700" />
            )}
          </div>
        </Link>
      </div>

      {/* Admin panel */}
      {isAdmin && (
        <div className="flex items-center gap-1.5 mt-0 pt-0 border-t border-stone-50 dark:border-stone-800/50"> 
          <span className="text-[9px] font-bold text-stone-300 dark:text-stone-600 uppercase tracking-widest shrink-0">
            Admin:
          </span>
          <button
            onClick={handleTogglePin}
            className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-px rounded transition-colors ${
              article.is_pinned
                ? "bg-blue-600 text-white"
                : "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-400"
            }`}
            aria-pressed={article.is_pinned}
          >
            {article.is_pinned ? (
              <>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="2" y1="2" x2="22" y2="22" />
                  <line x1="12" y1="17" x2="12" y2="22" />
                  <path d="M9 9v8h6V9" />
                  <path d="M12 2v2" />
                </svg>
                Unpin
              </>
            ) : (
              <>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="12" y1="17" x2="12" y2="22" />
                  <path d="M5 17h14v-1.76a2 2 0 00-1.11-1.79l-1.78-.9A2 2 0 0115 10.76V6h1a2 2 0 000-4H8a2 2 0 000 4h1v4.76a2 2 0 01-1.11 1.79l-1.78.9A2 2 0 005 15.24V17z" />
                </svg>
                Pin
              </>
            )}
          </button>
          <button
            onClick={handleDeactivate}
            className="flex items-center gap-1 text-[10px] font-medium text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-400 px-1.5 py-px rounded transition-colors"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            Hide
          </button>
          <button
            onClick={handleBanUser}
            className="flex items-center gap-1 text-[10px] font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 px-1.5 py-px rounded transition-colors"
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M4.93 4.93l14.14 14.14" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            Ban
          </button>
        </div>
      )}
    </article>
  )
}