import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import Navbar from "@/components/Navbar"
import ArticleCard from "@/components/ArticleCard"
import ClapButton from "@/components/ClapButton"
import ReadingProgress from "@/components/ReadingProgress"
import CommentsSection from "@/components/CommentsSection"
import AudioReader from "@/components/AudioReader"
import ShareButton from "@/components/ShareButton"
import Image from "next/image"
import ArticleActions from "@/components/ArticleActions"
import ViewTracker from "@/components/ViewTracker"
import Link from "next/link"
import sanitizeHtml from "sanitize-html"
import type { Article } from "@/data/articles"

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// CONFIG & HELPERS
// ─────────────────────────────────────────────
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
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
}

function getAuthorName(profiles: Pick<AuthorProfile, "full_name"> | null): string {
  return profiles?.full_name?.trim() || "Nairaly Writer"
}

function getWordCount(html: string | null): number {
  if (!html) return 0
  return html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

// ─────────────────────────────────────────────
// SEO METADATA
// ─────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = (await supabase
    .from("articles")
    .select("title, subtitle, cover_image, is_deactivated, published, created_at, slug, profiles ( full_name )")
    .eq("slug", slug)
    .single()) as { data: ArticleResponse | null }

  if (!article || article.is_deactivated || !article.published) {
    return { title: "Article Not Found | Nairaly", robots: { index: false } }
  }

  const author = getAuthorName(article.profiles)
  const description = article.subtitle || article.title
  const url = `https://nairaly.com/article/${article.slug}`
  const imageUrl = article.cover_image || "https://nairaly.com/og-default.jpg"

  return {
    title: `${article.title} | Nairaly`,
    description,
    authors: [{ name: author }],
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: "Nairaly",
      type: "article",
      publishedTime: article.created_at,
      locale: "en_NG",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [imageUrl],
      creator: "@nairalycom",
      site: "@nairalycom",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  }
}

export const revalidate = 300

// ─────────────────────────────────────────────
// RELATED ARTICLES QUERY
// ─────────────────────────────────────────────
const RELATED_SELECT =
  "id, title, subtitle, slug, publication, read_time, claps_count, comments_count, cover_image, created_at, profiles ( full_name )"

// ─────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────
export default async function Page({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = (await supabase
    .from("articles")
    .select("*, profiles ( full_name, avatar_url, bio )")
    .eq("slug", slug)
    .eq("published", true)
    .eq("is_deactivated", false)
    .single()) as { data: ArticleResponse | null }

  if (!article) notFound()

  // ── Related articles with tag-based backfill ──
  const primaryTag = article.tags?.[0] ?? null

  const baseQuery = supabase
    .from("articles")
    .select(RELATED_SELECT)
    .eq("published", true)
    .eq("is_deactivated", false)
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: tagRelated } = (await (primaryTag
    ? baseQuery.contains("tags", [primaryTag])
    : baseQuery)) as { data: RelatedArticle[] | null }

  const tagRelatedList = tagRelated ?? []
  const stillNeeded = 3 - tagRelatedList.length
  let backfillList: RelatedArticle[] = []

  if (stillNeeded > 0) {
    const excludeSlugs = [slug, ...tagRelatedList.map((a) => a.slug)]
    const { data: backfill } = (await supabase
      .from("articles")
      .select(RELATED_SELECT)
      .eq("published", true)
      .eq("is_deactivated", false)
      .not("slug", "in", `(${excludeSlugs.map((s) => `"${s}"`).join(",")})`)
      .order("created_at", { ascending: false })
      .limit(stillNeeded)) as { data: RelatedArticle[] | null }
    backfillList = backfill ?? []
  }

  const allRelated = [...tagRelatedList, ...backfillList]

  // ── Derived values ──
  const authorName = getAuthorName(article.profiles)
  const authorInitial = authorName[0].toUpperCase()
  const dateISO = new Date(article.created_at).toISOString()
  const dateStr = new Date(article.created_at).toLocaleDateString("en-NG", {
    month: "long", day: "numeric", year: "numeric",
  })
  const safeBody = sanitizeHtml(article.body || "", SANITIZE_OPTIONS)
  const avatarUrl = article.profiles?.avatar_url
  const authorHref = `/author/${article.author_id}`
  const authorBio = article.profiles?.bio || `Writer on Nairaly — Nigeria's home for curious readers and thinkers.`

  const related: Article[] = allRelated.map((a) => ({
    id: a.id,
    author: a.profiles?.full_name || "Nairaly Writer",
    authorInitial: (a.profiles?.full_name?.[0] || "N").toUpperCase(),
    publication: a.publication || "",
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle || "",
    date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    claps: String(a.claps_count || 0),
    comments: a.comments_count || 0,
    readTime: a.read_time ?? "",
    body: "",
    coverImage: a.cover_image || "",
  }))

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 selection:bg-green-100 dark:selection:bg-green-900/40">
      <ReadingProgress />
      <ViewTracker articleId={article.id} />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: article.subtitle || article.title,
            image: [article.cover_image || "https://nairaly.com/og-default.jpg"],
            datePublished: dateISO,
            dateModified: article.updated_at || dateISO,
            author: { "@type": "Person", name: authorName, url: `https://nairaly.com${authorHref}` },
            publisher: {
              "@type": "Organization",
              name: "Nairaly",
              logo: { "@type": "ImageObject", url: "https://nairaly.com/logo.png" },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `https://nairaly.com/article/${article.slug}` },
            wordCount: getWordCount(article.body),
            articleSection: article.tags?.[0] || "General",
            inLanguage: "en-NG",
          }).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── NAVBAR ── */}
      <div className="max-w-5xl mx-auto">
        <Navbar />
      </div>

      {/* ── HERO IMAGE — full bleed with soft gradient ── */}
      {article.cover_image && (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <div className="relative w-full aspect-[2/1] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 shadow-xl border border-stone-100 dark:border-stone-800">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
            />
            {/* Cinematic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* ── ARTICLE BODY ── */}
      <article className="max-w-[680px] mx-auto px-4 sm:px-6 py-12">

        {/* Publication badge */}
        {article.publication && (
          <div className="mb-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 uppercase tracking-[0.12em] border border-green-100 dark:border-green-800">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              {article.publication}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-serif text-[2rem] sm:text-[3.25rem] font-bold text-stone-900 dark:text-white leading-[1.08] mb-5 tracking-tight">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="font-serif text-xl sm:text-2xl text-stone-500 dark:text-stone-400 leading-relaxed mb-8 font-normal not-italic border-l-2 border-stone-200 dark:border-stone-700 pl-4">
            {article.subtitle}
          </p>
        )}

        {/* ── AUTHOR BAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-5 border-y border-stone-100 dark:border-stone-800 mb-10">
          <div className="flex items-center gap-3">
            <Link href={authorHref} className="shrink-0 group">
              {avatarUrl ? (
                <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-offset-1 ring-stone-200 dark:ring-stone-700 group-hover:ring-green-500 transition-all duration-200">
                  <Image src={avatarUrl} alt={authorName} fill className="object-cover" sizes="44px" />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform duration-200">
                  {authorInitial}
                </div>
              )}
            </Link>

            <div className="min-w-0">
              <Link
                href={authorHref}
                className="block text-sm font-bold text-stone-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
              >
                {authorName}
              </Link>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-400 mt-0.5">
                <time dateTime={dateISO}>{dateStr}</time>
                {article.read_time && (
                  <>
                    <span className="text-stone-300 dark:text-stone-600">·</span>
                    <span>{article.read_time} read</span>
                  </>
                )}
                {article.views_count > 0 && (
                  <>
                    <span className="text-stone-300 dark:text-stone-600">·</span>
                    <span>{formatViews(article.views_count)} views</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ArticleActions
              authorId={article.author_id}
              articleId={article.id}
              slug={article.slug}
            />
            <button className="px-5 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white transition-colors duration-200">
              Follow
            </button>
          </div>
        </div>

        {/* Audio Reader */}
        <AudioReader
          title={article.title}
          body={article.body || ""}
          authorName={authorName}
        />

        {/* ── ARTICLE CONTENT ── */}
        <div
          className="
            prose prose-stone dark:prose-invert max-w-none
            text-[18px] sm:text-[19px] leading-[1.85]
            text-stone-800 dark:text-stone-200
            font-sans

            prose-headings:font-serif prose-headings:font-bold
            prose-headings:text-stone-900 dark:prose-headings:text-white
            prose-headings:tracking-tight prose-headings:leading-tight

            prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-3

            prose-p:mb-6 prose-p:leading-[1.85]

            prose-a:text-green-600 dark:prose-a:text-green-400
            prose-a:font-medium prose-a:no-underline
            hover:prose-a:underline

            prose-strong:text-stone-900 dark:prose-strong:text-white
            prose-strong:font-bold

            prose-blockquote:not-italic
            prose-blockquote:font-serif
            prose-blockquote:border-l-[3px]
            prose-blockquote:border-green-500
            prose-blockquote:bg-green-50/40
            dark:prose-blockquote:bg-green-900/10
            prose-blockquote:px-6 prose-blockquote:py-4
            prose-blockquote:rounded-r-xl
            prose-blockquote:text-stone-700
            dark:prose-blockquote:text-stone-300
            prose-blockquote:my-8

            prose-code:bg-stone-100 dark:prose-code:bg-stone-800
            prose-code:px-1.5 prose-code:py-0.5
            prose-code:rounded-md prose-code:text-[0.875em]
            prose-code:text-green-700 dark:prose-code:text-green-400
            prose-code:font-medium prose-code:before:content-none prose-code:after:content-none

            prose-pre:bg-stone-900 dark:prose-pre:bg-stone-800/80
            prose-pre:rounded-2xl prose-pre:border
            prose-pre:border-stone-800 dark:prose-pre:border-stone-700
            prose-pre:shadow-lg

            prose-img:rounded-2xl prose-img:shadow-md
            prose-img:border prose-img:border-stone-100
            dark:prose-img:border-stone-800

            prose-figure:my-10
            prose-figcaption:text-center prose-figcaption:text-sm
            prose-figcaption:text-stone-400 prose-figcaption:mt-3

            prose-hr:border-stone-100 dark:prose-hr:border-stone-800
            prose-hr:my-10

            prose-ul:leading-relaxed prose-ol:leading-relaxed
            prose-li:mb-1.5 prose-li:marker:text-green-500
          "
          dangerouslySetInnerHTML={{ __html: safeBody }}
        />

        {/* ── TAGS ── */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-10 border-t border-stone-100 dark:border-stone-800">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/?topic=${tag}`}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-400 border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all duration-150"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* ── CLAP / SHARE BAR ── */}
        <div className="flex items-center justify-between mt-8 py-6 border-y border-stone-100 dark:border-stone-800">
          <ClapButton articleId={article.id} initialClaps={article.claps_count} />
          <div className="flex items-center gap-2">
            <ShareButton title={article.title} slug={slug} />
            <button
              title="Bookmark"
              aria-label="Bookmark article"
              className="p-2.5 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-150"
            >
              🔖
            </button>
          </div>
        </div>

        {/* ── AUTHOR BIO CARD ── */}
        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-stone-50 to-white dark:from-stone-900 dark:to-stone-900/60 border border-stone-100 dark:border-stone-800 shadow-sm">
          <div className="flex items-start gap-5">
            <Link href={authorHref} className="shrink-0">
              {avatarUrl ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-offset-2 ring-stone-100 dark:ring-stone-700 hover:ring-green-500 transition-all">
                  <Image src={avatarUrl} alt={authorName} fill className="object-cover" sizes="64px" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {authorInitial}
                </div>
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-stone-400 uppercase tracking-[0.1em] font-semibold mb-1">
                Written by
              </p>
              <Link
                href={authorHref}
                className="block text-lg font-bold text-stone-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {authorName}
              </Link>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mt-2">
                {authorBio}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button className="px-5 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white transition-colors duration-200">
                  Follow
                </button>
                <Link
                  href={authorHref}
                  className="text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  View profile →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── COMMENTS ── */}
        <div className="mt-12">
          <CommentsSection
            articleId={article.id}
            initialCount={article.comments_count}
          />
        </div>
      </article>

      {/* ── RELATED ARTICLES ── */}
      {related.length > 0 && (
        <footer className="bg-stone-50/70 dark:bg-stone-900/30 border-t border-stone-100 dark:border-stone-800 py-20 mt-10">
          <div className="max-w-[680px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Continue reading
              </h2>
              <Link
                href="/"
                className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
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