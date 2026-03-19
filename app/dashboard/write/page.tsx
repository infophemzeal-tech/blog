"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../lib/supabase/client"
import ImageUpload from "@/components/ImageUpload"
import RichEditor from "@/components/RichEditor"
import Swal from "sweetalert2"

// --- PREMIUM SVG ICONS ---
const TopicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
)

const PubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v18l-8-4-8 4Z"/></svg>
)

// --- HELPERS ---
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80)
const autoParagraph = (t: string) => !/<[a-z][\s\S]*>/i.test(t) ? t.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join("") : t

const swalConfig = (isDark: boolean) => ({
  width: '340px',
  padding: '1.25rem',
  background: isDark ? '#1c1917' : '#fff',
  color: isDark ? '#fff' : '#000',
  customClass: {
    title: 'font-serif text-lg font-bold',
    htmlContainer: 'font-sans text-xs opacity-70',
    confirmButton: 'font-sans text-xs px-5 py-2.5 rounded-full font-bold bg-stone-900 dark:bg-white text-white dark:text-black border-none outline-none',
  }
})

export default function WritePage() {
  // Content State
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [body, setBody] = useState("")
  const [publication, setPublication] = useState("")
  const [coverImage, setCoverImage] = useState("")
  
  // Logic State
  const [published, setPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false) // Fixed the ReferenceError
  const [categories, setCategories] = useState<any[]>([])
  const [topicId, setTopicId] = useState<string>("")

  const titleRef = useRef<HTMLTextAreaElement>(null)
  const subtitleRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // --- FETCH INITIAL DATA (Topics + Admin Status) ---
  useEffect(() => {
    async function fetchInitialData() {
      // 1. Get Categories
      const { data: catData } = await supabase
        .from("topic_categories")
        .select("id, name, topics(id, name)")
      if (catData) setCategories(catData)

      // 2. Get User & Admin Status for styling
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role === 'super_admin') {
          setIsAdmin(true)
        }
      }
    }
    fetchInitialData()
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
    if (!user) { router.push("/auth/signin"); return }

    // SECURITY CHECK: Is user banned?
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
        text: 'Your account has been banned from posting stories.' 
      })
      return
    }

    const finalBody = autoParagraph(body)
    const wordCount = finalBody.replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length
    const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min`
    const slug = `${slugify(title)}-${Date.now().toString().slice(-4)}`

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
    })

    if (dbError) {
      setLoading(false)
      Swal.fire({ ...swalConfig(isDark), icon: 'error', title: 'Error', text: dbError.message })
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 font-sans">
      
      {/* MOBILE TOP CONTROLS */}
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <h1 className="font-serif text-2xl font-extrabold text-stone-900 dark:text-white">
          Drafting
        </h1>
        <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-stone-400">
                {published ? 'Publicly Visible' : 'Hidden Draft'}
            </span>
            <button
                type="button"
                onClick={() => setPublished(!published)}
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${published ? 'bg-green-600' : 'bg-stone-300 dark:bg-stone-700'}`}
            >
                <div className={`w-3.5 h-3.5 bg-white rounded-full transition-transform duration-200 ${published ? 'translate-x-4.5' : 'translate-x-0'}`} />
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-10">
        
        {/* EDGE-TO-EDGE COVER IMAGE ON MOBILE */}
        <div className="-mx-4 sm:mx-0 shadow-sm overflow-hidden sm:rounded-2xl">
            <ImageUpload onUpload={setCoverImage} currentImage={coverImage} />
        </div>

        {/* HEADLINE SECTION */}
        <div className="space-y-2">
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => { setTitle(e.target.value); handleAutoResize(e) }}
            placeholder="Title"
            required
            rows={1}
            className="w-full font-serif text-4xl sm:text-6xl font-bold text-stone-900 dark:text-white bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-100 dark:placeholder:text-stone-800 border-none leading-tight py-2"
          />

          <textarea
            ref={subtitleRef}
            value={subtitle}
            onChange={(e) => { setSubtitle(e.target.value); handleAutoResize(e) }}
            placeholder="Tell us a bit more about this story..."
            rows={1}
            className="w-full font-serif text-xl sm:text-2xl text-stone-400 dark:text-stone-600 bg-transparent outline-none resize-none overflow-hidden placeholder:text-stone-100 dark:placeholder:text-stone-800 border-none leading-relaxed"
          />
        </div>

        <div className="border-t border-stone-100 dark:border-stone-900/50" />

        {/* WRITING CANVAS */}
        <div className="min-h-[400px]">
          <RichEditor value={body} onChange={setBody} placeholder="Once upon a gist..." />
        </div>

        {/* SETTINGS CARD (GLASSMORYPHISM) */}
        <div className="bg-stone-50/50 dark:bg-stone-900/20 border border-stone-100 dark:border-stone-800 p-6 sm:p-10 rounded-[2.5rem] space-y-10 shadow-sm mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Topic Select */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                <TopicIcon /> Pick Category
              </label>
              <div className="relative group">
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 text-sm font-semibold outline-none group-hover:border-stone-300 dark:group-hover:border-stone-700 transition-colors cursor-pointer appearance-none"
                  >
                    <option value="">Global Feed (Uncategorized)</option>
                    {categories.map((cat) => (
                      <optgroup key={cat.id} label={cat.name} className="font-bold">
                        {cat.topics?.map((t: any) => <option key={t.id} value={t.id} className="font-medium">{t.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 opacity-50 text-[10px]">▼</div>
              </div>
            </div>

            {/* Publication Input */}
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-stone-400">
                <PubIcon /> Featured In
              </label>
              <input
                type="text"
                value={publication}
                onChange={(e) => setPublication(e.target.value)}
                placeholder="e.g. Technology Today"
                className="w-full h-12 px-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 text-sm font-semibold outline-none focus:border-stone-300 dark:focus:border-stone-700 transition-all"
              />
            </div>
          </div>
        </div>

        {/* STICKY FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-12 pb-20 lg:pb-0">
          <button
            type="submit"
            disabled={loading || !title.trim() || !body.trim()}
            className={`w-full sm:w-auto px-12 py-4 rounded-full text-sm font-extrabold transition-all shadow-xl active:scale-95 disabled:opacity-30 cursor-pointer ${
                isAdmin 
                ? 'bg-blue-600 text-white shadow-blue-200 dark:shadow-none hover:bg-blue-700' 
                : 'bg-stone-900 text-white dark:bg-white dark:text-stone-900 shadow-stone-200 dark:shadow-none hover:opacity-90'
            }`}
          >
            {loading ? "..." : published ? "Push Story Live" : "Save to Library"}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel and Exit
          </button>
        </div>

      </form>
    </div>
  )
}