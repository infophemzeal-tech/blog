import type { Metadata } from "next"
import { Suspense } from "react"
import HomeContent from "@/components/Homecontent"

// ✅ FIX 1: Enable Vercel Edge caching for 5 minutes
export const revalidate = 300

// ─────────────────────────────────────────────────────────────────────────────
// CANONICAL — fixes "Duplicate without user-selected canonical" in GSC.
// ?topic= and ?tab= are UI filters, not distinct indexable pages.
// All query-param variants point back to the bare homepage URL.
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Nairaly — Stories for curious readers and writers",
  description: "Discover deep reads on culture, tech, business, and life in Nigeria and beyond.",
  alternates: {
    // ✅ FIX 4: Removed 'www.' to match the apex domain users actually land on
    canonical: "https://nairaly.com/",
  },
  openGraph: {
    // ✅ FIX 7: Changed from just "Nairaly" to descriptive tagline for better social shares
    title: "Nairaly — Stories for curious readers and writers",
    description: "Discover deep reads on culture, tech, business, and life in Nigeria and beyond.",
    // ✅ FIX 4: Removed 'www.'
    url: "https://nairaly.com/",
    type: "website",
    images: [{ url: "https://nairaly.com/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    // ✅ FIX 7: Changed from just "Nairaly" to descriptive tagline
    title: "Nairaly — Stories for curious readers and writers",
    description: "Discover deep reads on culture, tech, business, and life in Nigeria and beyond.",
    images: ["https://nairaly.com/og-default.jpg"],
  },
}

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