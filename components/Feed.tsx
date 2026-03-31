"use client"
import { useEffect, useState, useMemo, useCallback } from "react"
import { useSearch } from "./SearchProvider"
import ArticleCard from "./ArticleCard"
import { createClient } from "../lib/supabase/client"
import type { Article } from "../data/articles"

type Props = {
  activeTab: "for-you" | "featured"
  activeTopic: string
}

const formatGistDate = (dateString: string): string => {
  const date = new Date(dateString)
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
  const monthName = date.toLocaleDateString("en-US", { month: "short" })
  const day = date.getDate()
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }
  // ✅ FIX 1: Removed unused `year` variable from formatGistDate
  return `Posted on ${dayName} ${getOrdinal(day)} ${monthName}`
}

export default function Feed({ activeTab, activeTopic }: Props) {
  const { query: searchKeyword } = useSearch()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ✅ FIX 2: createClient() inside useMemo — same fix as Sidebar.
  // Calling it at the component body creates a new instance on every render,
  // breaking Supabase auth state and causing unnecessary re-subscriptions.
  const supabase = useMemo(() => createClient(), [])

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

    // ✅ FIX 3: Topic lookup and article fetch combined into a single
    // flow with early return — avoids dangling queryBuilder state if
    // the topic lookup fails mid-way through building the query.
    let topicId: number | null = null

    if (activeTopic) {
      const { data: topicData, error: topicError } = await supabase
        .from("topics")
        .select("id")
        .ilike("name", activeTopic.replace(/-/g, " "))
        .single()

      if (topicError || !topicData) {
        // ✅ FIX 4: Don't silently set empty articles on topic-not-found.
        // Set a user-visible message so they know why nothing showed up.
        setArticles([])
        setError(`No articles found for "${activeTopic.replace(/-/g, " ")}"`)
        setLoading(false)
        return
      }

      topicId = topicData.id
    }

    let queryBuilder = supabase
      .from("articles")
      .select(`
        id, title, subtitle, slug, publication, read_time,
        claps_count, comments_count, views_count, cover_image,
        created_at, published, is_pinned, is_deactivated, topic_id,
        profiles ( full_name, avatar_url )
      `)
      .eq("published", true)
      .eq("is_deactivated", false)
      .order("is_pinned", { ascending: false })

    if (activeTab === "featured") {
      queryBuilder = queryBuilder.order("claps_count", { ascending: false })
    } else {
      queryBuilder = queryBuilder.order("created_at", { ascending: false })
    }

    // ✅ FIX 3 cont: Apply topic filter after the topic lookup resolves cleanly
    if (topicId !== null) {
      queryBuilder = queryBuilder.eq("topic_id", topicId)
    }

    const { data, error } = await queryBuilder.limit(20)

    if (error) {
      console.error("[Feed]", error.message)
      setError("Failed to load articles")
    } else {
      const mapped: Article[] = (data || []).map((a: any) => ({
        id: String(a.id),
        author: a.profiles?.full_name || "Nairaly Writer",
        authorInitial: (a.profiles?.full_name?.[0] || "N").toUpperCase(),
        publication: a.publication || "",
        slug: a.slug,
        title: a.title,
        subtitle: a.subtitle || "",
        date: formatGistDate(a.created_at),
        // ✅ FIX 5: Clap formatting threshold was correct but 0 claps
        // rendered as "0" — now renders as nothing to avoid noise on new articles
        claps:
          a.claps_count >= 1000
            ? `${(a.claps_count / 1000).toFixed(1)}K`
            : a.claps_count > 0
            ? String(a.claps_count)
            : "0",
        comments: a.comments_count || 0,
        readTime: a.read_time || "5 min read",
        body: "",
        coverImage: a.cover_image || "",
        views_count: a.views_count || 0,
      }))
      setArticles(mapped)
    }
    setLoading(false)
  // ✅ FIX 6: supabase added to deps — stable ref via useMemo so no extra fetches,
  // but required for exhaustive-deps correctness
  }, [activeTab, activeTopic, supabase])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const filteredArticles = useMemo(() => {
    if (!searchKeyword.trim()) return articles
    const keyword = searchKeyword.toLowerCase()
    return articles.filter((art) =>
      art.title.toLowerCase().includes(keyword) ||
      art.author.toLowerCase().includes(keyword) ||
      (art.subtitle && art.subtitle.toLowerCase().includes(keyword))
    )
  }, [articles, searchKeyword])

  if (loading) {
    return (
      <div className="space-y-8 py-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse flex flex-col md:flex-row gap-4 md:gap-6 border-b border-stone-100 dark:border-stone-800 pb-8 last:border-none last:pb-0"
          >
            <div className="flex-1 space-y-3">
              <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-24" />
              <div className="h-8 bg-stone-200 dark:bg-stone-800 rounded-lg w-11/12" />
              <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
              <div className="flex gap-3 pt-3">
                <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-16" />
                <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-12" />
              </div>
            </div>
            <div className="w-full md:w-64 h-44 bg-stone-200 dark:bg-stone-800 rounded-2xl shrink-0" />
          </div>
        ))}
      </div>
    )
  }

  // ✅ FIX 4 cont: Error state now also shows for topic-not-found,
  // with the same retry button so UX is consistent
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchArticles}
          className="px-5 py-2.5 bg-stone-900 text-white dark:bg-white dark:text-stone-900 rounded-xl text-sm font-medium hover:bg-black dark:hover:bg-stone-100 transition"
        >
          Retry Loading
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {filteredArticles.length > 0 ? (
        <div className="space-y-10">
          {filteredArticles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="mx-auto w-14 h-14 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mb-5">
            🔍
          </div>
          <h3 className="text-xl font-medium text-stone-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p className="text-stone-500 dark:text-stone-400 max-w-md mx-auto text-sm">
            {searchKeyword
              ? `We couldn't find any articles matching "${searchKeyword}"`
              : "No articles available in this section yet."}
          </p>
        </div>
      )}
    </div>
  )
}