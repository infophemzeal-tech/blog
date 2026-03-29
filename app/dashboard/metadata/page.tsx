"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type MetaRow = {
  id: number
  title: string
  description: string
  keywords: string[]
  og_title: string
  og_description: string
  og_image: string
  twitter_title: string
  twitter_description: string
}

export default function MetadataEditor() {
  const supabase = createClient()
  const [form, setForm]       = useState<Partial<MetaRow>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("site_metadata")
        .select("*")
        .single()
      if (data) setForm(data)
      setLoading(false)
    }
    load()
  }, [])

  function set(key: keyof MetaRow, value: string | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from("site_metadata")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", form.id!)

    if (!error) {
      setSaved(true)
      // Revalidate Next.js cache so new metadata reflects immediately
      await fetch("/api/revalidate?path=/", { method: "POST" })
    }
    setSaving(false)
  }

  if (loading) return <p className="p-8 text-stone-500">Loading…</p>

  return (
    <div className="max-w-2xl mx-auto p-8 flex flex-col gap-6">
      <h1 className="text-xl font-bold text-stone-900 dark:text-white">
        Site Metadata
      </h1>

      <Field label="Page title"       value={form.title ?? ""}       onChange={(v) => set("title", v)} />
      <Field label="Description"      value={form.description ?? ""} onChange={(v) => set("description", v)} textarea />
      <Field
        label="Keywords (comma-separated)"
        value={(form.keywords ?? []).join(", ")}
        onChange={(v) => set("keywords", v.split(",").map((k) => k.trim()).filter(Boolean))}
      />

      <hr className="border-stone-100 dark:border-stone-800" />
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Open Graph</p>

      <Field label="OG title"       value={form.og_title ?? ""}       onChange={(v) => set("og_title", v)} placeholder={form.title} />
      <Field label="OG description" value={form.og_description ?? ""} onChange={(v) => set("og_description", v)} textarea placeholder={form.description} />
      <Field label="OG image URL"   value={form.og_image ?? ""}       onChange={(v) => set("og_image", v)} />

      <hr className="border-stone-100 dark:border-stone-800" />
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">Twitter / X</p>

      <Field label="Twitter title"       value={form.twitter_title ?? ""}       onChange={(v) => set("twitter_title", v)} placeholder={form.title} />
      <Field label="Twitter description" value={form.twitter_description ?? ""} onChange={(v) => set("twitter_description", v)} textarea placeholder={form.description} />

      <button
        onClick={handleSave}
        disabled={saving}
        className="self-start px-6 py-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-bold hover:opacity-80 transition disabled:opacity-40 cursor-pointer"
      >
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </div>
  )
}

// ── Reusable field ────────────────────────────────────────────────────────────

function Field({
  label, value, onChange, textarea, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  textarea?: boolean
  placeholder?: string
}) {
  const base =
    "w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-stone-500 dark:text-stone-400">{label}</label>
      {textarea ? (
        <textarea
          className={`${base} resize-none`}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={base}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}