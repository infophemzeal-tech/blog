"use client"

import { useState } from "react"
import TopBanner from "@/components/TopBanner"
import Navbar from "@/components/Navbar"
import Tabs from "@/components/Tabs"
import Feed from "@/components/Feed"
import Sidebar from "@/components/Sidebar"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"for-you" | "featured">("for-you")

  return (
    <main className="max-w-5xl mx-auto">
      <TopBanner />
      <Navbar />

      <div className="flex gap-12 px-4 mt-8">

        {/* Left — feed */}
        <div className="flex-1 min-w-0">
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
          <Feed activeTab={activeTab} />
        </div>

        {/* Right — sidebar */}
        <div className="w-72 shrink-0 hidden lg:block">
          <div className="pt-6 pl-8 border-l border-stone-100 dark:border-stone-800">
            <Sidebar />
          </div>
        </div>

      </div>
    </main>
  )
}