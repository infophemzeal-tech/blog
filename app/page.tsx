"use client"

import { useTransition, useCallback, Suspense } from "react" // 1. Added Suspense import
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import TopBanner from "@/components/TopBanner"
import Navbar from "@/components/Navbar"
import Tabs from "@/components/Tabs"
import Feed from "@/components/Feed"
import Sidebar from "@/components/Sidebar"

/**
 * HOME CONTENT
 * This component handles all the logic and UI.
 * It is called inside a Suspense boundary below.
 */
function HomeContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Derive state from URL
  const activeTopic = searchParams.get("topic") || ""
  const activeTab = (searchParams.get("tab") as "for-you" | "featured") || "for-you"

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, pathname, router])

  return (
    <main className="max-w-5xl mx-auto">
      <TopBanner />
      <Navbar />

      <div className={`flex gap-12 px-4 mt-8 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        
        {/* Left — feed */}
        <div className="flex-1 min-w-0">
          <Tabs 
            activeTab={activeTab} 
            onTabChange={(tab) => updateFilters({ tab })} 
          />
          
          {activeTopic && (
            <div className="flex items-center gap-2 py-3">
              <span className="text-sm text-stone-500 dark:text-stone-400 font-sans">
                Filtering by:
              </span>
              <span className="px-3 py-1 rounded-full bg-green-600 text-white text-[11px] font-bold uppercase tracking-tight">
                {activeTopic.replace(/-/g, " ")}
              </span>
              <button
                onClick={() => updateFilters({ topic: null })}
                className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors cursor-pointer"
              >
                ✕ Clear
              </button>
            </div>
          )}
          
          <Feed activeTab={activeTab} activeTopic={activeTopic} />
        </div>

        {/* Right — sidebar */}
        <div className="w-72 shrink-0 hidden lg:block font-sans">
          <div className="pt-6 pl-8 border-l border-stone-100 dark:border-stone-800">
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
 * DEFAULT EXPORT
 * Next.js requires any page using useSearchParams to be wrapped in Suspense.
 * This ensures the build finishes correctly.
 */
export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-stone-950">
        <div className="w-6 h-6 border-2 border-stone-200 border-t-stone-800 dark:border-t-white rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}