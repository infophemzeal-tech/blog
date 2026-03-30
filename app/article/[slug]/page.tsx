import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import ArticleCard from "@/components/ArticleCard"
import ReadingProgress from "@/components/ReadingProgress"
import ShareButton from "@/components/ShareButton"
import Image from "next/image"
import ArticleActions from "@/components/ArticleActions"
import Link from "next/link"
import sanitizeHtml from "sanitize-html"
import type { Article } from "@/data/articles"
import ClapButton from "@/components/ClapButton"
import { AudioReader, CommentsSection, ViewTracker } from "@/components/DeferredComponents"

// ─── Constants ────────────────────────────────────────────────────────────────

const SITE_URL = "https://nairaly.com"

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthorProfile {
  full_name: string | null
  avatar_url: string | null
  bio: string | null
}

interface ArticleResponse {
  id: string
  slug: string
  title: string
  subtitle: string | null
  body: string | null
  cover_image: string | null
  published: boolean
  is_deactivated: boolean
  created_at: string
  updated_at: string | null
  read_time: string | null
  views_count: number
  claps_count: number
  comments_count: number
  author_id: string
  publication: string | null
  tags: string[] | null
  profiles: AuthorProfile | null
}

interface RelatedArticle {
  id: string
  slug: string
  title: string
  subtitle: string | null
  cover_image: string | null
  publication: string | null
  read_time: string | null
  claps_count: number
  comments_count: number
  created_at: string
  profiles: Pick<AuthorProfile, "full_name"> | null
}

type Props = {
  params: Promise<{ slug: string }>
}

// ─── Config ───────────────────────────────────────────────────────────────────

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "figure", "figcaption", "h1", "h2", "h3", "h4", "iframe",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height", "class"],
    iframe: ["src", "width", "height", "allowfullscreen", "title"],
    a: ["href", "target", "rel", "class"],
    "*": ["class"],
  },
  // ✅ Fix 2 — auto-upgrade http:// to https:// and enforce noopener
  transformTags: {
    a: (tagName, attribs) => ({
      tagName: "a",
      attribs: {
        ...attribs,
        href: attribs.href?.replace(/^http:\/\//i, "https://") ?? attribs.href,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    }),
  },
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
}

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIwIiBoZWlnaHQ9IjQwNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTdlNWUyIi8+PC9zdmc+"

const RELATED_SELECT =
  "id, title, subtitle, slug, publication, read_time, claps_count, comments_count, cover_image, created_at, tags, profiles ( full_name )"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthorName(profiles: Pick<AuthorProfile, "full_name"> | null): string {
  return profiles?.full_name?.trim() || "Nairaly Writer"
}

function getWordCount(html: string | null): number {
  if (!html) return 0
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length
}

// ✅ Fix 1 — description capped at 155 chars (was 160, Google truncates at ~155)
function getDescription(article: Pick<ArticleResponse, "subtitle" | "title">): string {
  return article.subtitle
    ? article.subtitle.substring(0, 155)
    : `${article.title} — Read on Nairaly.`
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from("articles")
    .select("title, subtitle, cover_image, is_deactivated, published, created_at, updated_at, slug, tags, author_id, profiles ( full_name )")
    .eq("slug", slug)
    .single() as { data: ArticleResponse | null }

  if (!article || article.is_deactivated || !article.published) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false },
    }
  }

  const author = getAuthorName(article.profiles)
  const description = getDescription(article)
  const url = `${SITE_URL}/article/${article.slug}`
  const imageUrl = article.cover_image || `${SITE_URL}/og-default.jpg`

  const keywords = [
    "Nairaly",
    "Nigeria",
    "Nigerian writers",
    ...(article.tags ?? []),
  ].filter(Boolean)

  return {
    metadataBase: new URL(SITE_URL),
    title: article.title,
    description,
    keywords,
    authors: [
      {
        name: author,
        url: `${SITE_URL}/author/${article.author_id}`,
      },
    ],
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: "Nairaly",
      type: "article",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at || article.created_at,
      authors: [`${SITE_URL}/author/${article.author_id}`],
      tags: article.tags ?? [],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@nairaly",
      title: article.title,
      description,
      images: [imageUrl],
    },
  }
}

// ✅ Fix 3 — ISR ensures <title> is always in server-rendered HTML
export const revalidate = 3600

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Page({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [articleResult, tagRelatedResult] = await Promise.all([
    supabase
      .from("articles")
      .select("*, profiles ( full_name, avatar_url, bio )")
      .eq("slug", slug)
      .eq("published", true)
      .eq("is_deactivated", false)
      .single(),
    supabase
      .from("articles")
      .select(RELATED_SELECT)
      .eq("published", true)
      .eq("is_deactivated", false)
      .neq("slug", slug)
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const article = articleResult.data as ArticleResponse | null
  if (!article) notFound()

  const tagRelatedRaw = tagRelatedResult.data as RelatedArticle[] | null

  // ✅ Prioritize articles sharing the primary tag, then backfill with recents
  const primaryTag = article.tags?.[0] ?? null
  const pool = tagRelatedRaw ?? []

  const tagMatches = primaryTag
    ? pool.filter((a: any) => a.tags?.includes(primaryTag))
    : pool

  let finalRelated = tagMatches.slice(0, 3)

  if (finalRelated.length < 3) {
    const exclude = new Set([slug, ...finalRelated.map((a) => a.slug)])
    const backfill = pool
      .filter((a) => !exclude.has(a.slug))
      .slice(0, 3 - finalRelated.length)
    finalRelated = [...finalRelated, ...backfill]
  }

  // Derived values
  const authorName = getAuthorName(article.profiles)
  const authorInitial = authorName[0].toUpperCase()
  const dateISO = new Date(article.created_at).toISOString()
  const dateStr = new Date(article.created_at).toLocaleDateString("en-NG", {
    month: "long", day: "numeric", year: "numeric",
  })
  const safeBody = sanitizeHtml(article.body || "", SANITIZE_OPTIONS)
  const authorHref = `/author/${article.author_id}`
  const excerpt = article.subtitle || article.title
  const description = getDescription(article)
  const imageUrl = article.cover_image || `${SITE_URL}/og-default.jpg`
  const articleUrl = `${SITE_URL}/article/${article.slug}`

  const relatedTransformed: Article[] = finalRelated.map((a) => ({
    id: a.id,
    author: getAuthorName(a.profiles as any),
    authorInitial: (a.profiles?.full_name?.[0] || "N").toUpperCase(),
    publication: a.publication || "",
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle || "",
    date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    claps: String(a.claps_count || 0),
    comments: a.comments_count || 0,
    readTime: a.read_time ?? "3 min",
    body: "",
    coverImage: a.cover_image || "",
  }))

  // ✅ Full BlogPosting schema with ImageObject and inLanguage
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description,
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: dateISO,
    dateModified: article.updated_at
      ? new Date(article.updated_at).toISOString()
      : dateISO,
    inLanguage: "en-NG",
    author: {
      "@type": "Person",
      name: authorName,
      url: `${SITE_URL}${authorHref}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Nairaly",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-sq.png`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
    wordCount: getWordCount(article.body),
    keywords: article.tags?.join(", ") || "Nigeria, tech, culture",
    articleSection: article.tags?.[0] || "General",
    commentCount: article.comments_count,
  }

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 selection:bg-green-100 dark:selection:bg-green-900/40">
      <ReadingProgress />
      <ViewTracker articleId={article.id} />

      {/* ✅ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c"),
        }}
      />

      <Navbar />

      <article className="max-w-[680px] mx-auto px-4 sm:px-6 pt-8 sm:pt-14 pb-16">

        {/* ── Header ── */}
        <header className="mb-8 sm:mb-10">

          {article.publication && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                {article.publication}
              </span>
            </div>
          )}

          <h1 className="font-serif text-[1.9rem] sm:text-[2.8rem] lg:text-[3.2rem] font-bold text-stone-900 dark:text-white leading-[1.1] mb-4 sm:mb-6 tracking-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="font-serif text-lg sm:text-xl text-stone-500 dark:text-stone-400 leading-snug mb-6 sm:mb-8 font-light italic">
              {article.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 py-4 sm:py-6 border-y border-stone-100 dark:border-stone-900">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <Link
                href={authorHref}
                className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-900 shrink-0 shadow-inner group"
              >
                {article.profiles?.avatar_url ? (
                  <Image
                    src={article.profiles.avatar_url}
                    alt={authorName}
                    fill
                    sizes="48px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold text-sm">
                    {authorInitial}
                  </div>
                )}
              </Link>
              <div className="flex flex-col text-sm min-w-0">
                <Link
                  href={authorHref}
                  className="font-bold text-stone-900 dark:text-white truncate hover:text-green-600 transition-colors"
                >
                  {authorName}
                </Link>
                <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-0.5">
                  <time dateTime={dateISO}>{dateStr}</time>
                  <span>·</span>
                  <span>{article.read_time || "5 min"} read</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ArticleActions
                authorId={article.author_id}
                articleId={article.id}
                slug={article.slug}
              />
            </div>
          </div>
        </header>

        {/* ── Hero image ── */}
        {article.cover_image && (
          <figure className="mb-8 sm:mb-12 -mx-4 sm:-mx-6">
            <div className="relative aspect-[16/9] w-full bg-stone-100 dark:bg-stone-900 sm:rounded-xl overflow-hidden shadow-lg sm:shadow-2xl">
              <Image
                src={article.cover_image}
                alt={article.title}
                fill
                priority
                quality={80}
                fetchPriority="high"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 680px"
              />
            </div>
          </figure>
        )}

        <AudioReader title={article.title} body={article.body || ""} authorName={authorName} />

        <section
          className="
            prose prose-stone dark:prose-invert max-w-none
            text-[17px] sm:text-[19px] lg:text-[21px]
            leading-[1.8] sm:leading-[1.85]
            text-stone-800 dark:text-stone-200
            prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl sm:prose-h2:text-3xl
            prose-p:mb-6 sm:prose-p:mb-8
            prose-img:rounded-xl sm:prose-img:rounded-3xl
            prose-blockquote:border-green-500
            prose-blockquote:bg-stone-50/50 dark:prose-blockquote:bg-stone-900/30
            prose-a:text-green-600 dark:prose-a:text-green-400
            prose-code:text-sm prose-code:bg-stone-100 dark:prose-code:bg-stone-800
            prose-pre:text-sm prose-pre:overflow-x-auto
          "
          dangerouslySetInnerHTML={{ __html: safeBody }}
        />

        {/* ── Clap + Share ── */}
        <div className="mt-10 sm:mt-16 flex items-center justify-between py-6 sm:py-8 border-y border-stone-100 dark:border-stone-900">
          <ClapButton articleId={article.id} initialClaps={article.claps_count} />
          <div className="flex items-center gap-2 sm:gap-3">
            <ShareButton title={article.title} slug={article.slug} />
            <button className="p-2 sm:p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors">
              🔖
            </button>
          </div>
        </div>

        {/* ── Author bio card ── */}
        <div className="my-8 sm:my-12 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800">
          <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 sm:mb-4">
            The Writer
          </h3>
          <div className="flex gap-3 sm:gap-5">
            <div className="font-serif text-2xl sm:text-3xl font-bold text-green-600 leading-none mt-1">"</div>
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 italic mb-4 sm:mb-6 leading-relaxed">
                {article.profiles?.bio ||
                  `${authorName} contributes deep insights into the evolution of Nigeria's digital and cultural landscape.`}
              </p>
              <div className="flex items-center justify-between gap-3">
                <Link
                  href={authorHref}
                  className="text-sm font-bold border-b-2 border-green-600 hover:text-green-600 transition-colors"
                >
                  View more stories
                </Link>
                <button className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white transition-colors">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>

        <CommentsSection articleId={article.id} initialCount={article.comments_count} />
      </article>

      {/* ── Related articles ── */}
      {relatedTransformed.length > 0 && (
        <footer className="mt-12 sm:mt-20 py-12 sm:py-24 bg-stone-50/30 dark:bg-stone-900/10 border-t border-stone-100 dark:border-stone-900">
          <div className="max-w-[680px] mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-xl sm:text-2xl font-bold mb-6 sm:mb-10 text-stone-900 dark:text-white">
              What to read next
            </h2>
            <div className="flex flex-col gap-6 sm:gap-10">
              {relatedTransformed.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </footer>
      )}
    </main>
  )
}