"use client"

import { useEffect, useState } from "react"
import { useSearch } from "./SearchProvider"
import ArticleCard from "./ArticleCard"
import { createClient } from "../lib/supabase/client"
import type { Article } from "../data/articles"

type Props = {
  activeTab: "for-you" | "featured"
}

export default function Feed({ activeTab }: Props) {
  const { query } = useSearch()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from("articles")
        .select(`
          id,
          title,
          subtitle,
          slug,
          publication,
          read_time,
          claps_count,
          comments_count,
          cover_image,
          created_at,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("published", true)
        .order(
          activeTab === "featured" ? "claps_count" : "created_at",
          { ascending: false }
        )

      if (error) {
        console.error("Feed fetch error:", error.message)
        setLoading(false)
        return
      }

      if (data) {
        const mapped: Article[] = data.map((a: any) => ({
          id: String(a.id),
          author: a.profiles?.full_name || "Anonymous",
          authorInitial: (a.profiles?.full_name?.[0] || "A").toUpperCase(),
          publication: a.publication || "",
          slug: a.slug,
          title: a.title,
          subtitle: a.subtitle || "",
          date: new Date(a.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          claps: a.claps_count >= 1000
            ? `${(a.claps_count / 1000).toFixed(1)}K`
            : String(a.claps_count),
          comments: a.comments_count,
          readTime: a.read_time,
          body: "",
          coverImage: a.cover_image || "",
        }))

        setArticles(mapped)
      }
      setLoading(false)
    }

    fetchArticles()
  }, [activeTab])

  const filtered = query.trim()
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          article.author.toLowerCase().includes(query.toLowerCase()) ||
          article.publication.toLowerCase().includes(query.toLowerCase())
      )
    : articles

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="flex-1 flex flex-col gap-3">
              <div className="h-3 bg-stone-200 dark:bg-stone-800 rounded w-1/4" />
              <div className="h-5 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
              <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/2" />
            </div>
            <div className="w-24 h-20 bg-stone-200 dark:bg-stone-800 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {filtered.length > 0 ? (
        filtered.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">
            {activeTab === "featured" ? "⭐" : "🔍"}
          </p>
          <p className="text-stone-500 dark:text-stone-400 font-medium">
            {query
              ? `No results for "${query}"`
              : activeTab === "featured"
              ? "No featured articles yet — start clapping on stories!"
              : "No articles yet"}
          </p>
        </div>
      )}
    </div>
  )
}