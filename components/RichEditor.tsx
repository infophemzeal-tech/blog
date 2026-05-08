"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import CharacterCount from "@tiptap/extension-character-count"
import { useEffect, useCallback, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  value: string
  onChange: (value: string) => void
  onSeoChange?: (meta: SeoMeta) => void
  placeholder?: string
}

export type SeoMeta = {
  metaDescription: string
  focusKeyword: string
  canonicalUrl: string
  ogImage: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  "#000000", "#374151", "#6B7280", "#EF4444",
  "#F97316", "#EAB308", "#22C55E", "#3B82F6",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B",
]

// ─── SEO Utilities ────────────────────────────────────────────────────────────

function fleschScore(text: string): { score: number; label: string; color: string } {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.match(/\b\w+\b/g) ?? []
  const syllables = words.reduce((acc, w) => acc + Math.max(1, w.toLowerCase().replace(/[^aeiou]/g, "").length), 0)
  if (!sentences.length || !words.length) return { score: 0, label: "—", color: "text-stone-400" }
  const raw = Math.round(206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length))
  const score = Math.min(100, Math.max(0, raw))
  if (score >= 70) return { score, label: "Easy", color: "text-green-500" }
  if (score >= 50) return { score, label: "OK", color: "text-yellow-500" }
  return { score, label: "Hard", color: "text-red-400" }
}

function keywordDensity(text: string, keyword: string): { value: string; color: string } {
  if (!keyword.trim()) return { value: "—", color: "text-stone-400" }
  const words = text.match(/\b\w+\b/g) ?? []
  if (!words.length) return { value: "0%", color: "text-stone-400" }
  const count = words.filter(w => w.toLowerCase() === keyword.toLowerCase()).length
  const pct = (count / words.length) * 100
  const value = `${pct.toFixed(1)}%`
  const color = pct === 0 ? "text-stone-400" : pct < 0.5 ? "text-yellow-500" : pct <= 2.5 ? "text-green-500" : "text-red-400"
  return { value, color }
}

// ─── ToolbarButton ────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`w-7 h-7 flex items-center justify-center rounded text-xs transition-colors cursor-pointer ${
        active
          ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
          : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white"
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-stone-200 dark:bg-stone-700 mx-0.5" aria-hidden="true" />
}

// ─── Image Dialog ─────────────────────────────────────────────────────────────
// Renders INLINE (not absolute) to avoid z-index/overflow issues on some layouts.
// The toolbar button toggles a full-width panel below the toolbar row.

function ImagePanel({ onConfirm, onClose }: {
  onConfirm: (src: string, alt: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<"url" | "upload">("url")
  const [src, setSrc] = useState("")
  const [alt, setAlt] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleUpload(file: File) {
    setError("")
    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const path = `editor/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from("images").getPublicUrl(path)
      setSrc(data.publicUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const canInsert = src.trim().length > 0 && !uploading

  return (
    <div className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-4 py-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
          {/* Image icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          Insert Image
        </p>
        <button type="button" onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-xs">
          ✕
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5 mb-3 w-fit">
        {(["url", "upload"] as const).map(t => (
          <button key={t} type="button" onClick={() => { setTab(t); setSrc(""); setError("") }}
            className={`h-6 px-3 rounded-md text-xs font-bold transition-colors ${
              tab === t
                ? "bg-white dark:bg-stone-950 text-stone-900 dark:text-white shadow-sm"
                : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
            }`}>
            {t === "url" ? "Paste URL" : "Upload file"}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Left: input area */}
        <div className="flex-1 flex flex-col gap-2">
          {tab === "url" ? (
            <input
              autoFocus
              type="url"
              value={src}
              onChange={e => { setSrc(e.target.value); setError("") }}
              onKeyDown={e => e.key === "Enter" && canInsert && onConfirm(src.trim(), alt)}
              placeholder="https://example.com/image.jpg"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500 transition-shadow"
            />
          ) : (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file)
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full h-20 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 text-xs text-stone-400 hover:border-stone-400 dark:hover:border-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors flex flex-col items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/></svg>
                    Uploading…
                  </>
                ) : src ? (
                  <span className="text-green-500 font-bold text-[11px] flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Uploaded — click to replace
                  </span>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Click to choose image
                    <span className="text-[10px] text-stone-300 dark:text-stone-600">PNG, JPG, GIF, WebP</span>
                  </>
                )}
              </button>
            </>
          )}

          <input
            type="text"
            value={alt}
            onChange={e => setAlt(e.target.value)}
            placeholder="Alt text — describe the image (good for SEO)"
            className="w-full h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm outline-none focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-500 transition-shadow"
          />

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </p>
          )}

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => canInsert && onConfirm(src.trim(), alt)}
              disabled={!canInsert}
              className="flex-1 h-8 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold disabled:opacity-30 hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
            >
              Insert image
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right: live preview */}
        {src && (
          <div className="sm:w-40 flex-shrink-0">
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1.5">Preview</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt || "Preview"}
              onError={() => setError("Could not load image from this URL")}
              className="w-full h-28 object-cover rounded-lg border border-stone-200 dark:border-stone-700"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Table Panel ──────────────────────────────────────────────────────────────

function TablePanel({ onConfirm, onClose }: {
  onConfirm: (rows: number, cols: number, header: boolean) => void
  onClose: () => void
}) {
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [header, setHeader] = useState(true)

  // Visual grid preview (max 6×6)
  const previewRows = Math.min(rows, 6)
  const previewCols = Math.min(cols, 6)

  return (
    <div className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
          Insert Table
        </p>
        <button type="button" onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-xs">
          ✕
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            {([
              ["Rows", rows, setRows],
              ["Columns", cols, setCols],
            ] as const).map(([label, val, set]) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold tracking-wide text-stone-400">{label}</label>
                <div className="flex items-center gap-1">
                  <button type="button" onMouseDown={e => { e.preventDefault(); set(Math.max(1, val - 1)) }}
                    className="w-7 h-7 rounded-md border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-bold transition-colors flex items-center justify-center">
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-mono font-bold text-stone-800 dark:text-stone-200">
                    {val}
                  </span>
                  <button type="button" onMouseDown={e => { e.preventDefault(); set(Math.min(20, val + 1)) }}
                    className="w-7 h-7 rounded-md border border-stone-200 dark:border-stone-700 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 text-sm font-bold transition-colors flex items-center justify-center">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-stone-500 cursor-pointer select-none group">
            <div
              onClick={() => setHeader(h => !h)}
              className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${header ? "bg-stone-900 dark:bg-white" : "bg-stone-200 dark:bg-stone-700"}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white dark:bg-stone-900 mt-0.5 transition-transform ${header ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            <span className="group-hover:text-stone-800 dark:group-hover:text-stone-200 transition-colors">
              Header row
            </span>
          </label>

          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => onConfirm(rows, cols, header)}
              className="flex-1 h-8 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-bold hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors">
              Insert table
            </button>
            <button type="button" onClick={onClose}
              className="h-8 px-4 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>

        {/* Visual preview grid */}
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1.5">Preview</p>
          <div
            className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden"
            style={{ display: "grid", gridTemplateColumns: `repeat(${previewCols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: previewRows }).map((_, r) =>
              Array.from({ length: previewCols }).map((_, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-8 h-6 border border-stone-200 dark:border-stone-700 ${
                    r === 0 && header
                      ? "bg-stone-200 dark:bg-stone-700"
                      : "bg-white dark:bg-stone-900"
                  }`}
                />
              ))
            )}
          </div>
          {(rows > 6 || cols > 6) && (
            <p className="text-[10px] text-stone-400 mt-1">Preview shows up to 6×6</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SEO Panel ────────────────────────────────────────────────────────────────

function SeoPanel({ plainText, meta, onChange }: {
  plainText: string
  meta: SeoMeta
  onChange: (m: SeoMeta) => void
}) {
  const flesch = fleschScore(plainText)
  const density = keywordDensity(plainText, meta.focusKeyword)
  const metaLen = meta.metaDescription.length
  const metaColor = metaLen === 0 ? "text-stone-400" : metaLen <= 160 ? "text-green-500" : "text-red-400"

  return (
    <div className="border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 px-4 py-5 flex flex-col gap-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        SEO
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-500">Readability</span>
        <span className={`text-xs font-bold ${flesch.color}`}>
          {flesch.label}{flesch.score > 0 ? ` (${flesch.score})` : ""}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="seo-keyword" className="text-xs text-stone-500">Focus keyword</label>
          <span className={`text-[10px] font-mono ${density.color}`}>density: {density.value}</span>
        </div>
        <input id="seo-keyword" type="text" value={meta.focusKeyword}
          onChange={e => onChange({ ...meta, focusKeyword: e.target.value })}
          placeholder="e.g. content marketing"
          className="w-full h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm outline-none" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="seo-meta" className="text-xs text-stone-500">Meta description</label>
          <span className={`text-[10px] font-mono ${metaColor}`}>{metaLen}/160</span>
        </div>
        <textarea id="seo-meta" value={meta.metaDescription}
          onChange={e => onChange({ ...meta, metaDescription: e.target.value })}
          placeholder="Brief description for search results (120–160 chars ideal)"
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm outline-none resize-none" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="seo-canonical" className="text-xs text-stone-500">
          Canonical URL <span className="opacity-50">(optional)</span>
        </label>
        <input id="seo-canonical" type="url" value={meta.canonicalUrl}
          onChange={e => onChange({ ...meta, canonicalUrl: e.target.value })}
          placeholder="https://nairaly.com/this-post"
          className="w-full h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm outline-none" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="seo-og" className="text-xs text-stone-500">
          OG image URL <span className="opacity-50">(1200×630)</span>
        </label>
        <input id="seo-og" type="url" value={meta.ogImage}
          onChange={e => onChange({ ...meta, ogImage: e.target.value })}
          placeholder="https://nairaly.com/og.jpg"
          className="w-full h-9 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950 text-sm outline-none" />
        {meta.ogImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.ogImage} alt="OG preview"
            className="w-full h-28 object-cover rounded-lg mt-1 border border-stone-200 dark:border-stone-700" />
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RichEditor({ value, onChange, onSeoChange, placeholder }: Props) {

  // Toolbar popup state — only one open at a time
  type Panel = "none" | "link" | "color" | "image" | "table" | "seo"
  const [activePanel, setActivePanel] = useState<Panel>("none")

  const [linkUrl, setLinkUrl] = useState("")
  const [seoMeta, setSeoMeta] = useState<SeoMeta>({
    metaDescription: "", focusKeyword: "", canonicalUrl: "", ogImage: "",
  })

  const openPanel = (p: Panel) => setActivePanel(prev => prev === p ? "none" : p)
  const closePanel = () => setActivePanel("none")

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 dark:text-blue-400 underline cursor-pointer" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full my-4" },
        inline: false,
        allowBase64: true,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "min-h-[400px] outline-none font-serif text-lg text-stone-800 dark:text-stone-200 leading-[1.8] focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const setLink = useCallback(() => {
    if (!editor) return
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link")
        .setLink({ href: linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}` })
        .run()
    }
    setLinkUrl("")
    closePanel()
  }, [editor, linkUrl])

  // ── Image insert ─────────────────────────────────────────────────────────────
  const insertImage = useCallback((src: string, alt: string) => {
    if (!editor) return
    editor.chain().focus().setImage({ src, alt }).run()
    closePanel()
  }, [editor])

  // ── Table insert ─────────────────────────────────────────────────────────────
  const insertTable = useCallback((rows: number, cols: number, header: boolean) => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: header }).run()
    closePanel()
  }, [editor])

  const handleSeoChange = useCallback((meta: SeoMeta) => {
    setSeoMeta(meta)
    onSeoChange?.(meta)
  }, [onSeoChange])

  if (!editor) return null

  const isInTable = editor.isActive("table")
  const plainText = editor.getText()
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0
  const charCount = editor.storage.characterCount?.characters() ?? 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="flex flex-col border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">

        {/* Bold / Italic / Underline / Strike */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")} title="Bold"><strong>B</strong></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")} title="Italic"><em>I</em></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")} title="Underline"><span className="underline">U</span></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")} title="Strikethrough"><span className="line-through">S</span></ToolbarButton>

        <Divider />

        {/* Headings */}
        {[1, 2, 3].map(level => (
          <ToolbarButton key={level}
            onClick={() => editor.chain().focus().toggleHeading({ level: level as 1|2|3 }).run()}
            active={editor.isActive("heading", { level })} title={`Heading ${level}`}>
            H{level}
          </ToolbarButton>
        ))}

        <Divider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })} title="Align left">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })} title="Align center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })} title="Align right">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })} title="Justify">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Lists / Quote / Code */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")} title="Bullet list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")} title="Numbered list">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")} title="Blockquote">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")} title="Code block">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run()
            } else {
              setLinkUrl(editor.getAttributes("link").href || "")
              openPanel("link")
            }
          }}
          active={editor.isActive("link")} title="Add link">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Color */}
        <div className="relative">
          <ToolbarButton onClick={() => openPanel("color")} title="Text color">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold leading-none" style={{ color: editor.getAttributes("textStyle").color || "currentColor" }}>A</span>
              <div className="w-3.5 h-1 rounded-sm" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000000" }} />
            </div>
          </ToolbarButton>
          {activePanel === "color" && (
            <div className="absolute top-8 left-0 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg p-2 w-36">
              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">Text color</p>
              <div className="grid grid-cols-6 gap-1">
                {COLORS.map(color => (
                  <button key={color} type="button"
                    onClick={() => { editor.chain().focus().setColor(color).run(); closePanel() }}
                    className="w-5 h-5 rounded-sm cursor-pointer hover:scale-110 transition-transform border border-stone-200 dark:border-stone-600"
                    style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
              <button type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); closePanel() }}
                className="mt-2 w-full text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer text-left">
                Reset color
              </button>
            </div>
          )}
        </div>

        {/* Highlight */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: "#FEF08A" }).run()}
          active={editor.isActive("highlight")} title="Highlight">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l-6 6v3h3l6-6"/><path d="M22 2l-3-1-8 8 4 4 8-8-1-3z"/></svg>
        </ToolbarButton>

        <Divider />

        {/* HR / Undo / Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="12" x2="22" y2="12"/></svg>
        </ToolbarButton>
        <Divider />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/></svg>
        </ToolbarButton>

        <Divider />

        {/* ── IMAGE button ─────────────────────────────────────────────────── */}
        <ToolbarButton
          onClick={() => openPanel("image")}
          active={activePanel === "image"}
          title="Insert image"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
        </ToolbarButton>

        {/* ── TABLE button ─────────────────────────────────────────────────── */}
        <ToolbarButton
          onClick={() => openPanel("table")}
          active={isInTable || activePanel === "table"}
          title="Insert table"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
        </ToolbarButton>

        {/* Table context controls — only when cursor is inside a table */}
        {isInTable && (
          <>
            <Divider />
            <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row below">
              <span className="text-[10px] font-bold">+R</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row">
              <span className="text-[10px] font-bold text-red-400">−R</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column right">
              <span className="text-[10px] font-bold">+C</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column">
              <span className="text-[10px] font-bold text-red-400">−C</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().mergeCells().run()} title="Merge cells">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().splitCell().run()} title="Split cell">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">
              <span className="text-[10px] font-bold text-red-400">Del⊞</span>
            </ToolbarButton>
          </>
        )}

        {/* SEO toggle — pushed right */}
        <div className="ml-auto">
          <button type="button" onClick={() => openPanel("seo")} aria-pressed={activePanel === "seo"}
            className={`flex items-center gap-1 h-6 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
              activePanel === "seo"
                ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            SEO
          </button>
        </div>
      </div>

      {/* ── Inline panels (render between toolbar and editor) ─────────────── */}

      {/* Link panel */}
      {activePanel === "link" && (
        <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 px-4 py-2.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-400 flex-shrink-0"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          <input
            type="text"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setLink()}
            placeholder="https://example.com"
            autoFocus
            className="flex-1 text-sm bg-transparent outline-none text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
          />
          <button type="button" onClick={setLink}
            className="text-xs text-green-600 dark:text-green-400 font-bold hover:text-green-700 cursor-pointer">Apply</button>
          <button type="button" onClick={closePanel}
            className="text-xs text-stone-400 cursor-pointer hover:text-stone-700 dark:hover:text-white">✕</button>
        </div>
      )}

      {/* Image panel */}
      {activePanel === "image" && (
        <ImagePanel onConfirm={insertImage} onClose={closePanel} />
      )}

      {/* Table panel */}
      {activePanel === "table" && (
        <TablePanel onConfirm={insertTable} onClose={closePanel} />
      )}

      {/* ── Editor area ──────────────────────────────────────────────────────── */}
      <div className="px-4 py-4 bg-white dark:bg-stone-950 relative" onClick={() => editor.commands.focus()}>
        {editor.isEmpty && (
          <p className="absolute top-4 left-4 text-stone-300 dark:text-stone-700 font-serif text-lg pointer-events-none select-none">
            {placeholder || "Start writing your story…"}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* ── SEO panel (bottom) ───────────────────────────────────────────────── */}
      {activePanel === "seo" && (
        <SeoPanel plainText={plainText} meta={seoMeta} onChange={handleSeoChange} />
      )}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
        <span className="text-[10px] font-mono text-stone-400">
          {wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars · {readingTime} min read
        </span>
        <span className="text-[10px] text-stone-300 dark:text-stone-700 hidden sm:block">
          ⌘B bold · ⌘I italic · ⌘K link
        </span>
      </div>

      {/* ── Styles ───────────────────────────────────────────────────────────── */}
      <style>{`
        .ProseMirror h1 { font-size: 2rem; font-weight: 700; margin: 1rem 0 0.5rem; font-family: Georgia, serif; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; margin: 1rem 0 0.5rem; font-family: Georgia, serif; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; font-family: Georgia, serif; }
        .ProseMirror p { margin: 0.5rem 0; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror li { margin: 0.25rem 0; }
        .ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; color: #6b7280; margin: 1rem 0; font-style: italic; }
        .ProseMirror pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.875rem; margin: 0.75rem 0; overflow-x: auto; }
        .ProseMirror code { background: #f3f4f6; color: #e11d48; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; font-family: monospace; }
        .ProseMirror pre code { background: transparent; color: inherit; padding: 0; }
        .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5rem 0; }
        .ProseMirror mark { border-radius: 0.2rem; padding: 0.1rem 0; }
        .dark .ProseMirror blockquote { border-left-color: #4b5563; color: #9ca3af; }
        .dark .ProseMirror code { background: #1f2937; color: #f472b6; }
        .dark .ProseMirror hr { border-top-color: #374151; }

        /* Table styles */
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; }
        .ProseMirror th, .ProseMirror td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; min-width: 60px; }
        .ProseMirror th { background: #f9fafb; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .ProseMirror .selectedCell { background: #eff6ff !important; }
        .ProseMirror .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; background: #3b82f6; cursor: col-resize; pointer-events: all; }
        .ProseMirror .tableWrapper { overflow-x: auto; }
        .dark .ProseMirror th { background: #1c1917; }
        .dark .ProseMirror th, .dark .ProseMirror td { border-color: #374151; }
        .dark .ProseMirror .selectedCell { background: #1e3a5f !important; }

        /* Image styles */
        .ProseMirror img { border-radius: 0.75rem; max-width: 100%; height: auto; margin: 1rem 0; display: block; cursor: pointer; }
        .ProseMirror img.ProseMirror-selectednode { outline: 3px solid #3b82f6; outline-offset: 2px; border-radius: 0.75rem; }

        /* Resize cursor when table resizable */
        .resize-cursor { cursor: col-resize; }
      `}</style>
    </div>
  )
}