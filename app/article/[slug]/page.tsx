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

import ArticleActions from "@/components/ArticleActions"

type Props = {
  params: { slug: string }
}

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
      images: data.cover_image
        ? [{ url: data.cover_image, alt: data.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.subtitle || data.title,
      images: data.cover_image ? [data.cover_image] : [],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
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

  if (!data) notFound()

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
  const claps = data.claps_count >= 1000
    ? `${(data.claps_count / 1000).toFixed(1)}K`
    : String(data.claps_count)

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950">

      <ReadingProgress />

      {/* JSON-LD Schema */}
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

      {/* Full shared Navbar — same as homepage */}
      <div className="max-w-5xl mx-auto">
        <Navbar />
      </div>

      {/* Article content */}
      <article className="max-w-[680px] mx-auto px-4 py-12">

        {data.publication && (
          <div className="mb-6">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-widest">
              {data.publication}
            </span>
          </div>
        )}
{/* Cover image */}
{data.cover_image ? (
  <div className="relative aspect-[16/9] overflow-hidden mb-12 -mx-4 sm:mx-0 sm:rounded-xl w-[calc(100%+2rem)] sm:w-full">
    <img
      src={data.cover_image}
      alt={`Cover image for ${data.title}`}
      className="absolute inset-0 w-full h-full object-cover"
    />
  </div>
) : (
  <div className="relative aspect-[16/9] overflow-hidden mb-12 -mx-4 sm:mx-0 sm:rounded-xl w-[calc(100%+2rem)] sm:w-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800" />
)}
     <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 dark:text-white leading-[1.15] mb-6">
  {data.title}
</h1>

{data.subtitle && (
  <p className="font-serif text-lg sm:text-2xl text-stone-500 dark:text-stone-400 leading-relaxed mb-10">
    {data.subtitle}
  </p>
)}
{/* Author card */}
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 border-y border-stone-200 dark:border-stone-800 mb-10">
  
  {/* Left — author info */}
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-lg font-medium shrink-0">
      {authorInitial}
    </div>
    <div>
      <p className="text-sm font-medium text-stone-900 dark:text-white">
        {authorName}
      </p>
      <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500 mt-0.5 flex-wrap">
        <span>{date}</span>
        <span>·</span>
        <span>{data.read_time}</span>
        <span>·</span>
        <span>👏 {claps}</span>
      </div>
    </div>
  </div>

  {/* Right — actions */}
  <div className="flex items-center gap-2 sm:gap-3">
    <ArticleActions
      authorId={data.author_id}
      articleId={data.id}
      slug={data.slug}
    />
    <button className="px-3 sm:px-4 py-1.5 rounded-full border border-stone-900 dark:border-stone-400 text-sm text-stone-900 dark:text-stone-300 hover:bg-stone-900 dark:hover:bg-stone-700 hover:text-white transition-colors cursor-pointer">
      Follow
    </button>
    <button className="text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer">
      🔖
    </button>
  </div>
</div>

{/* Audio reader */}
<AudioReader
  title={data.title}
  body={data.body || ""}
  authorName={authorName}
/>
      

     {/* Body */}
<div
  className="prose prose-stone dark:prose-invert max-w-none font-serif leading-[1.75]
    prose-headings:font-serif
    prose-a:text-blue-600 prose-a:dark:text-blue-400
    prose-blockquote:border-stone-300 prose-blockquote:dark:border-stone-600
    prose-code:text-pink-600 prose-code:dark:text-pink-400
    prose-pre:bg-stone-900 prose-pre:dark:bg-stone-950"
  dangerouslySetInnerHTML={{ __html: data.body || "" }}
/>
        {/* Clap + actions row */}
<div className="flex items-center gap-4 mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
  <ClapButton
    articleId={data.id}
    initialClaps={data.claps_count}
  />
  <div className="ml-auto flex items-center gap-3">
    <ShareButton
      title={data.title}
      slug={data.slug}
    />
    <button className="text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer">
      🔖
    </button>
    <button className="text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer">
      ···
    </button>
  </div>
</div>

        {/* Comments */}
        <div className="mt-8">
          <CommentsSection
            articleId={data.id}
            initialCount={data.comments_count}
          />
        </div>

        {/* Author bio */}
        {/* <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-stone-800 dark:bg-stone-600 flex items-center justify-center text-white text-2xl font-medium shrink-0">
              {authorInitial}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-widest">
                Written by
              </p>
              <p className="font-medium text-stone-900 dark:text-white text-lg">
                {authorName}
              </p>
              {author?.bio && (
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {author.bio}
                </p>
              )}
              {data.publication && (
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {data.publication}
                </p>
              )}
              <button className="mt-2 self-start px-5 py-2 rounded-full border border-stone-900 dark:border-stone-400 text-sm text-stone-900 dark:text-stone-300 hover:bg-stone-900 dark:hover:bg-stone-700 hover:text-white transition-colors cursor-pointer">
                Follow
              </button>
            </div>
          </div>
        </div> */}

      </article>

      {/* More articles */}
      {related.length > 0 && (
        <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900">
          <div className="max-w-[680px] mx-auto px-4 py-12">
            <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-8">
              More from {process.env.NEXT_PUBLIC_SITE_NAME || "Medium"}
            </h2>
            <div className="flex flex-col">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </div>
      )}

    </main>
  )
}