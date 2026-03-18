"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../lib/supabase/client"
import ImageUpload from "@/components/ImageUpload"
import RichEditor from "@/components/RichEditor"
import Swal from "sweetalert2"

// --- HELPERS ---
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80)
}

function autoParagraph(text: string) {
  if (!/<[a-z][\s\S]*>/i.test(text)) {
    return text.split(/\n\n+/).map((p) => `<p>${p.trim()}</p>`).join("")
  }
  return text
}

// --- COMPACT SWEETALERT CONFIG ---
const swalConfig = (isDark: boolean) => ({
  width: '340px',
  padding: '1.25rem',
  background: isDark ? '#1c1917' : '#fff',
  color: isDark ? '#fff' : '#000',
  customClass: {
    title: 'font-serif text-lg font-bold',
    htmlContainer: 'font-sans text-xs opacity-70',
    confirmButton: 'font-sans text-xs px-4 py-2 rounded-full font-bold bg-green-600',
  }
})

export default function WritePage() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [body, setBody] = useState("")
  const [publication, setPublication] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  
  // Topic state (added to match your database schema)
  const [categories, setCategories] = useState<any[]>([])
  const [topicId, setTopicId] = useState<string>("")

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const subtitleRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load categories for the dropdown
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("topic_categories").select("id, name, topics(id, name)")
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [supabase])

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const isDark = document.documentElement.classList.contains('dark')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/signin")
      return
    }

    // --- SECURITY CHECK: IS BANNED? ---
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
        title: 'Restricted',
        text: 'Your account has been banned from posting new stories.',
        confirmButtonColor: '#dc2626'
      })
      return
    }

    const finalBody = autoParagraph(body)
    const wordCount = finalBody.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`
    const slug = slugify(title) + "-" + Date.now().toString().slice(-4)

    const { error: dbError } = await supabase.from("articles").insert({
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      body: finalBody,
      publication: publication.trim() || null,
      slug,
      cover_image: coverImage || null,
      read_time: readTime,
      author_id: user.id,
      published,
      topic_id: topicId === "" ? null : Number(topicId),
      claps_count: 0,
      comments_count: 0,
    })

    if (dbError) {
      setLoading(false)
      Swal.fire({ ...swalConfig(isDark), icon: 'error', title: 'Error', text: dbError.message })
      return
    }

    // SUCCESS NOTIFICATION
    Swal.fire({
      ...swalConfig(isDark),
      icon: 'success',
      title: published ? 'Published!' : 'Saved!',
      text: published ? 'Your story is now live.' : 'Story saved to your drafts.',
      timer: 2000,
      showConfirmButton: false
    })

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20 font-sans">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">
          New story
        </h1>
        <label className="flex items-center gap-2 text-sm text-stone-500 cursor-pointer select-none font-medium">
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
        <ImageUpload onUpload={setCoverImage} currentImage={coverImage} />

        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => { setTitle(e.target.value); handleAutoResize(e) }}
          placeholder="Title"
          required
          rows={1}
          className="w-full font-serif text-4xl font-bold text-stone-900 dark:text-white bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-200 border-none leading-tight"
        />

        <textarea
          ref={subtitleRef}
          value={subtitle}
          onChange={(e) => { setSubtitle(e.target.value); handleAutoResize(e) }}
          placeholder="Subtitle (optional)"
          rows={1}
          className="w-full font-serif text-xl text-stone-400 bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-200 border-none leading-relaxed"
        />

        <div className="border-t border-stone-100 dark:border-stone-800" />

        <RichEditor value={body} onChange={setBody} placeholder="Tell your story..." />

        <div className="border-t border-stone-100 dark:border-stone-800 mt-6 pt-6" />

        {/* BOTTOM METADATA - TOPICS & PUBLICATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400">Topic</label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm outline-none cursor-pointer"
            >
              <option value="">Select a topic...</option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.topics?.map((t: any) => (
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
              className="w-full px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <button
            type="submit"
            disabled={loading || !title.trim() || !body.trim()}
            className="px-8 py-2.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-green-200 dark:shadow-none"
          >
            {loading ? "..." : published ? "Publish" : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}