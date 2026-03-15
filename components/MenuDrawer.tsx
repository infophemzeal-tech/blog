"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "./AuthProvider"

type Props = {
  isOpen: boolean
  onClose: () => void
}

const FOLLOWING = [
  { label: "Satoshi App", initial: "S", color: "bg-orange-500" },
  { label: "Orbital7", initial: "O", color: "bg-stone-800" },
]

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
)

const LibraryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
)

const ProfileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const StoriesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
  </svg>
)

const StatsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
)

const WriteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const FollowingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
)

const SignOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function MenuDrawer({ isOpen, onClose }: Props) {
  const { user } = useAuth()
  const router = useRouter()

  const handleWriteClick = () => {
    onClose()
    if (user) {
      router.push("/dashboard/write")
    } else {
      router.push("/auth/signin?next=/dashboard/write")
    }
  }

  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    await supabase.auth.signOut()
    onClose()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-56 bg-white dark:bg-stone-950 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-6 flex flex-col gap-4">

          {/* Main nav */}
          <div className="flex flex-col">
            {[
              { label: "Home", href: "/", icon: <HomeIcon /> },
              { label: "Library", href: user ? "/dashboard" : "/auth/signin", icon: <LibraryIcon /> },
              { label: "Profile", href: user ? "/dashboard" : "/auth/signin", icon: <ProfileIcon /> },
              { label: "Stories", href: user ? "/dashboard" : "/auth/signin", icon: <StoriesIcon /> },
              { label: "Stats", href: user ? "/dashboard/stats" : "/auth/signin", icon: <StatsIcon /> },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors group"
              >
                <span className="shrink-0 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  {item.label}
                </span>
              </Link>
            ))}

            {/* Write button */}
            <button
              onClick={handleWriteClick}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors group w-full text-left"
            >
              <span className="shrink-0 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                <WriteIcon />
              </span>
              <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                Write
              </span>
            </button>

            {/* Dashboard — only if logged in */}
            {user && (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors group"
              >
                <span className="shrink-0 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                  <DashboardIcon />
                </span>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  Dashboard
                </span>
              </Link>
            )}
          </div>

          <div className="border-t border-stone-100 dark:border-stone-800 mx-2" />

          {/* Auth section */}
          {user ? (
            <div className="flex flex-col gap-0.5">

              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="text-sm text-stone-600 dark:text-stone-400 truncate">
                  {user.email}
                </span>
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer w-full text-left group"
              >
                <span className="shrink-0 text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                  <SignOutIcon />
                </span>
                <span className="text-sm text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                  Sign out
                </span>
              </button>

            </div>
          ) : (
            <div className="flex flex-col gap-2 px-3">
              <Link
                href="/auth/signin"
                onClick={onClose}
                className="w-full py-2 rounded-full border border-stone-200 dark:border-stone-700 text-sm text-stone-700 dark:text-stone-300 hover:border-stone-400 transition-colors text-center"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                onClick={onClose}
                className="w-full py-2 rounded-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-medium hover:bg-stone-700 dark:hover:bg-stone-200 transition-colors text-center"
              >
                Get started
              </Link>
            </div>
          )}

          <div className="border-t border-stone-100 dark:border-stone-800 mx-2" />

          {/* Following section — only if logged in */}
          {user && (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="shrink-0 text-stone-400 dark:text-stone-500">
                  <FollowingIcon />
                </span>
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200">
                  Following
                </span>
              </div>

              {FOLLOWING.map((person) => (
                <button
                  key={person.label}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer w-full text-left group"
                >
                  <div className={`w-5 h-5 rounded-full ${person.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {person.initial}
                  </div>
                  <span className="text-sm text-stone-600 dark:text-stone-400 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                    {person.label}
                  </span>
                </button>
              ))}

              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer w-full text-left group">
                <span className="shrink-0 text-stone-400 dark:text-stone-500 group-hover:text-stone-700 dark:group-hover:text-white transition-colors">
                  <PlusIcon />
                </span>
                <span className="text-sm text-stone-500 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-white transition-colors leading-tight">
                  Find writers to follow
                </span>
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  )
}