"use client"

import { useEffect, useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"

// ─── Types ────────────────────────────────────────────────────────────────────

type StaffPick = {
  id: number
  publication: string
  author: string
  title: string
  slug: string
  date: string
}

type ArticleSuggestion = {
  slug: string
  title: string
  // Supabase returns joined relations as arrays, not single objects
  profiles: { full_name: string | null }[] | null
  publication: string | null
  created_at: string
}

const EMPTY_PICK: Omit<StaffPick, "id"> = {
  publication: "",
  author: "",
  title: "",
  slug: "",
  date: "",
}

// ─── Article Slug Search ──────────────────────────────────────────────────────

function SlugSearch({
  value,
  onChange,
}: {
  value: string
  onChange: (slug: string, title: string, author: string, publication: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<ArticleSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("articles")
        .select("slug, title, publication, created_at, profiles(full_name)")
        .eq("published", true)
        .eq("is_deactivated", false)
        .ilike("title", `%${query}%`)
        .limit(6)
      setResults((data as ArticleSuggestion[]) || [])
      setOpen(true)
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search article title…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl overflow-hidden">
          {results.map((a) => (
            <li key={a.slug}>
              <button
                type="button"
                onClick={() => {
                  const author = a.profiles?.[0]?.full_name || "Nairaly Writer"
                  const pub = a.publication || ""
                  const date = new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  onChange(a.slug, a.title, author, pub)
                  setQuery(a.title)
                  setOpen(false)
                }}
                className="w-full text-left px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                <p className="text-sm font-medium text-stone-900 dark:text-white line-clamp-1">{a.title}</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {a.profiles?.[0]?.full_name || "Unknown"} · {a.publication || "Nairaly"}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Pick Form ────────────────────────────────────────────────────────────────

function PickForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<StaffPick>
  onSave: (pick: Omit<StaffPick, "id">) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<Omit<StaffPick, "id">>({
    ...EMPTY_PICK,
    ...initial,
  })
  const [isPending, startTransition] = useTransition()

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = () => {
    if (!form.slug || !form.title) return
    startTransition(() => { onSave(form) })
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Article</label>
        <SlugSearch
          value={form.title}
          onChange={(slug, title, author, publication) =>
            setForm((f) => ({ ...f, slug, title, author, publication }))
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Author</label>
          <input
            value={form.author}
            onChange={set("author")}
            placeholder="Author name"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Publication</label>
          <input
            value={form.publication}
            onChange={set("publication")}
            placeholder="e.g. Tech, Culture"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Slug</label>
          <input
            value={form.slug}
            onChange={set("slug")}
            placeholder="article-slug"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 block">Date Label</label>
          <input
            value={form.date}
            onChange={set("date")}
            placeholder="e.g. Mar 29"
            className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={isPending || !form.slug || !form.title}
          className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-bold transition-colors"
        >
          {isPending ? "Saving…" : "Save Pick"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Main Manager ─────────────────────────────────────────────────────────────

export default function StaffPicksManager() {
  const [picks, setPicks] = useState<StaffPick[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | "new" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchPicks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("staff_picks")
      .select("id, publication, author, title, slug, date")
      .order("id", { ascending: true })
    if (error) setError(error.message)
    else setPicks(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchPicks() }, [])

  const handleSave = async (pick: Omit<StaffPick, "id">, id?: number) => {
    setError(null)
    // Explicitly destructure to guarantee `id` is never sent in the payload —
    // serial columns reject explicit id values with "can only be updated to DEFAULT"
    const { publication, author, title, slug, date } = pick
    const payload = { publication, author, title, slug, date }

    if (id) {
      const { error } = await supabase.from("staff_picks").update(payload).eq("id", id)
      if (error) { setError(error.message); return }
    } else {
      const { error } = await supabase.from("staff_picks").insert(payload)
      if (error) { setError(error.message); return }
    }
    setEditingId(null)
    fetchPicks()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this staff pick?")) return
    const { error } = await supabase.from("staff_picks").delete().eq("id", id)
    if (error) { setError(error.message); return }
    fetchPicks()
  }

  const canAddMore = picks.length < 3

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">Staff Picks</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {loading ? "Loading…" : `${picks.length}/3 picks · shown in the sidebar`}
          </p>
        </div>
        {/* Show Add button as soon as we know there's room — don't wait for loading */}
        {!loading && canAddMore && editingId !== "new" && (
          <button
            onClick={() => setEditingId("new")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold hover:opacity-80 transition-opacity"
          >
            <span className="text-base leading-none">+</span> Add Pick
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {picks.map((pick) =>
            editingId === pick.id ? (
              <PickForm
                key={pick.id}
                initial={pick}
                onSave={(data) => handleSave(data, pick.id)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={pick.id}
                className="flex items-start justify-between gap-4 p-4 rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 group"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">
                      {pick.publication}
                    </span>
                    <span className="text-[10px] text-stone-300 dark:text-stone-600">·</span>
                    <span className="text-[10px] text-stone-400">{pick.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white leading-snug line-clamp-2">
                    {pick.title}
                  </p>
                  <p className="text-xs text-stone-400">by {pick.author}</p>
                  <p className="text-xs font-mono text-stone-300 dark:text-stone-600 truncate">/article/{pick.slug}</p>
                </div>
                <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingId(pick.id)}
                    className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors text-xs font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(pick.id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-stone-400 hover:text-red-600 transition-colors text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          )}

          {editingId === "new" && (
            <PickForm
              initial={EMPTY_PICK}
              onSave={(data) => handleSave(data)}
              onCancel={() => setEditingId(null)}
            />
          )}

          {picks.length === 0 && editingId !== "new" && (
            <div className="py-12 text-center text-sm text-stone-400 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
              No staff picks yet — add up to 3
            </div>
          )}
        </div>
      )}
    </div>
  )
}