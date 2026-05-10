import { createPublicClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ArticleCard from "@/components/ArticleCard"
import type { Article } from "@/data/articles"

// ─── Constants ────────────────────────────────────────────────────────────────

const SITE_URL = "https://nairaly.com"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  twitter_url?: string | null
  linkedin_url?: string | null
}

interface AuthorArticle {
  id: string
  slug: string
  title: string
  subtitle: string | null
  cover_image: string | null
  publication: string | null
  read_time: string | null
  claps_count: number
  comments_count: number
  views_count: number
  created_at: string
}

type Props = {
  params: Promise<{ author_id: string }>
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { author_id } = await params
  const supabase = createPublicClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, bio, avatar_url, twitter_url, linkedin_url")
    .eq("id", author_id)
    .single()

  if (!profile) {
    return {
      title: "Author Not Found",
      robots: { index: false },
    }
  }

  const name = profile.full_name || "Nairaly Writer"
  const description = profile.bio || `Read articles by ${name} on Nairaly.`
  const url = `${SITE_URL}/author/${author_id}`

  return {
    metadataBase: new URL(SITE_URL),
    title: `${name} — Author on Nairaly`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${name} — Nairaly`,
      description,
      url,
      siteName: "Nairaly",
      locale: "en_NG",
      type: "profile",
      ...(profile.avatar_url && {
        images: [{ url: profile.avatar_url, width: 400, height: 400, alt: name }],
      }),
    },
    twitter: {
      card: "summary",
      title: `${name} — Nairaly`,
      description,
      ...(profile.avatar_url && { images: [profile.avatar_url] }),
    },
  }
}

// ─── Caching ──────────────────────────────────────────────────────────────────

export const revalidate = 300

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AuthorPage({ params }: Props) {
  const { author_id } = await params
  const supabase = createPublicClient()

  const [profileResult, articlesResult] = await Promise.all([
    supabase
      .from("profiles")
      // ✅ V2 FIX: Fetch social URLs for E-E-A-T sameAs schema
      .select("id, full_name, bio, avatar_url, created_at, twitter_url, linkedin_url")
      .eq("id", author_id)
      .single(),
    supabase
      .from("articles")
      .select("id, slug, title, subtitle, cover_image, publication, read_time, claps_count, comments_count, views_count, created_at")
      .eq("author_id", author_id)
      .eq("published", true)
      .eq("is_deactivated", false)
      .order("created_at", { ascending: false }),
  ])

  const profile = profileResult.data as Profile | null
  const articles = articlesResult.data as AuthorArticle[] | null

  if (!profile) notFound()

  const name = profile.full_name || "Nairaly Writer"
  const initial = name[0].toUpperCase()
  const joinedYear = new Date(profile.created_at).getFullYear()

  const transformed: Article[] = (articles || []).map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    subtitle: a.subtitle || "",
    author: name,
    authorInitial: initial,
    publication: a.publication || "",
    coverImage: a.cover_image || "",
    // ✅ FIX: Added year to prevent stale look
    date: new Date(a.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    // ✅ FIX: Hide 0 claps to prevent "dead site" signal
    claps: a.claps_count > 0 ? String(a.claps_count) : "",
    comments: a.comments_count || 0,
    readTime: a.read_time ?? "3 min",
    body: "",
    views_count: a.views_count || 0,
  }))

  // ✅ V2 FIX: Build sameAs array for E-E-A-T if social URLs exist
  const sameAs = [
    profile.twitter_url,
    profile.linkedin_url,
  ].filter((url): url is string => Boolean(url))

  const authorUrl = `${SITE_URL}/author/${author_id}`

  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: authorUrl,
    description: profile.bio || "",
    ...(profile.avatar_url && { image: profile.avatar_url }),
    worksFor: { "@type": "Organization", name: "Nairaly" },
    // ✅ V2 FIX: Proves to Google this is a real human entity
    ...(sameAs.length > 0 && { sameAs }),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Authors", item: `${SITE_URL}/authors` },
      { "@type": "ListItem", position: 3, name, item: authorUrl },
    ],
  }

  return (
    <main className="min-h-screen bg-white dark:bg-stone-950">
      <Navbar />

      {/* ── Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(authorSchema).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── Profile header ── */}
      <section className="max-w-[680px] mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 mb-8 sm:mb-10">

          {/* Avatar */}
          <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 bg-stone-100 dark:bg-stone-900 shadow-md">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={name}
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-green-600 text-white font-bold text-2xl sm:text-3xl">
                {initial}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-1 sm:mb-2">
              {name}
            </h1>
            {profile.bio && (
              <p className="text-sm sm:text-base text-stone-500 dark:text-stone-400 leading-relaxed mb-3 sm:mb-4">
                {profile.bio}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-stone-600">
              <span>{transformed.length} {transformed.length === 1 ? "article" : "articles"}</span>
              <span>·</span>
              <span>Joined {joinedYear}</span>
            </div>
          </div>

          {/* Follow button */}
          <button className="shrink-0 px-5 py-2 rounded-full border border-stone-900 dark:border-white text-sm font-semibold text-stone-900 dark:text-white hover:bg-stone-900 dark:hover:bg-white hover:text-white dark:hover:text-stone-900 transition-colors duration-200">
            Follow
          </button>
        </div>

        <div className="border-t border-stone-100 dark:border-stone-800" />
      </section>

      {/* ── Articles ── */}
      <section className="max-w-[680px] mx-auto px-4 sm:px-6 pb-20">
        {transformed.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone-400 dark:text-stone-600 text-base">
              No articles published yet.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-medium text-green-600 hover:underline"
            >
              Browse all articles
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-10 pt-6 sm:pt-8">
            {transformed.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}