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
  const year = date.getFullYear()
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"]
    const v = n % 100
    return n + (s[(v - 20) % 10] || s[v] || s[0])
  }
  return `Posted on ${dayName} ${getOrdinal(day)} ${monthName}, ${year}`
}

export default function Feed({ activeTab, activeTopic }: Props) {
  const { query: searchKeyword } = useSearch()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError(null)

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

    if (activeTopic) {
      const { data: topicData, error: topicError } = await supabase
        .from("topics")
        .select("id")
        .ilike("name", activeTopic.replace(/-/g, " "))
        .single()

      if (topicError || !topicData) {
        setArticles([])
        setLoading(false)
        return
      }
      queryBuilder = queryBuilder.eq("topic_id", topicData.id)
    }

    const { data, error } = await queryBuilder.limit(20)

    if (error) {
      console.error("Feed fetch error:", error)
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
        claps: a.claps_count >= 1000
          ? `${(a.claps_count / 1000).toFixed(1)}K`
          : String(a.claps_count || 0),
        comments: a.comments_count || 0,
        readTime: a.read_time || "5 min read",
        body: "",
        coverImage: a.cover_image || "",
        views_count: a.views_count || 0,
      }))
      setArticles(mapped)
    }
    setLoading(false)
  }, [activeTab, activeTopic])

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