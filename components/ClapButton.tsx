"use client"

import { useState, useEffect } from "react"
import { createClient } from "../lib/supabase/client"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"

type Props = {
  articleId: string
  initialClaps: number
}

export default function ClapButton({ articleId, initialClaps }: Props) {
  const [clapped, setClapped] = useState(false)
  const [count, setCount] = useState(initialClaps)
  const [animating, setAnimating] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // Check if user already clapped on mount
  useEffect(() => {
    if (!user) return

    const checkClap = async () => {
      const { data } = await supabase
        .from("claps")
        .select("id")
        .eq("article_id", articleId)
        .eq("user_id", user.id)
        .single()

      if (data) setClapped(true)
    }

    checkClap()
  }, [user, articleId])

  const handleClap = async () => {
    // Not logged in — redirect to sign in
    if (!user) {
      router.push(`/auth/signin?next=/article/${articleId}`)
      return
    }

    if (loading) return
    setLoading(true)

    if (clapped) {
      // Remove clap
      await supabase
        .from("claps")
        .delete()
        .eq("article_id", articleId)
        .eq("user_id", user.id)

      // Decrement count
      await supabase
        .from("articles")
        .update({ claps_count: count - 1 })
        .eq("id", articleId)

      setCount((c) => c - 1)
      setClapped(false)

    } else {
      // Add clap
      await supabase
        .from("claps")
        .insert({ article_id: articleId, user_id: user.id })

      // Increment count
      await supabase
        .from("articles")
        .update({ claps_count: count + 1 })
        .eq("id", articleId)

      setCount((c) => c + 1)
      setClapped(true)
      setAnimating(true)
      setShowBurst(true)
      setTimeout(() => setAnimating(false), 200)
      setTimeout(() => setShowBurst(false), 600)
    }

    setLoading(false)
    router.refresh()
  }

  const displayCount = count >= 1000
    ? `${(count / 1000).toFixed(1)}K`
    : String(count)

  return (
    <div className="relative flex items-center gap-2">

      {showBurst && (
        <span className="absolute -top-1 -left-1 w-10 h-10 rounded-full border-2 border-green-400 animate-ping opacity-75 pointer-events-none" />
      )}

      <button
        onClick={handleClap}
        disabled={loading}
        className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-150 cursor-pointer disabled:opacity-50 ${
          clapped
            ? "border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950"
            : "border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400 hover:border-stone-500 dark:hover:border-stone-300"
        } ${animating ? "scale-125" : "scale-100"}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={clapped ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2.5c0-1.1-.9-2-2-2s-2 .9-2 2v7.5L9 8.5c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8l5.3 5.3A6 6 0 0020 11.3V6.5c0-1.1-.9-2-2-2s-2 .9-2 2"/>
          <path d="M14.5 5.5c0-1.1-.9-2-2-2"/>
        </svg>
      </button>

      <div className="flex flex-col leading-none">
        <span className={`text-sm font-medium transition-colors duration-150 ${
          clapped
            ? "text-green-600 dark:text-green-400"
            : "text-stone-500 dark:text-stone-400"
        }`}>
          {displayCount}
        </span>
        <span className={`text-xs transition-all duration-200 ${
          clapped
            ? "text-green-500 dark:text-green-400 opacity-100"
            : "opacity-0"
        }`}>
          ✓ Clapped
        </span>
      </div>

    </div>
  )
}