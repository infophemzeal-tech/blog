import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import ArticleCard from "@/components/ArticleCard"
import ClapButton from "@/components/ClapButton"
import ReadingProgress from "@/components/ReadingProgress"
import CommentsSection from "@/components/CommentsSection"
import type { Article } from "@/data/articles"
import AudioReader from "@/components/AudioReader"
import ShareButton from "@/components/ShareButton"
import Image from "next/image"
import ArticleActions from "@/components/ArticleActions"
import ViewTracker from "@/components/ViewTracker"

type Props = {
  params: Promise<{ slug: string }>
}

/**
 * GENERATE METADATA
 * Handles SEO for social sharing (OpenGraph, Twitter)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug
  const supabase = await createClient()

  const { data } = await supabase
    .from("articles")
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!data) return { title: "Article not found" }

  const author = (data as any).profiles?.full_name || "Anonymous"

  return {
    title: data.title,
    description: data.subtitle || data.title,
    authors: [{ name: author }],
    openGraph: {
      title: data.title,
      description: data.subtitle || data.title,
      type: "article",
      authors: [author],
      images: data.cover_image ? [{ url: data.cover_image, alt: data.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.subtitle || data.title,
      images: data.cover_image ? [data.cover_image] : [],
    },
  }
}

/**
 * ARTICLE PAGE COMPONENT
 */
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient()

  // 1. Fetch Article & Author Profile
  const { data } = await supabase
    .from("articles")
    .select(`
      *,
      profiles (
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq("slug", slug)
    .eq("published", true)
    .single()

  if (!data) notFound()

  // 2. Fetch Related Articles (Simple recommendation)
  const { data: relatedData } = await supabase
    .from("articles")
    .select(`
      id, title, subtitle, slug,
      publication, read_time,
      claps_count, comments_count,
      cover_image,
      created_at,
      profiles ( full_name )
    `)
    .eq("published", true)
    .neq("slug", slug) // Don't show the current article
    .limit(2)

  const related: Article[] = (relatedData || []).map((a: any) => ({
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

  const author = (data as any).profiles
  const authorName = author?.full_name || "Anonymous"
  const authorInitial = authorName[0].toUpperCase()
  const date = new Date(data.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
  
  const clapsFormatted = data.claps_count >= 1000
    ? `${(data.claps_count / 1000).toFixed(1)}K`
    : String(data.claps_count)

  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 font-sans">
      <ReadingProgress />
      
      {/* JSON-LD Schema for Google Search Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: data.title,
            description: data.subtitle,
            image: data.cover_image || "",
            datePublished: data.created_at,
            author: {
              "@type": "Person",
              name: authorName,
            },
            publisher: {
              "@type": "Organization",
              name: process.env.NEXT_PUBLIC_SITE_NAME || "Medium Clone",
            },
          }),
        }}
      />

      {/* Analytics: Tracking views silently on mount */}
      <ViewTracker articleId={data.id} />
      
      <div className="max-w-5xl mx-auto">
        <Navbar />
      </div>

      <article className="max-w-[680px] mx-auto px-4 py-12">
        {data.publication && (
          <div className="mb-6">
            <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest font-sans">
              {data.publication}
            </span>
          </div>
        )}
        
        {/* Cover Image */}
        {data.cover_image && (
          <div className="relative aspect-[16/9] overflow-hidden mb-12 -mx-4 sm:mx-0 sm:rounded-xl w-[calc(100%+2rem)] sm:w-full bg-stone-100 dark:bg-stone-900">
            <Image
              src={data.cover_image}
              alt={data.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-white leading-[1.15] mb-6">
          {data.title}
        </h1>

        {data.subtitle && (
          <p className="font-serif text-lg sm:text-2xl text-stone-500 dark:text-stone-400 leading-relaxed mb-10">
            {data.subtitle}
          </p>
        )}
        
        {/* Author Metadata Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-y border-stone-100 dark:border-stone-800 mb-10 font-sans">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 dark:bg-stone-700 flex items-center justify-center text-white font-bold">
              {authorInitial}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-white">
                {authorName}
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span>{date}</span>
                <span>·</span>
                <span>{data.read_time}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                    👏 {clapsFormatted}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ArticleActions authorId={data.author_id} articleId={data.id} slug={slug} />
            <button className="px-4 py-1.5 rounded-full border border-stone-900 dark:border-stone-400 text-sm font-medium hover:bg-stone-900 hover:text-white transition-colors">
              Follow
            </button>
          </div>
        </div>

        {/* Text-to-Speech Accessibility */}
        <AudioReader title={data.title} body={data.body || ""} authorName={authorName} />

        {/* Main Article Content (Rendered HTML) */}
        <div
          className="prose prose-stone dark:prose-invert max-w-none font-serif text-[20px] leading-[1.6]
            prose-p:mb-6 prose-p:mt-0
            prose-headings:font-serif prose-headings:font-bold
            prose-blockquote:border-stone-900 prose-blockquote:font-serif prose-blockquote:italic
            prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: data.body || "" }}
        />
        
        {/* Footer Interaction Bar */}
        <div className="flex items-center gap-4 mt-16 pt-8 border-t border-stone-100 dark:border-stone-800">
          <ClapButton articleId={data.id} initialClaps={data.claps_count} />
          <div className="ml-auto flex items-center gap-4">
            <ShareButton title={data.title} slug={slug} />
            <button className="text-stone-400 hover:text-stone-900 transition-colors">🔖</button>
          </div>
        </div>

        {/* Discussion Area */}
        <div className="mt-8">
          <CommentsSection articleId={data.id} initialCount={data.comments_count} />
        </div>
      </article>

      {/* Recirculation: More Stories */}
      {related.length > 0 && (
        <footer className="border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 mt-12">
          <div className="max-w-[680px] mx-auto px-4 py-16">
            <h2 className="font-serif text-2xl font-bold mb-8 text-stone-900 dark:text-white">
              Recommended for you
            </h2>
            <div className="flex flex-col gap-1">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </footer>
      )}
    </main>
  )
}