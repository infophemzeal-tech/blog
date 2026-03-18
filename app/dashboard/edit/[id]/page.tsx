"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ImageUpload"
import RichEditor from "@/components/RichEditor"
import Swal from "sweetalert2"

// --- Types ---
type Topic = { id: number; name: string }
type TopicCategory = { id: number; name: string; topics: Topic[] }

// --- Compact SweetAlert Config ---
const swalConfig = (isDark: boolean) => ({
  width: '340px',
  padding: '1.25rem',
  background: isDark ? '#1c1917' : '#fff',
  color: isDark ? '#fff' : '#000',
  customClass: {
    title: 'font-serif text-lg font-bold',
    htmlContainer: 'font-sans text-xs opacity-70',
    confirmButton: 'font-sans text-xs px-4 py-2 rounded-full font-bold bg-stone-900 dark:bg-white text-white dark:text-stone-900',
  }
})

export default function EditPage() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [body, setBody] = useState("")
  const [publication, setPublication] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [published, setPublished] = useState(true)
  
  const [categories, setCategories] = useState<TopicCategory[]>([])
  const [topicId, setTopicId] = useState<string | number>("")
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const titleRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize for Title
  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const { data: categoriesData } = await supabase
          .from("topic_categories")
          .select(`id, name, topics (id, name)`)
          .order("id", { ascending: true })

        if (categoriesData) setCategories(categoriesData as TopicCategory[])

        const { data: articleData, error: articleError } = await supabase
          .from("articles")
          .select("*")
          .eq("id", params.id)
          .single()

        if (articleError) throw articleError

        if (articleData) {
          setTitle(articleData.title || "")
          setSubtitle(articleData.subtitle || "")
          setBody(articleData.body || "")
          setPublication(articleData.publication || "")
          setPublished(articleData.published)
          setCoverImage(articleData.cover_image || "")
          setTopicId(articleData.topic_id || "")
        }
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setFetching(false)
      }
    }
    fetchInitialData()
  }, [params.id, supabase])

  const calculateReadTime = (text: string) => {
    const strippedBody = text.replace(/<[^>]+>/g, "")
    const wordCount = strippedBody.trim().split(/\s+/).filter(word => word.length > 0).length
    return `${Math.max(1, Math.ceil(wordCount / 200))} min read`
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const isDark = document.documentElement.classList.contains('dark')

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 2. SECURITY CHECK: IS BANNED?
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_banned')
      .eq('id', user.id)
      .single()

    if (profile?.is_banned) {
      setLoading(false)
      Swal.fire({
        ...swalConfig(isDark),
        icon: 'error',
        title: 'Access Restricted',
        text: 'You are currently banned and cannot edit stories.',
        confirmButtonColor: '#dc2626'
      })
      return
    }

    // 3. Perform Update
    const { error: updateError } = await supabase
      .from("articles")
      .update({
        title: title.trim(),
        subtitle: subtitle.trim(),
        body,
        publication: publication.trim() || null,
        published,
        cover_image: coverImage || null,
        topic_id: topicId === "" ? null : Number(topicId),
        read_time: calculateReadTime(body),
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)

    if (updateError) {
      setLoading(false)
      Swal.fire({ ...swalConfig(isDark), icon: 'error', title: 'Error', text: updateError.message })
      return
    }

    // Success Notification
    const toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: isDark ? '#1c1917' : '#fff',
      color: isDark ? '#fff' : '#000',
    })

    toast.fire({ icon: 'success', title: 'Story updated' })
    
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
    <div className="max-w-3xl mx-auto px-4 pb-16 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">
          Edit story
        </h1>
        <label className="flex items-center gap-2 text-sm text-stone-500 cursor-pointer select-none font-medium">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded text-green-600 focus:ring-green-500"
          />
          Published
        </label>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-6">
        
        <ImageUpload onUpload={setCoverImage} currentImage={coverImage} />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        <textarea
          value={title}
          onChange={(e) => { setTitle(e.target.value); handleAutoResize(e) }}
          placeholder="Title"
          required
          rows={1}
          className="w-full font-serif text-4xl font-bold text-stone-900 dark:text-white bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-200 border-none leading-tight py-2"
        />

        <textarea
          value={subtitle}
          onChange={(e) => { setSubtitle(e.target.value); handleAutoResize(e) }}
          placeholder="Subtitle"
          rows={1}
          className="w-full font-serif text-xl text-stone-400 bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-200 border-none leading-relaxed"
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        <div className="min-h-[400px]">
          <RichEditor value={body} onChange={setBody} placeholder="Tell your story..." />
        </div>

        <div className="border-t border-stone-100 dark:border-stone-800 mt-6 pt-6" />

        {/* METADATA: TOPICS & PUBLICATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Topic</label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm outline-none cursor-pointer"
            >
              <option value="">Select a topic...</option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.topics?.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Publication</label>
            <input
              type="text"
              value={publication}
              onChange={(e) => setPublication(e.target.value)}
              placeholder="e.g. Daily Tech"
              className="w-full px-4 py-2.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm outline-none"
            />
          </div>
        </div>

        {body && (
          <div className="text-xs text-stone-400 bg-stone-50 dark:bg-stone-900 p-3 rounded-lg border border-stone-100 dark:border-stone-800 inline-block w-fit">
            📖 <strong>{calculateReadTime(body)}</strong> estimated reading time.
          </div>
        )}

        <div className="flex gap-4 items-center mt-8 pb-10">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Story"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}