"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "./ThemeProvider"
import { useSearch } from "./SearchProvider"
import { useAuth } from "./AuthProvider"
import { createClient } from "@/lib/supabase/client"
import MenuDrawer from "./MenuDrawer"

export default function Navbar() {
  // --- INTERNAL STATE ---
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // --- HOOKS ---
  const { theme, toggleTheme } = useTheme()
  const { setQuery } = useSearch()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // --- ADMIN CHECK ---
  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    const checkAdminStatus = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (data?.role === "super_admin") {
          setIsAdmin(true)
        }
      } catch (err) {
        console.error("Error checking admin status:", err)
      }
    }

    checkAdminStatus()
  }, [user, supabase])

  // --- HANDLERS ---
  const handleChange = (value: string) => {
    setSearch(value)
    setQuery(value) // Updates global feed filter
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearchOpen(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* Mobile Menu Drawer integration */}
      <MenuDrawer 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        isAdmin={isAdmin} 
      />

      <nav className="w-full border-b border-stone-200 dark:border-stone-800 px-4 py-3 sticky top-0 bg-white/90 dark:bg-stone-950/90 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto flex items-center gap-3">

          {/* LEFT: Menu Toggle & Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <Link href="/">
              <span className="font-serif italic text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                Medium
              </span>
            </Link>
          </div>

          {/* CENTER: Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm hidden sm:block ml-4">
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-full px-4 py-2 border border-transparent focus-within:border-stone-200 dark:focus-within:border-stone-700 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-400">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => handleChange(e.target.value)}
                className="bg-transparent text-sm text-stone-700 dark:text-stone-300 outline-none w-full placeholder:text-stone-400"
              />
            </div>
          </form>

          {/* RIGHT: Actions & User */}
          <div className="ml-auto flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              type="button"
              className="sm:hidden text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Admin Link (Desktop Only) */}
                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded"
                  >
                    ADMIN
                  </Link>
                )}

                <Link
                  href="/dashboard/write"
                  className="hidden md:flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Write
                </Link>

                <button
                  onClick={handleSignOut}
                  className="hidden md:block text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Sign out
                </button>

                {/* Avatar with Dynamic Color for Admin */}
                <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm ring-1 ring-white dark:ring-stone-900 ${
                  isAdmin ? 'bg-blue-600 ring-offset-2 ring-blue-100 dark:ring-offset-stone-950' : 'bg-green-600'
                }`}>
                  {user.email?.[0].toUpperCase()}
                  {isAdmin && <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full border border-white dark:border-stone-900 animate-pulse" />}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors hidden md:block"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors shadow-sm"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE: Search Expansion */}
        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="mt-3 sm:hidden animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-full px-4 py-2.5 border border-stone-200 dark:border-stone-700 shadow-inner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-400">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search Medium"
                value={search}
                onChange={(e) => handleChange(e.target.value)}
                className="bg-transparent text-sm text-stone-700 dark:text-stone-300 outline-none w-full placeholder:text-stone-400"
                autoFocus
              />
            </div>
          </form>
        )}
      </nav>
    </>
  )
}