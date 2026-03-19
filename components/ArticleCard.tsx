"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Article } from "../data/articles"
import { isSuperAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/client"

type ArticleCardProps = {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    isSuperAdmin().then(setIsAdmin)
  }, [])

  const handleTogglePin = async () => {
    const { error } = await supabase
      .from('articles')
      .update({ is_pinned: !article.is_pinned })
      .eq('id', article.id)
    
    if (!error) window.location.reload()
  }

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to hide this article from the public?")) return
    const { error } = await supabase
      .from('articles')
      .update({ is_deactivated: true })
      .eq('id', article.id)
    
    if (!error) window.location.reload()
  }

  const handleBanUser = async () => {
    if (!confirm(`Ban ${article.author} from posting?`)) return
    
    // This updates the author's profile based on the full_name 
    // (Better to use author_id if available in your Article type)
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true })
      .eq('full_name', article.author)
    
    if (!error) alert("User has been restricted.")
  }

  return (
    <div className="group flex flex-col py-6 border-b border-stone-100 dark:border-stone-800">
      
      {/* Article Status Badges (Admin only) */}
      {isAdmin && (article.is_pinned || article.is_deactivated) && (
        <div className="flex gap-2 mb-2">
          {article.is_pinned && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Pinned</span>}
          {article.is_deactivated && <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Deactivated</span>}
        </div>
      )}

      <div className="flex items-start justify-between gap-3 sm:gap-6">
        {/* Left — content */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">

          {/* Author row */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-6 h-6 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-xs font-medium shrink-0">
              {article.authorInitial}
            </div>
            <span className="text-sm text-stone-600 dark:text-stone-400 truncate font-medium">
              {article.author}
            </span>
            {article.publication && (
              <span className="text-sm text-stone-400 dark:text-stone-500 hidden sm:inline font-medium">
                in <span className="text-stone-600 dark:text-stone-400">{article.publication}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <Link href={`/article/${article.slug}`}>
            <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug hover:underline cursor-pointer">
              {article.title}
            </h2>
          </Link>

          {/* Subtitle */}
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 hidden sm:block font-serif">
            {article.subtitle}
          </p>

          {/* Bottom row */}
          <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500 mt-1 font-medium flex-wrap">
             {/* Date */}
            <span className="whitespace-nowrap">{article.date}</span>
            
            {/* Claps */}
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2.5c0-1.1-.9-2-2-2s-2 .9-2 2v7.5L9 8.5c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8l5.3 5.3A6 6 0 0020 11.3V6.5c0-1.1-.9-2-2-2s-2 .9-2 2"/>
              </svg>
              <span>{article.claps}</span>
            </div>

            {/* Views */}
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <span>{(article.views_count || 0) >= 1000
                ? `${((article.views_count || 0) / 1000).toFixed(1)}K`
                : article.views_count || 0}
              </span>
            </div>

            {/* Icons Buttons */}
            <div className="ml-auto flex items-center gap-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
               <button className="hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
               </button>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <Link href={`/article/${article.slug}`} className="shrink-0">
          <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden bg-stone-200 dark:bg-stone-700 hover:opacity-80 transition-opacity">
            {article.coverImage ? (
              <Image src={article.coverImage} alt={article.title} fill sizes="176px" className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800" />
            )}
          </div>
        </Link>
      </div>

      {/* ADMIN CONTROL PANEL */}
      {isAdmin && (
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-stone-50 dark:border-stone-800/50">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Admin Actions:</span>
          
          <button 
            onClick={handleTogglePin}
            className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
              article.is_pinned ? "bg-blue-600 text-white" : "text-blue-600 bg-blue-50 hover:bg-blue-100"
            }`}
          >
            {article.is_pinned ? "📍 Unpin" : "📌 Pin Story"}
          </button>

          <button 
            onClick={handleDeactivate}
            className="text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
          >
            🚫 Deactivate
          </button>

          <button 
            onClick={handleBanUser}
            className="text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 px-2 py-1 rounded transition-colors"
          >
            🔨 Ban Author
          </button>
        </div>
      )}
    </div>
  )
}