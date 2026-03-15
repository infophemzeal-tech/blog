"use client"

import { useAuth } from "./AuthProvider"
import Link from "next/link"

type Props = {
  authorId: string
  articleId: string
  slug: string
}

export default function ArticleActions({ authorId, articleId, slug }: Props) {
  const { user } = useAuth()

  if (!user || user.id !== authorId) return null

  return (
    <div className="flex items-center gap-2">

      {/* Edit button */}
      <Link
        href={`/dashboard/edit/${articleId}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400 hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit
      </Link>

    </div>
  )
}