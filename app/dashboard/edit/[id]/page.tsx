"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "../../../../lib/supabase/client"
import ImageUpload from "../../../../components/ImageUpload"
import RichEditor from "../../../../components/RichEditor"

export default function EditPage() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [body, setBody] = useState("")
  const [publication, setPublication] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("id", params.id)
        .single()

      if (data) {
        setTitle(data.title)
        setSubtitle(data.subtitle || "")
        setBody(data.body || "")
        setPublication(data.publication || "")
        setPublished(data.published)
        setCoverImage(data.cover_image || "") // ← load existing image
      }
      setFetching(false)
    }

    fetchArticle()
  }, [params.id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const wordCount = body.trim().split(/\s+/).length
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`

    const { error } = await supabase
      .from("articles")
      .update({
        title,
        subtitle,
        body,
        publication,
        published,
        cover_image: coverImage || null, // ← save image
        read_time: readTime,
      })
      .eq("id", params.id)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-stone-300 border-t-stone-900 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">
          Edit story
        </h1>
        <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded"
          />
          Published
        </label>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-6">

        {/* Cover image */}
        <ImageUpload
          onUpload={(url) => setCoverImage(url)}
          currentImage={coverImage}
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        {/* Title */}
       <RichEditor
  value={body}
  onChange={setBody}
  placeholder="Tell your story..."
/>

        {/* Subtitle */}
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtitle (optional)"
          rows={2}
          className="w-full font-serif text-xl text-stone-500 dark:text-stone-400 bg-transparent outline-none resize-none placeholder:text-stone-300 dark:placeholder:text-stone-700 border-none leading-relaxed"
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        {/* Body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell your story..."
          required
          rows={20}
          className="w-full font-serif text-lg text-stone-800 dark:text-stone-200 bg-transparent outline-none resize-none placeholder:text-stone-300 dark:placeholder:text-stone-700 border-none leading-[1.8]"
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
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400 px-4 py-2.5 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 pb-8">
          <button
            type="submit"
            disabled={loading || !title.trim() || !body.trim()}
            className="px-6 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-full border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400 hover:border-stone-400 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}