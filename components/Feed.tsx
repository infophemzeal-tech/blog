"use client"

import { useEffect, useState } from "react"
import { useSearch } from "./SearchProvider"
import ArticleCard from "./ArticleCard"
import { createClient } from "../lib/supabase/client"
import type { Article } from "../data/articles"

// --- Professional Utility: Gist Date Formatter ---
const formatGistDate = (dateString: string) => {
  const date = new Date(dateString);
  const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return `Posted on ${dayName} ${getOrdinal(day)} ${monthName}, ${year} - Nairaly.com`;
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

      // 1. Build Base Query
      let queryBuilder = supabase
        .from("articles")
        .select(`
          id, title, subtitle, slug, publication, read_time,
          claps_count, comments_count, views_count, cover_image,
          created_at, published, is_pinned, is_deactivated, topic_id,
          profiles ( full_name, avatar_url )
        `)
        .eq("published", true)
        .eq("is_deactivated", false); // 🛡️ Hide moderated content

      // 2. Multi-Level Sorting ($5000+ Logic)
      // First priority: Pinned items at the top
      queryBuilder = queryBuilder.order("is_pinned", { ascending: false });

      // Second priority: Based on active tab
      if (activeTab === "featured") {
        queryBuilder = queryBuilder.order("claps_count", { ascending: false });
      } else {
        queryBuilder = queryBuilder.order("created_at", { ascending: false });
      }

      // 3. Topic Filtering logic
      if (activeTopic) {
        const formattedTopicName = activeTopic.replace(/-/g, " ");
        const { data: topicData } = await supabase
          .from("topics")
          .select("id")
          .ilike("name", formattedTopicName)
          .single();

        if (topicData) {
          queryBuilder = queryBuilder.eq("topic_id", topicData.id);
        } else {
          setArticles([]); // No match found for this slug
          setLoading(false);
          return;
        }
      }

      // Execute
      const { data, error } = await queryBuilder;

      if (error) {
        console.error("Feed error:", error.message);
      } else if (data) {
        const mapped: Article[] = data.map((a: any) => ({
          id: String(a.id),
          author: a.profiles?.full_name || "Writer",
          authorInitial: (a.profiles?.full_name?.[0] || "G").toUpperCase(),
          publication: a.publication || "",
          slug: a.slug,
          title: a.title,
          subtitle: a.subtitle || "",
          date: formatGistDate(a.created_at), // 🇳🇬 Brand formatted date
          claps: a.claps_count >= 1000 ? `${(a.claps_count / 1000).toFixed(1)}K` : String(a.claps_count || 0),
          comments: a.comments_count || 0,
          readTime: a.read_time || "5 min read",
          body: "",
          coverImage: a.cover_image || "",
          views_count: a.views_count || 0,
        }));
        setArticles(mapped);
      }
      setLoading(false);
    };

    fetchArticles();
  }, [activeTab, activeTopic, supabase]);

  // 4. In-Memory Search (Fast filtering)
  const filtered = searchKeyword.trim()
    ? articles.filter(art => 
        art.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        art.author.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : articles;

  // 5. High-End Skeleton Loading State
  if (loading) {
    return (
      <div className="flex flex-col gap-8 py-8 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
             <div className="flex-1 space-y-4">
                <div className="h-4 bg-stone-100 dark:bg-stone-800 rounded w-1/4" />
                <div className="h-6 bg-stone-100 dark:bg-stone-800 rounded w-3/4" />
                <div className="h-10 bg-stone-100 dark:bg-stone-800 rounded w-full" />
             </div>
             <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-2xl shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col mb-20">
      {filtered.length > 0 ? (
        filtered.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))
      ) : (
        <div className="text-center py-24 flex flex-col items-center gap-4">
          <p className="text-stone-400 font-medium">
            {searchKeyword ? `No gists found matching "${searchKeyword}"` : `No gists found in this section yet.`}
          </p>
        </div>
      )}
    </div>
  );
}