"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Props {
  articleId: number
  isPinned: boolean
  isDeactivated: boolean
  authorId: string
  currentRole: string
}

export default function AdminControls({ articleId, isPinned, isDeactivated, authorId, currentRole }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggle = async (column: string, value: boolean) => {
    setLoading(true)
    await supabase.from("articles").update({ [column]: value }).eq("id", articleId)
    router.refresh()
    setLoading(false)
  }

  const toggleUserRole = async () => {
    const newRole = currentRole === "super_admin" ? "user" : "super_admin"
    if (!confirm(`Change this user to ${newRole}?`)) return
    
    setLoading(true)
    await supabase.from("profiles").update({ role: newRole }).eq("id", authorId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-1 border-l border-stone-200 dark:border-stone-800 pl-2 ml-1">
      {/* Pin Toggle */}
      <button
        disabled={loading}
        onClick={() => toggle("is_pinned", !isPinned)}
        className={`p-1.5 rounded-lg transition-colors ${isPinned ? 'text-blue-600 bg-blue-50' : 'text-stone-400 hover:bg-stone-100'}`}
        title="Pin Story"
      >
        📌
      </button>

      {/* Deactivate Toggle */}
      <button
        disabled={loading}
        onClick={() => toggle("is_deactivated", !isDeactivated)}
        className={`p-1.5 rounded-lg transition-colors ${isDeactivated ? 'text-red-600 bg-red-50' : 'text-stone-400 hover:bg-stone-100'}`}
        title={isDeactivated ? "Activate Story" : "Deactivate Story"}
      >
        🚫
      </button>

      {/* Role Toggle */}
      <button
        disabled={loading}
        onClick={toggleUserRole}
        className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
        title="Change User Role"
      >
        👤
      </button>
    </div>
  )
}