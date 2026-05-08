import RateTicker from "@/components/RateTicker"

export default function TopBanner() {
  return (
    <div
      // ✅ FIX 9: Removed role="banner" — this is an auxiliary ticker, not the main site header.
      // Using role="banner" confuses screen readers about the page structure.
      aria-label="Live NGN exchange rates"
      // ✅ FIX 2 & 9: Reduced height from 38px to 24px to stop pushing LCP below the fold
      className="h-[24px]"
    >
      {/* ✅ FIX 9: Changed from bg-green-600 (which competed with your green logo) 
          to a neutral background so it reads as a utility strip, not a fintech billboard */}
      <div className="w-full h-full bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 relative overflow-hidden">
        <RateTicker />
      </div>
    </div>
  )
}