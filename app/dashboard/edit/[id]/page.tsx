"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ImageUpload"
import RichEditor from "@/components/RichEditor"
import Swal from "sweetalert2"

// --- Premium SVG Icons ---
const TopicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
)
const PubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v18l-8-4-8 4Z"/></svg>
)
const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
)

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
    confirmButton: 'font-sans text-xs px-5 py-2.5 rounded-full font-bold bg-stone-900 dark:bg-white text-white dark:text-black border-none',
  }
})

export default function EditPage() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [body, setBody] = useState("")
  const [publication, setPublication] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [published, setPublished] = useState(true)
  
  // Tag State
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  
  const [categories, setCategories] = useState<TopicCategory[]>([])
  const [topicId, setTopicId] = useState<string | number>("")
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  // Auto-resize for Title/Subtitle
  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  // --- Initial Data Load ---
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
          setTags(articleData.tags || []) // Load existing tags
        }
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setFetching(false)
      }
    }
    fetchInitialData()
  }, [params.id, supabase])

  // --- Auto Tag Logic (Sync with Write Page) ---
  const autoGetTags = () => {
    const text = `${title} ${subtitle} ${body.replace(/<[^>]*>/g, "")}`.toLowerCase();
    const stopWords = ['this', 'that', 'with', 'from', 'your', 'about', 'gist', 'story'];
    const words = text.match(/\b(\w{4,})\b/g); 
    if (!words) return;

    const freq: Record<string, number> = {};
    words.forEach(w => {
        if (!stopWords.includes(w)) freq[w] = (freq[w] || 0) + 1;
    });

    const sortedTags = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);

    setTags(Array.from(new Set([...tags, ...sortedTags])));
    toastSuccess("Suggested tags added")
  }

  const toastSuccess = (msg: string) => {
    const isDark = document.documentElement.classList.contains('dark')
    Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, 
        background: isDark ? '#1c1917' : '#fff', color: isDark ? '#fff' : '#000'
    }).fire({ icon: 'success', title: msg })
  }

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
        e.preventDefault();
        const cleanTag = tagInput.replace(",", "").trim().toLowerCase();
        if (!tags.includes(cleanTag) && tags.length < 10) {
            setTags([...tags, cleanTag]);
        }
        setTagInput("");
    }
  }

  const removeTag = (idx: number) => setTags(tags.filter((_, i) => i !== idx));

  const calculateReadTime = (text: string) => {
    const strippedBody = text.replace(/<[^>]+>/g, "")
    const wordCount = strippedBody.trim().split(/\s+/).filter(word => word.length > 0).length
    return `${Math.max(1, Math.ceil(wordCount / 200))} min`
  }

  // --- Submit Update ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const isDark = document.documentElement.classList.contains('dark')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Banned check
    const { data: profile } = await supabase.from('profiles').select('is_banned').eq('id', user.id).single()
    if (profile?.is_banned) {
      setLoading(false)
      Swal.fire({ ...swalConfig(isDark), icon: 'error', title: 'Restricted', text: 'You cannot update stories.' })
      return
    }

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
        tags: tags, // Saving the tags array
        read_time: calculateReadTime(body),
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)

    if (updateError) {
      setLoading(false)
      Swal.fire({ ...swalConfig(isDark), icon: 'error', title: 'Error', text: updateError.message })
      return
    }

    toastSuccess("Gist updated successfully")
    router.push("/dashboard")
    router.refresh()
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-stone-900 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 font-sans">
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white uppercase tracking-tighter">
          Edit Gist
        </h1>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{published ? 'Public' : 'Draft'}</span>
            <button
                type="button"
                onClick={() => setPublished(!published)}
                className={`w-10 h-5 rounded-full relative flex items-center px-1 transition-colors ${published ? 'bg-green-600' : 'bg-stone-300 dark:bg-stone-700'}`}
            >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-all ${published ? 'translate-x-4.5' : 'translate-x-0'}`} />
            </button>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="flex flex-col gap-6 sm:gap-10">
        
        <ImageUpload onUpload={setCoverImage} currentImage={coverImage} />

        <div className="space-y-2">
            <textarea
                value={title}
                onChange={(e) => { setTitle(e.target.value); handleAutoResize(e) }}
                placeholder="Title" required rows={1}
                className="w-full font-serif text-4xl sm:text-6xl font-bold text-stone-900 dark:text-white bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-100 border-none leading-tight py-2"
            />

            <textarea
                value={subtitle}
                onChange={(e) => { setSubtitle(e.target.value); handleAutoResize(e) }}
                placeholder="Subtitle" rows={1}
                className="w-full font-serif text-xl sm:text-2xl text-stone-400 bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-100 border-none leading-relaxed"
            />
        </div>

        <div className="border-t border-stone-100 dark:border-stone-900/50" />

        <div className="min-h-[400px]">
          <RichEditor value={body} onChange={setBody} placeholder="Update your story..." />
        </div>

        {/* SETTINGS CARD */}
        <div className="bg-stone-50/50 dark:bg-stone-900/20 border border-stone-100 dark:border-stone-800 p-6 sm:p-10 rounded-[2.5rem] space-y-10 mt-8 shadow-sm">
          
          {/* TAGS SYSTEM */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                    <TagIcon /> Keywords/Tags
                </label>
                <button 
                    type="button" 
                    onClick={autoGetTags}
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-700 uppercase"
                >
                    ✦ Smart Tag
                </button>
             </div>
             
             <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-white dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800">
                {tags.map((t, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-full text-[11px] font-bold">
                        {t}
                        <button type="button" onClick={() => removeTag(i)} className="text-stone-400 hover:text-red-500">×</button>
                    </span>
                ))}
                <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type and enter..."
                    className="flex-1 bg-transparent outline-none text-sm font-medium min-w-[120px]"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                  <TopicIcon /> Category
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 text-sm font-semibold outline-none appearance-none"
              >
                <option value="">No Category</option>
                {categories.map((cat) => (
                  <optgroup key={cat.id} label={cat.name}>
                    {cat.topics?.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                  <PubIcon /> Publication
              </label>
              <input
                type="text"
                value={publication}
                onChange={(e) => setPublication(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 text-sm font-semibold outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-12 py-4 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-extrabold transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-stone-400 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}