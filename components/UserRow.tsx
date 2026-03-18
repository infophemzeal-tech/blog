"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Swal from "sweetalert2"

export default function UserRow({ userData }: { userData: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // --- COMPACT SweetAlert Style Configuration ---
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  
  const commonAlertOptions = {
    width: '360px', // Reduced width from 500px
    padding: '0.9rem',
    background: isDark ? '#1c1917' : '#fff',
    color: isDark ? '#fff' : '#000',
    confirmButtonColor: '#2563eb', 
    cancelButtonColor: '#78716c',
   customClass: {
  title: 'font-serif text-lg font-bold', // Medium-style serif title
  htmlContainer: 'font-sans text-xs opacity-70', // Clean sans text
  confirmButton: 'font-sans text-xs px-4 py-2 rounded-lg font-bold',
}
  };

  const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: isDark ? '#1c1917' : '#fff',
    color: isDark ? '#fff' : '#000',
  });

  const handleBanStatusToggle = async () => {
    const isCurrentlyBanned = userData.is_banned
    
    const result = await Swal.fire({
      ...commonAlertOptions,
      title: isCurrentlyBanned ? 'Unban User?' : 'Ban User?',
      text: isCurrentlyBanned 
        ? `Grant access back to ${userData.email}?`
        : `Restrict access for ${userData.email}?`,
      icon: isCurrentlyBanned ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: isCurrentlyBanned ? 'Yes, Unban' : 'Yes, Ban',
      confirmButtonColor: isCurrentlyBanned ? '#16a34a' : '#dc2626',
    })

    if (result.isConfirmed) {
      setLoading(true)
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: !isCurrentlyBanned })
        .eq("id", userData.id)

      if (error) {
        Swal.fire({ ...commonAlertOptions, title: 'Error', text: error.message, icon: 'error' })
      } else {
        toast.fire({ icon: 'success', title: isCurrentlyBanned ? 'Unbanned' : 'Banned' })
        router.refresh()
      }
      setLoading(false)
    }
  }

  const toggleRole = async () => {
    const newRole = userData.role === "super_admin" ? "user" : "super_admin"
    
    const result = await Swal.fire({
      ...commonAlertOptions,
      title: 'Change Role?',
      text: `Promote/Demote to ${newRole.toUpperCase()}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
    })

    if (result.isConfirmed) {
      setLoading(true)
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userData.id)
      if (error) {
        Swal.fire({ ...commonAlertOptions, title: 'Error', text: error.message, icon: 'error' })
      } else {
        toast.fire({ icon: 'success', title: 'Role Updated' })
        router.refresh()
      }
      setLoading(false)
    }
  }

  return (
    <tr className={`border-b border-stone-100 dark:border-stone-800 transition-colors ${userData.is_banned ? 'bg-red-50/30 dark:bg-red-950/10' : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'}`}>
      <td className="px-6 py-2 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${userData.is_banned ? 'bg-red-400' : 'bg-stone-800'}`}>
            {(userData.full_name || userData.email || "U")[0].toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-sm font-medium truncate max-w-[150px] ${userData.is_banned ? 'text-red-700' : 'text-stone-900 dark:text-white'}`}>
              {userData.full_name || "Anonymous"}
            </span>
            <span className="text-[10px] text-stone-400 truncate max-w-[150px]">{userData.email}</span>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
          userData.role === "super_admin" 
            ? "bg-blue-100 text-blue-600 border border-blue-200" 
            : "bg-stone-100 text-stone-500 border border-stone-200"
        }`}>
          {userData.role}
        </span>
      </td>

      <td className="px-6 py-4 text-center">
         <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
            {userData.articles?.[0]?.count || 0}
         </span>
      </td>

      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${userData.is_banned ? 'text-red-600' : 'text-green-600'}`}>
          <span className={`w-1 h-1 rounded-full ${userData.is_banned ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          {userData.is_banned ? "Restricted" : "Active"}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={toggleRole} disabled={loading} className="text-[10px] font-bold uppercase text-stone-400 hover:text-stone-900 p-2">
            Role
          </button>
          <button
            onClick={handleBanStatusToggle}
            disabled={loading}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              userData.is_banned 
                ? "bg-green-600 text-white" 
                : "bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            {userData.is_banned ? "Unban" : "Ban"}
          </button>
        </div>
      </td>
    </tr>
  )
}