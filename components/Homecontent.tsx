"use client"
import { useTransition, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import TopBanner from "@/components/TopBanner"
import Navbar from "@/components/Navbar"
import Tabs from "@/components/Tabs"
import Feed from "@/components/Feed"
import Sidebar from "@/components/Sidebar"

export default function HomeContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeTopic = searchParams.get("topic") || ""
  const activeTab = (searchParams.get("tab") as "for-you" | "featured") || "for-you"

  const updateFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [searchParams, pathname, router]
  )

  return (
    <main className="max-w-5xl mx-auto pb-12">
      <TopBanner />
      <Navbar />

      <div
        className={`flex gap-12 px-4 mt-8 transition-opacity duration-300 ${
          isPending ? "opacity-70" : "opacity-100"
        }`}
      >
        <div className="flex-1 min-w-0">
          
          {/* ✅ FIX 7: Visible H1 instead of sr-only. Gives clear value prop and SEO keyword weight */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight mb-6">
            {activeTopic
              ? activeTopic.replace(/-/g, " ")
              : "Sharp reads on Nigeria"}
            {!activeTopic && (
              <span className="block text-base sm:text-lg font-normal text-stone-500 dark:text-stone-400 mt-1 tracking-normal font-sans">
                Money, tech, culture & life
              </span>
            )}
          </h1>

          <Tabs
            activeTab={activeTab}
            onTabChange={(tab) => updateFilters({ tab })}
          />

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

        <div className="w-72 shrink-0 hidden lg:block">
          <div className="pt-6 pl-8 border-l border-stone-100 dark:border-stone-800 sticky top-24">
                        <Sidebar
              activeTopic={activeTopic}
            />
          </div>
        </div>
      </div>
    </main>
  )
}