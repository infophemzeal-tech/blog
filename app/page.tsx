"use client"

import { useTransition, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import TopBanner from "@/components/TopBanner"
import Navbar from "@/components/Navbar"
import Tabs from "@/components/Tabs"
import Feed from "@/components/Feed"
import Sidebar from "@/components/Sidebar"

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Derive all state from URL for consistency
  const activeTopic = searchParams.get("topic") || ""
  const activeTab = (searchParams.get("tab") as "for-you" | "featured") || "for-you"

  const updateFilters = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })

    // startTransition keeps the UI responsive while the router navigates
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }, [searchParams, pathname, router])

  return (
    <main className="max-w-5xl mx-auto">
      <TopBanner />
      <Navbar />

      <div className={`flex gap-12 px-4 mt-8 transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'}`}>
        
        {/* Left — feed */}
        <div className="flex-1 min-w-0">
          <Tabs 
            activeTab={activeTab} 
            onTabChange={(tab) => updateFilters({ tab })} 
          />
          
          {activeTopic && (
            <div className="flex items-center gap-2 py-3">
              <span className="text-sm text-stone-500 dark:text-stone-400">
                Filtering by:
              </span>
              <span className="px-3 py-1 rounded-full bg-green-600 text-white text-sm font-medium capitalize">
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
        <div className="w-72 shrink-0 hidden lg:block">
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