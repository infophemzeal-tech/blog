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
    <div className="border-b border-stone-200 dark:border-stone-800 flex items-center gap-6">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          className={`py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === tab.value
              ? "border-b-2 border-stone-900 dark:border-white text-stone-900 dark:text-white"
              : "text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}