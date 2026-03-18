"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ImageUpload"
import RichEditor from "@/components/RichEditor"

type Topic = {
  id: number
  name: string
}

type TopicCategory = {
  id: number
  name: string
  topics: Topic[]
}

export default function EditPage() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [body, setBody] = useState("")
  const [publication, setPublication] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [published, setPublished] = useState(true)
  const [readTime, setReadTime] = useState("")
  
  const [categories, setCategories] = useState<TopicCategory[]>([])
  const [topicId, setTopicId] = useState<string | number>("")
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const params = useParams()
  
  const supabase = createClient()

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch topic categories with nested topics
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("topic_categories")
          .select(`
            id,
            name,
            topics (
              id,
              name
            )
          `)
          .order("id", { ascending: true })

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError)
          setError("Failed to load topics")
        } else if (categoriesData) {
          setCategories(categoriesData as TopicCategory[])
        }

        // Fetch the existing article
        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("id", params.id)
          .single()

        if (articleError) {
          console.error("Error fetching article:", articleError)
          setError("Failed to load article")
          return
        }

        if (articleData) {
          setTitle(articleData.title || "")
          setSubtitle(articleData.subtitle || "")
          setBody(articleData.body || "")
          setPublication(articleData.publication || "")
          setPublished(articleData.published)
          setCoverImage(articleData.cover_image || "")
          setReadTime(articleData.read_time || "")
          setTopicId(articleData.topic_id || "")
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("An error occurred while loading the article")
      } finally {
        setFetching(false)
      }
    }

    fetchInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const calculateReadTime = (text: string) => {
    const strippedBody = text.replace(/<[^>]+>/g, "")
    const wordCount = strippedBody.trim().split(/\s+/).filter(word => word.length > 0).length
    return `${Math.max(1, Math.ceil(wordCount / 200))} min read`
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!title.trim()) {
      setError("Title is required")
      setLoading(false)
      return
    }

    const calculatedReadTime = calculateReadTime(body)

    const { error: updateError } = await supabase
      .from("articles")
      .update({
        title,
        subtitle,
        body,
        publication,
        published,
        cover_image: coverImage || null,
        topic_id: topicId === "" ? null : Number(topicId),
        read_time: calculatedReadTime,
      })
      .eq("id", params.id)

    if (updateError) {
      setError(updateError.message)
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
    <div className="max-w-3xl mx-auto pb-16">
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

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="flex flex-col gap-6">
        
        <ImageUpload
          onUpload={(url) => setCoverImage(url)}
          currentImage={coverImage}
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          rows={1}
          className="w-full font-serif text-4xl sm:text-5xl font-bold text-stone-900 dark:text-white bg-transparent outline-none resize-none placeholder:text-stone-300 dark:placeholder:text-stone-700 border-none leading-tight"
        />

        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Subtitle (optional)"
          rows={2}
          className="w-full font-serif text-xl text-stone-500 dark:text-stone-400 bg-transparent outline-none resize-none placeholder:text-stone-300 dark:placeholder:text-stone-700 border-none leading-relaxed"
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        <div className="min-h-[400px]">
          <RichEditor
            value={body}
            onChange={setBody}
            placeholder="Tell your story..."
          />
        </div>

        <div className="border-t border-stone-100 dark:border-stone-800 mt-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-600 dark:text-stone-400">
              Topic (optional)
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm outline-none focus:border-stone-400 transition-colors cursor-pointer"
            >
              <option value="">Select a topic...</option>
              {categories.map((category) => (
                <optgroup key={category.id} label={category.name}>
                  {(category.topics || []).map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {body && (
          <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-900 p-3 rounded-lg">
            <span>📖</span>
            <span>Estimated read time: <strong>{calculateReadTime(body)}</strong></span>
          </div>
        )}

        <div className="border-t border-stone-100 dark:border-stone-800" />

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium hover:bg-stone-800 dark:hover:bg-stone-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  )
}