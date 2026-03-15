"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../lib/supabase/client"
import ImageUpload from "@/components/ImageUpload"
import RichEditor from "@/components/RichEditor"

// Helpers
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80)
}

function autoParagraph(text: string) {
  // If the text doesn't contain HTML, auto-wrap double newlines in <p> tags
  if (!/<[a-z][\s\S]*>/i.test(text)) {
    return text
      .split(/\n\n+/)
      .map((p) => `<p>${p.trim()}</p>`)
      .join("")
  }
  return text
}

function extractFirstImage(htmlString: string) {
  const imgMatch = htmlString.match(/<img[^>]+src="([^">]+)"/)
  return imgMatch ? imgMatch[1] : null
}

function generateSubtitleFallback(htmlString: string) {
  const plainText = htmlString.replace(/<[^>]*>/g, "").trim()
  if (plainText.length <= 150) return plainText
  return plainText.slice(0, 147) + "..."
}

export default function WritePage() {
  const[title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const[body, setBody] = useState("")
  const [publication, setPublication] = useState("")
  const[coverImage, setCoverImage] = useState("")
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const subtitleRef = useRef<HTMLTextAreaElement>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Auto-resize textarea heights
  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  // Prevent newlines in Title, jump to Subtitle
  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      subtitleRef.current?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError("You must be signed in to write")
      setLoading(false)
      return
    }

    // 1. Auto-paragraph raw text
    const finalBody = autoParagraph(body)

    // 2. Auto-generate subtitle if left blank
    const finalSubtitle = subtitle.trim() || generateSubtitleFallback(finalBody)

    // 3. Auto-extract cover image from the article body if none was uploaded
    const finalCoverImage = coverImage || extractFirstImage(finalBody)

    // Calculate Read Time
    const wordCount = finalBody
      .replace(/<[^>]*>/g, "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`
    
    // Generate unique slug
    const slug = slugify(title) + "-" + Date.now().toString().slice(-4)

    const { error: dbError } = await supabase.from("articles").insert({
      title: title.trim(),
      subtitle: finalSubtitle,
      body: finalBody,
      publication: publication.trim() || null,
      slug,
      cover_image: finalCoverImage,
      read_time: readTime,
      author_id: user.id,
      published,
      claps_count: 0,
      comments_count: 0,
    })

    if (dbError) {
      setError(dbError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">
          New story
        </h1>
        <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded text-green-600 focus:ring-green-500"
          />
          Publish immediately
        </label>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Cover image */}
        <ImageUpload
          onUpload={(url) => setCoverImage(url)}
          currentImage={coverImage}
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        {/* Title */}
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            handleAutoResize(e)
          }}
          onKeyDown={handleTitleKeyDown}
          placeholder="Title"
          required
          rows={1}
          className="w-full font-serif text-4xl font-bold text-stone-900 dark:text-white bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-300 dark:placeholder:text-stone-700 border-none leading-tight py-2"
        />

        {/* Subtitle */}
        <textarea
          ref={subtitleRef}
          value={subtitle}
          onChange={(e) => {
            setSubtitle(e.target.value)
            handleAutoResize(e)
          }}
          placeholder="Subtitle (optional)"
          rows={1}
          className="w-full font-serif text-xl text-stone-500 dark:text-stone-400 bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-300 dark:placeholder:text-stone-700 border-none leading-relaxed"
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        {/* Rich text body */}
        <RichEditor
          value={body}
          onChange={setBody}
          placeholder="Tell your story..."
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        {/* Publication */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-600 dark:text-stone-400">
            Publication (optional)
          </label>
          <input
            type="text"
            value={publication}
            onChange={(e) => setPublication(e.target.value)}
            placeholder="e.g. Level Up Coding"
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none focus:border-stone-400 transition-colors placeholder:text-stone-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400 px-4 py-2.5 rounded-lg border border-red-100 dark:border-red-900">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pb-8 pt-4">
          <button
            type="submit"
            disabled={loading || !title.trim() || !body.trim()}
            className="px-6 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : published ? "Publish story" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400 hover:border-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}