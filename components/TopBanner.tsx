"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./AuthProvider" // Ensure the path to your AuthProvider is correct
import Link from "next/link"

export default function TopBanner() {
  const { user, loading } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // 1. Check if the user is logged in
    // 2. Check if they have already dismissed this banner in the past (KISS approach)
    const isDismissed = localStorage.getItem("top-banner-dismissed")
    
    if (!loading && !user && !isDismissed) {
      setVisible(true)
    }
  }, [user, loading])

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem("top-banner-dismissed", "true")
  }

  // Don't show anything if user is logged in, still loading auth, or dismissed
  if (!visible || user || loading) return null

  return (
    <div className="w-full bg-amber-50 dark:bg-stone-900 border-b border-amber-200 dark:border-stone-700 px-4 py-2 flex items-center justify-center text-sm relative animate-in fade-in slide-in-from-top-4 duration-500">
      <span className="mr-2 hidden sm:inline">⭐</span>
      <p className="text-stone-700 dark:text-stone-300 text-center text-[11px] sm:text-sm font-sans">
        Get unlimited access to the best of Medium for less than $1/week.{" "}
        <Link href="/auth/signup" className="underline font-bold text-stone-900 dark:text-white">
          Become a member
        </Link>
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-3 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer p-1"
        aria-label="Dismiss banner"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  )
}