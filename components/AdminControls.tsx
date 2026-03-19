"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

export default function AdminControls({ articleId, isPinned, isDeactivated, authorId, currentRole }: any) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // KISS Styled Toast
  const toast = (msg: string) => Swal.fire({ 
    toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, title: msg, icon: 'success',
    background: document.documentElement.classList.contains('dark') ? '#1c1917' : '#fff',
    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
  })

  const toggle = async (column: string, value: boolean) => {
    setLoading(true)
    await supabase.from("articles").update({ [column]: value }).eq("id", articleId)
    toast(value ? `Updated!` : `Cleared!`)
    router.refresh()
    setLoading(false)
  }

  const handleBan = async () => {
    const { value: confirmed } = await Swal.fire({
        title: 'Moderate User?',
        text: 'Set this user to Banned status?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626'
    })
    if (confirmed) {
        await supabase.from("profiles").update({ is_banned: true }).eq("id", authorId)
        toast("User Restricted")
        router.refresh()
    }
  }

  return (
    <div className="flex items-center bg-stone-50 dark:bg-stone-800/30 px-2 py-1.5 rounded-2xl gap-1">
      <button
        disabled={loading}
        onClick={() => toggle("is_pinned", !isPinned)}
        className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${isPinned ? 'bg-blue-600 text-white' : 'text-stone-400 hover:text-stone-900'}`}
        title="Pin Story"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v8"/><path d="m16 10-4 4-4-4"/><path d="M4 14h16"/></svg>
      </button>

      <button
        disabled={loading}
        onClick={() => toggle("is_deactivated", !isDeactivated)}
        className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${isDeactivated ? 'bg-red-600 text-white' : 'text-stone-400 hover:text-red-500'}`}
        title="Deactivate"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
      </button>

      <button
        disabled={loading}
        onClick={handleBan}
        className="w-9 h-9 rounded-xl transition-all text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center justify-center"
        title="Ban User"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="22" y2="13"/><line x1="22" y1="8" x2="17" y2="13"/></svg>
      </button>
    </div>
  )
}