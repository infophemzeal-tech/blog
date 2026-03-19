"use client"

import { useEffect, useState } from "react"
import { useSearch } from "./SearchProvider"
import ArticleCard from "./ArticleCard"
import { createClient } from "../lib/supabase/client"
import type { Article } from "../data/articles"
const formatGistDate = (dateString: string) => {
  const date = new Date(dateString);
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  // Ordinal logic (1st, 2nd, 3rd, etc.)
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `Posted on ${dayName} ${getOrdinal(day)} ${monthName}, ${year} - gistpadi.ng`;
};
type Props = {
  activeTab: "for-you" | "featured"
  activeTopic: string
}

export default function Feed({ activeTab, activeTopic }: Props) {
  const { query: searchKeyword } = useSearch()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)

      // 1. BUILD THE QUERY
      let queryBuilder = supabase
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
          views_count,
          cover_image,
          created_at,
          published,
          topic_id,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq("published", true)
         .eq("is_deactivated", false) // Don't show deactivated articles
         .order("is_pinned", { ascending: false }) // PINNED FIRST
        .order(
          activeTab === "featured" ? "claps_count" : "created_at",
          { ascending: false }
        )


        // ─── HANDLING TABS ──────────────────────────────────────────
if (activeTab === "featured") {
  // Option A: Sort by Claps (Popularity)
  queryBuilder = queryBuilder.order("claps_count", { ascending: false })
  
  // Option B: (If you have an 'is_featured' column in your DB)
  // queryBuilder = queryBuilder.eq("is_featured", true)
} else {
  // "For You" - Standard chronological order
  queryBuilder = queryBuilder.order("created_at", { ascending: false })
}
      // 2. APPLY TOPIC FILTER BY COLUMN (Not junction table)
      if (activeTopic) {
        // First, get the ID for the topic name in the URL
        const formattedTopicName = activeTopic.replace(/-/g, " ")
        
        const { data: topicData } = await supabase
          .from("topics")
          .select("id")
          .ilike("name", formattedTopicName)
          .single()

        if (topicData) {
          // Filter articles where 'topic_id' column matches this topic ID
          queryBuilder = queryBuilder.eq("topic_id", topicData.id)
        } else {
          // If topic doesn't exist, return nothing
          setArticles([])
          setLoading(false)
          return
        }
      }

      const { data, error } = await queryBuilder

      if (error) {
        console.error("Feed fetch error:", error.message)
      } else if (data) {
        const mapped: Article[] = data.map((a: any) => ({
  id: String(a.id),
  author: a.profiles?.full_name || "Anonymous",
  authorInitial: (a.profiles?.full_name?.[0] || "A").toUpperCase(),
  publication: a.publication || "",
  slug: a.slug,
  title: a.title,
  subtitle: a.subtitle || "",
  // --- UPDATED DATE LOGIC ---
  date: formatGistDate(a.created_at), 
  claps: String(a.claps_count || 0),
  comments: a.comments_count || 0,
  readTime: a.read_time || "5 min read",
  body: "",
  coverImage: a.cover_image || "",
  views_count: a.views_count || 0,
}))
        setArticles(mapped)
      }
      setLoading(false)
    }

    fetchArticles()
  }, [activeTab, activeTopic])

  // Local Search filtering
  const filtered = searchKeyword.trim()
    ? articles.filter(art => art.title.toLowerCase().includes(searchKeyword.toLowerCase()))
    : articles

  if (loading) return <div className="py-10 animate-pulse text-stone-400">Loading stories...</div>

  return (
    <div className="flex flex-col">
      {filtered.length > 0 ? (
        filtered.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))
      ) : (
        <div className="text-center py-20 text-stone-500">
          No articles found in "{activeTopic.replace(/-/g, " ")}"
        </div>
      )}
    </div>
  )
}