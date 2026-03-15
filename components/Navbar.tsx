"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "./ThemeProvider"
import { useSearch } from "./SearchProvider"
import { useAuth } from "./AuthProvider"
import { createClient } from "@/lib/supabase/client"
import MenuDrawer from "./MenuDrawer"

export default function Navbar() {
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { setQuery } = useSearch()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (value: string) => {
    setSearch(value)
    setQuery(value)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearchOpen(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <nav className="w-full border-b border-stone-200 dark:border-stone-800 px-4 py-3">
        <div className="flex items-center gap-3">

          {/* Left */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            </button>
            <Link href="/">
              <span className="font-serif italic text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                Medium
              </span>
            </Link>
          </div>

          {/* Center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden sm:block">
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-full px-4 py-2">
              <button type="submit" className="text-stone-400 cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => handleChange(e.target.value)}
                className="bg-transparent text-sm text-stone-700 dark:text-stone-300 outline-none w-full placeholder:text-stone-400"
              />
            </div>
          </form>

          {/* Right */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">

            <button
              type="button"
              className="sm:hidden text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            <button
              onClick={toggleTheme}
              className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>

            {user ? (
              <>
                <Link
  href={user ? "/dashboard/write" : "/auth/signin?next=/dashboard/write"}
  className="hidden md:flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
  Write
</Link>
                <button
                  onClick={handleSignOut}
                  className="hidden md:block text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Sign out
                </button>
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium cursor-pointer shrink-0">
                  {user.email?.[0].toUpperCase()}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors hidden md:block"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="mt-3 sm:hidden">
            <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 rounded-full px-4 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-stone-400">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search"
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