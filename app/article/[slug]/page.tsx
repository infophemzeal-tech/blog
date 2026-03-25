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
import Link from "next/link"

type Props = {
  params: Promise<{ slug: string }>
}

// ─────────────────────────────────────────────
// SEO METADATA — Production Grade
// ─────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from("articles")
    .select(`
      title, subtitle, cover_image,
      is_deactivated, published, created_at, slug,
      profiles ( full_name )
    `)
    .eq("slug", slug)
    .single()

  // Moderated or missing content — safe fallback
  if (!data || data.is_deactivated || !data.published) {
    return {
      title: "Article Not Found | Nairaly",
      robots: { index: false, follow: false },
    }
  }

  const author = (data as any).profiles?.full_name || "Anonymous"
  const description = data.subtitle || data.title
  const imageUrl = data.cover_image || "https://nairaly.com/og-default.jpg"
  const url = `https://nairaly.com/article/${data.slug}`
  const fullTitle = `${data.title} | Nairaly`

  return {
    title: fullTitle,
    description,
    authors: [{ name: author }],

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: "Nairaly",
      type: "article",
      publishedTime: data.created_at,
      authors: [author],
      locale: "en_NG",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: "@nairalycom",
      site: "@nairalycom",
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

// ─────────────────────────────────────────────
// ARTICLE PAGE — $5,000 Level
// ─────────────────────────────────────────────
export default async function Page({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch Main Article
 const { data: article } = await supabase
    .from("articles")
    .select("*, profiles ( full_name, avatar_url, bio )")
    .eq("slug", slug)
    .eq("published", true)
    .eq("is_deactivated", false)
    .single()

  if (!article) notFound()

  // 2. Fetch Related Articles (same topic if possible)
  const { data: relatedData } = await supabase
    .from("articles")
    .select(`
      id, title, subtitle, slug,
      publication, read_time,
      claps_count, comments_count,
      cover_image, created_at,
      profiles ( full_name )
    `)
    .eq("published", true)
    .eq("is_deactivated", false)
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(3)

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

  const authorName = (article as any).profiles?.full_name || 
                   (article as any).author_name || 
                   "Nairaly Writer"
  const authorInitial = authorName[0].toUpperCase()

  const dateStr = new Date(article.created_at).toLocaleDateString("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const dateISO = new Date(article.created_at).toISOString()

  // JSON-LD Structured Data — Full NewsArticle schema for Google News
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.subtitle || article.title,
    image: article.cover_image
      ? [article.cover_image]
      : ["https://nairaly.com/og-default.jpg"],
    datePublished: dateISO,
    dateModified: article.updated_at || dateISO,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Nairaly",
      logo: {
        "@type": "ImageObject",
        url: "https://nairaly.com/logo.png",
        width: 200,
        height: 60,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://nairaly.com/article/${article.slug}`,
    },
    url: `https://nairaly.com/article/${article.slug}`,
    isAccessibleForFree: true,
    inLanguage: "en-NG",
  }

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 font-sans selection:bg-green-100 dark:selection:bg-green-900/40">
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* View Tracker (silent) */}
      <ViewTracker articleId={article.id} />

      {/* ── NAVBAR ── */}
      <div className="max-w-5xl mx-auto">
        <Navbar />
      </div>

      {/* ── HERO COVER IMAGE ── */}
      {article.cover_image && (
        <div className="w-full max-w-5xl mx-auto px-4 mt-4">
          <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 shadow-lg">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
            {/* Subtle gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      )}

      {/* ── ARTICLE BODY ── */}
      <article className="max-w-[680px] mx-auto px-4 py-12">

        {/* Publication Tag */}
        {article.publication && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-widest border border-green-100 dark:border-green-800">
              {article.publication}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-white leading-[1.1] mb-5 tracking-tight">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="font-serif text-lg sm:text-2xl text-stone-500 dark:text-stone-400 leading-relaxed mb-8">
            {article.subtitle}
          </p>
        )}

        {/* ── AUTHOR BAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5 border-y border-stone-100 dark:border-stone-800 mb-10">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-base shadow-sm ring-2 ring-green-100 dark:ring-green-900">
              {authorInitial}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
                {authorName}
              </span>
              <div className="flex items-center gap-2 text-xs text-stone-400 font-medium mt-0.5">
                <time dateTime={dateISO}>{dateStr}</time>
                {article.read_time && (
                  <>
                    <span>·</span>
                    <span>{article.read_time} read</span>
                  </>
                )}
                {article.views_count > 0 && (
                  <>
                    <span>·</span>
                    <span>{article.views_count.toLocaleString()} views</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ArticleActions
              authorId={article.author_id}
              articleId={article.id}
              slug={article.slug}
            />
            <button className="px-4 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold hover:bg-stone-700 dark:hover:bg-stone-100 transition-colors">
              Follow
            </button>
          </div>
        </div>

        {/* ── AUDIO READER ── */}
        <AudioReader
          title={article.title}
          body={article.body || ""}
          authorName={authorName}
        />

        {/* ── ARTICLE CONTENT ── */}
        <div
          className="
            prose prose-stone dark:prose-invert max-w-none
            font-sans text-[18px] leading-[1.85] text-stone-800 dark:text-stone-200
            prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900 dark:prose-headings:text-white prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:mb-6 prose-p:leading-[1.85]
            prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-green-500 prose-blockquote:pl-5 prose-blockquote:text-stone-600 dark:prose-blockquote:text-stone-400 prose-blockquote:not-italic
            prose-img:rounded-xl prose-img:shadow-md
            prose-strong:text-stone-900 dark:prose-strong:text-white
            prose-code:bg-stone-100 dark:prose-code:bg-stone-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-green-700 dark:prose-code:text-green-400
            prose-pre:bg-stone-900 dark:prose-pre:bg-stone-800 prose-pre:rounded-xl
            prose-ul:leading-relaxed prose-ol:leading-relaxed
            prose-li:mb-1
            prose-hr:border-stone-100 dark:prose-hr:border-stone-800
          "
          dangerouslySetInnerHTML={{ __html: article.body || "" }}
        />

        {/* ── TAGS ── */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-stone-100 dark:border-stone-800">
            {article.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/?topic=${tag}`}
                className="px-3 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* ── CLAP / SHARE BAR ── */}
        <div className="flex items-center gap-4 mt-10 pt-8 border-t border-stone-100 dark:border-stone-800">
          <ClapButton
            articleId={article.id}
            initialClaps={article.claps_count}
          />
          <div className="ml-auto flex items-center gap-3">
            <ShareButton title={article.title} slug={slug} />
            <button
              title="Bookmark"
              className="p-2 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              🔖
            </button>
          </div>
        </div>

        {/* ── AUTHOR BIO CARD ── */}
        <div className="mt-12 p-6 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-xl shadow-sm">
              {authorInitial}
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-0.5">
                Written by
              </p>
              <p className="font-bold text-stone-900 dark:text-white text-base">
                {authorName}
              </p>
            </div>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            A writer on Nairaly — where curious Nigerians come to read, write,
            and think.
          </p>
          <button className="mt-4 px-5 py-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold hover:bg-stone-700 dark:hover:bg-stone-100 transition-colors">
            Follow {authorName}
          </button>
        </div>

        {/* ── COMMENTS ── */}
        <div className="mt-10">
          <CommentsSection
            articleId={article.id}
            initialCount={article.comments_count}
          />
        </div>
      </article>

      {/* ── RELATED ARTICLES ── */}
      {related.length > 0 && (
        <footer className="border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 mt-16">
          <div className="max-w-[680px] mx-auto px-4 py-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                More from Nairaly
              </h2>
              <Link
                href="/"
                className="text-sm font-medium text-green-600 dark:text-green-400 hover:underline"
              >
                See all →
              </Link>
            </div>
            <div className="flex flex-col divide-y divide-stone-100 dark:divide-stone-800">
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