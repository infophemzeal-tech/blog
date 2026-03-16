"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import Highlight from "@tiptap/extension-highlight"
import { useEffect, useCallback, useState } from "react"

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const COLORS = [
  "#000000", "#374151", "#6B7280", "#EF4444",
  "#F97316", "#EAB308", "#22C55E", "#3B82F6",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B",
]

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
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
  return <div className="w-px h-5 bg-stone-200 dark:bg-stone-700 mx-0.5" />
}

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [showColorPicker, setShowColorPicker] = useState(false)

  const editor = useEditor({
  immediatelyRender: false,
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-600 dark:text-blue-400 underline cursor-pointer",
      },
    }),
  ],
  content: value,
  editorProps: {
    attributes: {
      class:
        "min-h-[400px] outline-none font-serif text-lg text-stone-800 dark:text-stone-200 leading-[1.8] focus:outline-none",
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
}, [value])
  const setLink = useCallback(() => {
    if (!editor) return
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}` })
        .run()
    }
    setLinkUrl("")
    setShowLinkInput(false)
  }, [editor, linkUrl])

  if (!editor) return null

  return (
    <div className="flex flex-col border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">

        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align left"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align center"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          title="Align right"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          title="Justify"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
            <circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
            <path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              if (editor.isActive("link")) {
                editor.chain().focus().unsetLink().run()
              } else {
                const existing = editor.getAttributes("link").href || ""
                setLinkUrl(existing)
                setShowLinkInput((v) => !v)
              }
            }}
            active={editor.isActive("link")}
            title="Add link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
          </ToolbarButton>

          {showLinkInput && (
            <div className="absolute top-8 left-0 z-50 flex items-center gap-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg px-3 py-2 w-64">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setLink()}
                placeholder="https://example.com"
                autoFocus
                className="flex-1 text-xs bg-transparent outline-none text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
              />
              <button
                type="button"
                onClick={setLink}
                className="text-xs text-green-600 dark:text-green-400 font-medium cursor-pointer hover:text-green-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setShowLinkInput(false)}
                className="text-xs text-stone-400 cursor-pointer hover:text-stone-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <Divider />

        {/* Text color */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              setShowColorPicker((v) => !v)
            }}
            title="Text color"
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold leading-none" style={{ color: editor.getAttributes("textStyle").color || "currentColor" }}>A</span>
              <div className="w-3.5 h-1 rounded-sm" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#000000" }} />
            </div>
          </ToolbarButton>

          {showColorPicker && (
            <div className="absolute top-8 left-0 z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg p-2 w-36">
              <p className="text-xs text-stone-400 dark:text-stone-500 mb-2">Text color</p>
              <div className="grid grid-cols-6 gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setColor(color).run()
                      setShowColorPicker(false)
                    }}
                    className="w-5 h-5 rounded-sm cursor-pointer hover:scale-110 transition-transform border border-stone-200 dark:border-stone-600"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run()
                  setShowColorPicker(false)
                }}
                className="mt-2 w-full text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer text-left"
              >
                Reset color
              </button>
            </div>
          )}
        </div>

        {/* Highlight */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight({ color: "#FEF08A" }).run()}
          active={editor.isActive("highlight")}
          title="Highlight"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 11l-6 6v3h3l6-6"/>
            <path d="M22 2l-3-1-8 8 4 4 8-8-1-3z"/>
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Horizontal rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="2" y1="12" x2="22" y2="12"/>
          </svg>
        </ToolbarButton>

        {/* Undo / Redo */}
        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
          </svg>
        </ToolbarButton>

      </div>

      {/* Editor area */}
      <div className="px-4 py-4 bg-white dark:bg-stone-950 relative">
        {editor.isEmpty && (
          <p className="absolute top-4 left-4 text-stone-300 dark:text-stone-700 font-serif text-lg pointer-events-none select-none">
            {placeholder || "Tell your story..."}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* Editor styles */}
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
      `}</style>

    </div>
  )
}