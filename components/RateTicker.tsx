"use client"

import { useExchangeRates } from "@/hooks/useExchangeRates"

const pairs = [
  { code: "USD", flag: "🇺🇸", label: "USD/NGN" },
  { code: "GBP", flag: "🇬🇧", label: "GBP/NGN" },
  { code: "EUR", flag: "🇪🇺", label: "EUR/NGN" },
] as const

type RateItemProps = {
  flag: string
  label: string
  value?: number
}

function RateItem({ flag, label, value }: RateItemProps) {
  return (
    // ✅ FIX 9: Reduced padding (px-4 py-1) to fit the new 24px strip height
    <div className="inline-flex items-center gap-1.5 px-4 py-1 border-r border-stone-300 dark:border-stone-700 shrink-0">
      <span className="text-[11px]">{flag}</span>
      {/* ✅ FIX 9: Updated text colors for neutral background */}
      <span className="text-[11px] tracking-wider uppercase text-stone-500 dark:text-stone-400 font-medium">
        {label}
      </span>
      {value ? (
        <span className="text-[11px] font-semibold text-green-700 dark:text-green-500 tracking-wide tabular-nums">
          ₦{value.toLocaleString("en-NG")}
        </span>
      ) : (
        <span className="w-12 h-2.5 rounded-sm bg-stone-200 dark:bg-stone-700 animate-pulse inline-block" />
      )}
    </div>
  )
}

export default function RateTicker() {
  const { rates, error } = useExchangeRates()
  if (error) return null

  return (
    <div className="relative flex items-center overflow-hidden h-full">
      <div className="flex animate-ticker hover:[animation-play-state:paused]">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex">
            {pairs.map((p) => (
              <RateItem
                key={`${p.code}-${i}`}
                flag={p.flag}
                label={p.label}
                value={rates?.[p.code]}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* ✅ FIX 2: Removed the live "Updated HH:MM" timestamp and pulsing dot. 
          It caused layout shifts and continuous JS re-renders. 
          Replaced with a simple gradient fade that matches the new neutral background. */}
      <div className="absolute right-0 top-0 bottom-0 pl-6 pr-2 pointer-events-none bg-gradient-to-l from-stone-100 dark:from-stone-900 via-stone-100/80 dark:via-stone-900/80 to-transparent" />
      
    </div>
  )
}