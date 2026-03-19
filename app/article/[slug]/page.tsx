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
 * Next.js 15 requires awaiting params
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from("articles")
    .select(`
      title, subtitle, cover_image, 
      is_deactivated, published,
      profiles ( full_name )
    `)
    .eq("slug", slug)
    .single()

  // SEO safety check: If moderated or missing, return generic title
  if (!data || data.is_deactivated || !data.published) {
    return { title: "Article not found" }
  }

  const author = (data as any).profiles?.full_name || "Anonymous"

  return {
    title: data.title,
    description: data.subtitle || data.title,
    authors: [{ name: author }],
    openGraph: {
      title: data.title,
      description: data.subtitle || data.title,
      type: "article",
      images: data.cover_image ? [{ url: data.cover_image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      images: data.cover_image ? [data.cover_image] : [],
    },
  }
}

/**
 * ARTICLE PAGE COMPONENT
 */
export default async function Page({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch Main Article Data (Checking for Moderation)
  const { data: article } = await supabase
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
    .eq("is_deactivated", false) // IMPORTANT: Block Moderated Content
    .single()

  if (!article) notFound()

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
    .eq("is_deactivated", false)
    .neq("slug", slug)
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
    }),
    claps: String(a.claps_count || 0),
    comments: a.comments_count || 0,
    readTime: a.read_time,
    body: "",
    coverImage: a.cover_image || "",
  }))

  const authorName = (article as any).profiles?.full_name || "Anonymous"
  const dateStr = new Date(article.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 font-sans selection:bg-stone-200">
      <ReadingProgress />
      
      {/* Schema.org for Google Rankings */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            image: article.cover_image || "",
            datePublished: article.created_at,
            author: { "@type": "Person", name: authorName }
          }),
        }}
      />

      <ViewTracker articleId={article.id} />
      
      <div className="max-w-5xl mx-auto">
        <Navbar />
      </div>

      <article className="max-w-[680px] mx-auto px-4 py-12">
        {article.publication && (
          <div className="mb-6">
            <span className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest">
              {article.publication}
            </span>
          </div>
        )}
        
        {article.cover_image && (
          <div className="relative aspect-[16/9] overflow-hidden mb-12 -mx-4 sm:mx-0 sm:rounded-2xl w-[calc(100%+2rem)] sm:w-full bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 shadow-sm">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="font-serif text-lg sm:text-2xl text-stone-500 dark:text-stone-400 leading-relaxed mb-10">
            {article.subtitle}
          </p>
        )}
        
        {/* Author metadata and moderation check section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-6 border-y border-stone-100 dark:border-stone-800 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 dark:bg-stone-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {authorName[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-stone-900 dark:text-white">{authorName}</span>
              <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                <span>{dateStr}</span>
                <span>·</span>
                <span>{article.read_time}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Component to allow delete/edit if current user owns article or is Super Admin */}
            <ArticleActions authorId={article.author_id} articleId={article.id} slug={article.slug} />
            <button className="px-4 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors">
              Follow
            </button>
          </div>
        </div>

        {/* Dynamic Voice Integration */}
        <AudioReader title={article.title} body={article.body || ""} authorName={authorName} />

        {/* Content Render - Matches KISS font rule (Georgia Titles, Sans Content) */}
        <div
          className="prose prose-stone dark:prose-invert max-w-none font-sans text-[18px] leading-[1.8]
            prose-headings:font-serif prose-headings:font-bold
            prose-p:mb-6 prose-a:text-green-600 dark:prose-a:text-green-500
            prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:border-stone-900
            prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: article.body || "" }}
        />
        
        <div className="flex items-center gap-4 mt-16 pt-8 border-t border-stone-100 dark:border-stone-800">
          <ClapButton articleId={article.id} initialClaps={article.claps_count} />
          <div className="ml-auto flex items-center gap-4">
            <ShareButton title={article.title} slug={slug} />
            <button className="text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors">🔖</button>
          </div>
        </div>

        <div className="mt-8">
          <CommentsSection articleId={article.id} initialCount={article.comments_count} />
        </div>
      </article>

      {/* Recirculation Footnote */}
      {related.length > 0 && (
        <footer className="border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/30 mt-20">
          <div className="max-w-[680px] mx-auto px-4 py-16">
            <h2 className="font-serif text-2xl font-bold mb-10 text-stone-900 dark:text-white">
              Related from GistPadi
            </h2>
            <div className="flex flex-col gap-0">
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