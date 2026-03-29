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

// Neutral blur placeholder
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIwIiBoZWlnaHQ9IjQwNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTdlNWUyIi8+PC9zdmc+"

// ─────────────────────────────────────────────
// METADATA (Improved SEO)
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
  const description = article.subtitle 
    ? article.subtitle.substring(0, 160) 
    : `${article.title} – Read this insightful article on Nairaly.`

  const url = `https://nairaly.com/article/${article.slug}`
  const imageUrl = article.cover_image || "https://nairaly.com/og-default.jpg"

  // Add relevant keywords (especially useful for Nigerian tech/remote job content)
  const keywords = [
    "Nairaly", "Nigeria", "remote jobs", "freelance", "tech jobs Nigeria",
    article.title.toLowerCase().includes("remote") ? "remote jobs 2026" : "",
    "Nigerians in tech"
  ].filter(Boolean)

  return {
    title: `${article.title} | Nairaly`,
    description,
    keywords: keywords.join(", "),
    authors: [{ name: author }],
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description,
      url,
      siteName: "Nairaly",
      locale: "en_NG",
      type: "article",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at || article.created_at,
      images: [{ 
        url: imageUrl, 
        width: 1200, 
        height: 630,
        alt: article.title 
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [imageUrl],
    },
  }
}

// PERF: 30-minute revalidation for fresher new articles (was 3600)
export const revalidate = 1800

const RELATED_SELECT =
  "id, title, subtitle, slug, publication, read_time, claps_count, comments_count, cover_image, created_at, profiles ( full_name )"

// ─────────────────────────────────────────────
// ARTICLE PAGE
// ─────────────────────────────────────────────
export default async function Page({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const [articleResult, relatedResult] = await Promise.all([
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
  const tagRelatedRaw = relatedResult.data as RelatedArticle[] | null

  if (!article) notFound()

  // Related articles logic (unchanged)
  const primaryTag = article.tags?.[0] ?? null
  const pool = tagRelatedRaw ?? []
  let finalRelated = pool.slice(0, 3)

  if (primaryTag && finalRelated.length < 3) {
    const exclude = [slug, ...finalRelated.map((a) => a.slug)]
    const { data: backfill } = (await supabase
      .from("articles")
      .select(RELATED_SELECT)
      .eq("published", true)
      .eq("is_deactivated", false)
      .not("slug", "in", `(${exclude.map((s) => `"${s}"`).join(",")})`)
      .order("created_at", { ascending: false })
      .limit(3 - finalRelated.length)) as { data: RelatedArticle[] | null }

    finalRelated = [...finalRelated, ...(backfill ?? [])]
  }

  // ── Transformations ──────────────────────────────────────────────────────
  const authorName = getAuthorName(article.profiles)
  const authorInitial = authorName[0].toUpperCase()
  const dateISO = new Date(article.created_at).toISOString()
  const dateStr = new Date(article.created_at).toLocaleDateString("en-NG", {
    month: "long", day: "numeric", year: "numeric",
  })

  const safeBody = sanitizeHtml(article.body || "", SANITIZE_OPTIONS)
  const authorHref = `/author/${article.author_id}`

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

  // Short excerpt for schema
  const excerpt = article.subtitle || article.title

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950 selection:bg-green-100 dark:selection:bg-green-900/40">
      <ReadingProgress />
      <ViewTracker articleId={article.id} />

      {/* Improved JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            description: excerpt,
            image: [article.cover_image || "https://nairaly.com/og-default.jpg"],
            datePublished: dateISO,
            dateModified: article.updated_at || dateISO,
            author: {
              "@type": "Person",
              name: authorName,
              url: `https://nairaly.com${authorHref}`
            },
            publisher: {
              "@type": "Organization",
              name: "Nairaly",
              logo: {
                "@type": "ImageObject",
                url: "https://nairaly.com/logo-sq.png"
              }
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://nairaly.com/article/${article.slug}`
            },
            wordCount: getWordCount(article.body),
            articleBody: excerpt + (article.body ? " " + article.body.substring(0, 300) : ""),
            keywords: article.tags?.join(", ") || "Nigeria, tech, remote jobs",
            articleSection: article.tags?.[0] || "Technology"
          }).replace(/</g, "\\u003c"),
        }}
      />

      <Navbar />

      <article className="max-w-[720px] mx-auto px-4 sm:px-6 py-12 pt-16">
        {/* Header Metadata – unchanged */}
        <header className="mb-10">
          {article.publication && (
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                {article.publication}
              </span>
            </div>
          )}
          <h1 className="font-serif text-[2.4rem] sm:text-[3.5rem] font-bold text-stone-900 dark:text-white leading-[1.05] mb-6 tracking-tight">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="font-serif text-xl sm:text-2xl text-stone-500 dark:text-stone-400 leading-snug mb-8 font-light italic">
              {article.subtitle}
            </p>
          )}

          <div className="flex items-center justify-between py-6 border-y border-stone-100 dark:border-stone-900 mb-10">
            <div className="flex items-center gap-3">
              <Link href={authorHref} className="relative w-12 h-12 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-900 shrink-0 shadow-inner group">
                {article.profiles?.avatar_url ? (
                  <Image
                    src={article.profiles.avatar_url}
                    alt={authorName}
                    fill
                    sizes="48px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold">{authorInitial}</div>
                )}
              </Link>
              <div className="flex flex-col text-sm min-w-0">
                <Link href={authorHref} className="font-bold text-stone-900 dark:text-white truncate hover:text-green-600">
                  {authorName}
                </Link>
                <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                  <time dateTime={dateISO}>{dateStr}</time>
                  <span>·</span>
                  <span>{article.read_time || "5 min"} read</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArticleActions authorId={article.author_id} articleId={article.id} slug={article.slug} />
            </div>
          </div>
        </header>

        {/* Hero Image – added fetchPriority for better LCP */}
        {article.cover_image && (
          <figure className="mb-12 -mx-4 sm:-mx-12 lg:-mx-20">
            <div className="relative aspect-[16/9] w-full bg-stone-100 dark:bg-stone-900 rounded-xl overflow-hidden shadow-2xl">
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
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 176px"
              />
            </div>
          </figure>
        )}

        <AudioReader title={article.title} body={article.body || ""} authorName={authorName} />

        <section
          className="prose prose-stone dark:prose-invert max-w-none text-[20px] sm:text-[21px] leading-[1.85] text-stone-800 dark:text-stone-200 prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-p:mb-8 prose-blockquote:border-green-500 prose-blockquote:bg-stone-50/50 dark:prose-blockquote:bg-stone-900/30 prose-img:rounded-3xl prose-a:text-green-600 dark:prose-a:text-green-400"
          dangerouslySetInnerHTML={{ __html: safeBody }}
        />

        <div className="mt-16 flex items-center justify-between py-8 border-y border-stone-100 dark:border-stone-900">
          <ClapButton articleId={article.id} initialClaps={article.claps_count} />
          <div className="flex items-center gap-3">
            <ShareButton title={article.title} slug={article.slug} />
            <button className="p-2.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400">🔖</button>
          </div>
        </div>

        {/* Author Bio Card – unchanged */}
        <div className="my-12 p-8 rounded-3xl bg-stone-50/50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 mb-4">The Writer</h3>
          <div className="flex gap-5">
            <div className="font-serif text-3xl font-bold text-green-600">"</div>
            <div className="flex-1">
              <p className="text-lg text-stone-600 dark:text-stone-300 italic mb-6">
                {article.profiles?.bio || `${authorName} contributes deep insights into the evolution of Nigeria's digital and cultural landscape.`}
              </p>
              <div className="flex items-center justify-between">
                <Link href={authorHref} className="text-sm font-bold border-b-2 border-green-600">View more stories</Link>
                <button className="px-5 py-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold">Follow</button>
              </div>
            </div>
          </div>
        </div>

        <CommentsSection articleId={article.id} initialCount={article.comments_count} />
      </article>

      {/* Related Articles */}
      {relatedTransformed.length > 0 && (
        <footer className="mt-20 py-24 bg-stone-50/30 dark:bg-stone-900/10 border-t border-stone-100 dark:border-stone-900">
          <div className="max-w-[720px] mx-auto px-4">
            <h2 className="font-serif text-2xl font-bold mb-10 text-stone-900 dark:text-white">What to read next</h2>
            <div className="flex flex-col gap-10">
              {relatedTransformed.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        </footer>
      )}
    </main>
  )
}