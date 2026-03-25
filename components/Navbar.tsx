"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useTheme } from "./ThemeProvider"
import { useSearch } from "./SearchProvider"
import { useAuth } from "./AuthProvider"
import { createClient } from "@/lib/supabase/client"
import MenuDrawer from "./MenuDrawer"

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h18M3 6h12M3 18h9" />
  </svg>
)

const WriteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
)

const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
)

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export default function Navbar() {
  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userInitial, setUserInitial] = useState("")

  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const desktopSearchRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  const { theme, toggleTheme } = useTheme()
  const { setQuery } = useSearch()
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Guard navigation wipes from erasing typed input when entering a genuine "/search" routing parameter view
  useEffect(() => {
    if (!pathname.startsWith("/search")) {
      setSearchOpen(false)
      setSearch("")
      setQuery("")
    }
  }, [pathname, setQuery])

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => mobileSearchRef.current?.focus(), 50)
    }
  }, [searchOpen])

  useEffect(() => {
    let mounted = true

    if (!user) {
      setIsAdmin(false)
      setUserInitial("")
      return
    }

    setUserInitial(user.email?.[0]?.toUpperCase() ?? "U")
    
    const checkAdmin = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single()
          
        if (mounted) {
          if (data?.role === "super_admin") setIsAdmin(true)
          if (data?.full_name) setUserInitial(data.full_name[0].toUpperCase())
        }
      } catch (err) {
        console.error("Admin check failed:", err)
      }
    }
    checkAdmin()

    return () => {
      mounted = false
    }
  }, [user, supabase])

  // Responsive Shortcut Focus Handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // isContentEditable checks editable states for span elements aside regular inputs
      const activeTag = (e.target as HTMLElement).tagName
      const isEditable = (e.target as HTMLElement).isContentEditable

      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(activeTag) && !isEditable) {
        e.preventDefault()

        // Responsive toggling behavior for focuses on Desktop viewport screens:
        if (window.innerWidth >= 640) { // SM and upwards Tailwind scope breakpoint
          desktopSearchRef.current?.focus()
        } else {
          setSearchOpen(true)
        }
      }

      if (e.key === "Escape") {
        setSearchOpen(false)
        setSearch("")
        setQuery("")
        desktopSearchRef.current?.blur()
        mobileSearchRef.current?.blur()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setQuery])

  const handleChange = useCallback((value: string) => {
    setSearch(value)
    setQuery(value)
  }, [setQuery])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearchOpen(false)
      setSearch("")
      setQuery("")
    }
  }, [search, router, setQuery])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    setIsAdmin(false)
    router.push("/")
    router.refresh()
  }, [supabase, router])

  const clearSearch = useCallback(() => {
    setSearch("")
    setQuery("")
    if (window.innerWidth >= 640) {
      desktopSearchRef.current?.focus()
    } else {
      mobileSearchRef.current?.focus()
    }
  }, [setQuery])

  return (
    <>
      <MenuDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} isAdmin={isAdmin} />

      <nav className={`
        w-full sticky top-0 z-40 px-4 py-3
        bg-white/95 dark:bg-stone-950/95
        backdrop-blur-md
        border-b border-stone-200 dark:border-stone-800
        transition-shadow duration-200
        ${scrolled ? "shadow-[0_1px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_16px_rgba(0,0,0,0.4)]" : ""}
      `}>
        <div className="max-w-7xl mx-auto flex items-center gap-3">

          {/* LEFT: Menu + Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="p-1.5 -ml-1.5 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-150"
            >
              <MenuIcon />
            </button>
            <Link href="/" className="group">
              <span className="font-serif italic text-[1.4rem] font-bold tracking-tight text-green-600 dark:text-white group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors duration-150">
                Nairaly
              </span>
            </Link>
          </div>

          {/* CENTER: Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xs hidden sm:block ml-3">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-stone-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                ref={desktopSearchRef}
                type="text"
                placeholder="Search Nairaly"
                value={search}
                onChange={(e) => handleChange(e.target.value)}
                className="
                  w-full pl-9 pr-10 py-2 rounded-full text-sm
                  bg-stone-100 dark:bg-stone-800
                  text-stone-700 dark:text-stone-200
                  placeholder:text-stone-400 dark:placeholder:text-stone-500
                  border border-transparent
                  focus:outline-none focus:border-stone-300 dark:focus:border-stone-600
                  focus:bg-white dark:focus:bg-stone-900
                  transition-all duration-200
                "
              />
              {search ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  <XIcon />
                </button>
              ) : (
                <kbd className="absolute right-3 hidden lg:flex items-center justify-center text-[10px] font-medium text-stone-400 dark:text-stone-500 bg-stone-200 dark:bg-stone-700 rounded px-1.5 py-0.5 pointer-events-none">
                  /
                </kbd>
              )}
            </div>
          </form>

          {/* RIGHT: Actions */}
          <div className="ml-auto flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Mobile search toggle */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
              className="sm:hidden p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all"
            >
              <SearchIcon />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-150"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <>
                {isAdmin && (
                  <Link
                    href="/dashboard/admin"
                    className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800"
                  >
                    ⚡ ADMIN
                  </Link>
                )}

                <Link
                  href="/dashboard/write"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-150"
                >
                  <WriteIcon />
                  Write
                </Link>

                <button
                  onClick={handleSignOut}
                  className="hidden md:block px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Sign out
                </button>

                <div
                  title={user.email || ""}
                  className={`
                    relative w-8 h-8 rounded-full
                    flex items-center justify-center
                    text-white text-[11px] font-bold
                    shrink-0 cursor-default select-none shadow-sm
                    ring-2 ring-white dark:ring-stone-900
                    ${isAdmin
                      ? "bg-blue-600 ring-offset-1 ring-offset-blue-100 dark:ring-offset-stone-950"
                      : "bg-gradient-to-br from-green-500 to-emerald-700"
                    }
                  `}
                >
                  {userInitial}
                  {isAdmin && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full border-[1.5px] border-white dark:border-stone-900 animate-pulse" />
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="hidden md:block px-3 py-1.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-1.5 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-semibold hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white transition-colors duration-200 shadow-sm"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* MOBILE: Expandable Search */}
        {searchOpen && (
          <div className="mt-2.5 sm:hidden">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-400 pointer-events-none">
                  <SearchIcon />
                </span>
                <input
                  ref={mobileSearchRef}
                  type="text"
                  placeholder="Search Nairaly..."
                  value={search}
                  onChange={(e) => handleChange(e.target.value)}
                  className="
                    w-full pl-9 pr-10 py-2.5 rounded-xl text-sm
                    bg-stone-100 dark:bg-stone-800
                    text-stone-800 dark:text-stone-200
                    placeholder:text-stone-400 dark:placeholder:text-stone-500
                    border border-stone-200 dark:border-stone-700
                    focus:outline-none focus:border-green-400 dark:focus:border-green-600
                    focus:bg-white dark:focus:bg-stone-900
                    transition-all duration-200
                  "
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </nav>
    </>
  )
}