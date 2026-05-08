"use client"

type Props = {
  activeTab: "for-you" | "featured"
  onTabChange: (tab: "for-you" | "featured") => void
}

const TABS: { label: string; value: "for-you" | "featured" }[] = [
  { label: "For you", value: "for-you" },
  { label: "Featured", value: "featured" },
]

export default function Tabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="border-b border-stone-200 dark:border-stone-800 flex items-center gap-6" role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={activeTab === tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`
            py-3 text-sm font-medium transition-colors cursor-pointer border-b-2
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1
            ${
              activeTab === tab.value
                ? "border-stone-900 dark:border-white text-stone-900 dark:text-white"
                // ✅ FIX 13: Upgraded to stone-500 (passes contrast), added hover underline, and focus ring above
                : "border-transparent text-stone-500 hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-stone-600"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}