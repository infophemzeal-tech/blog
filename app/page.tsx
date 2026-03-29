"use client"

import { useTransition, useCallback, Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

import TopBanner from "@/components/TopBanner"
import Navbar from "@/components/Navbar"
import Tabs from "@/components/Tabs"
import Feed from "@/components/Feed"
import Sidebar from "@/components/Sidebar"

/**
 * HOME CONTENT - Client Component
 * Handles all filtering logic using URL params
 */
function HomeContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()

  // Derive current filters from URL
  const activeTopic = searchParams.get("topic") || ""
  const activeTab = (searchParams.get("tab") as "for-you" | "featured") || "for-you"

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    // Update URL without full page reload
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, pathname, router])

  return (
    <main className="max-w-5xl mx-auto pb-12">
      <TopBanner />
      <Navbar />

      <div className={`flex gap-12 px-4 mt-8 transition-opacity duration-300 ${isPending ? 'opacity-70' : 'opacity-100'}`}>

        {/* Main Feed Section */}
        <div className="flex-1 min-w-0">
          <Tabs
            activeTab={activeTab}
            onTabChange={(tab) => updateFilters({ tab })}
          />

          {/* Active Topic Filter Indicator */}
          {activeTopic && (
            <div className="flex items-center gap-3 py-4">
              <span className="text-sm text-stone-500 dark:text-stone-400">
                Showing articles for:
              </span>
              <span className="px-4 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium capitalize">
                {activeTopic.replace(/-/g, " ")}
              </span>
              <button
                onClick={() => updateFilters({ topic: null })}
                className="ml-2 text-xs text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium"
              >
                Clear filter ✕
              </button>
            </div>
          )}

          <Feed activeTab={activeTab} activeTopic={activeTopic} />
        </div>

        {/* Sidebar - Desktop Only */}
        <div className="w-72 shrink-0 hidden lg:block">
          <div className="pt-6 pl-8 border-l border-stone-100 dark:border-stone-800 sticky top-24">
            <Sidebar
              activeTopic={activeTopic}
              onTopicChange={(slug) => updateFilters({ topic: slug })}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

/**
 * Root Home Page with Suspense Boundary
 * Required for useSearchParams() in Next.js App Router
 */
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-stone-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-stone-200 dark:border-stone-700 border-t-green-600 rounded-full animate-spin" />
            <p className="text-sm text-stone-500 dark:text-stone-400">Loading your feed...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}