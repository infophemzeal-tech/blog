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
    <div className="inline-flex items-center gap-2.5 px-8 py-2.5 border-r border-white/[0.08] shrink-0 group cursor-default">
      <span className=" text-white/90 font-mono group-hover:text-green-900 transition-colors">{flag}</span>
      <span className="text-[12px] tracking-[0.12em] uppercase text-white/90 font-mono group-hover:text-green-600 transition-colors">
        {label}
      </span>
      <div className="w-px h-2.5 bg-white/15" />
      {value ? (
        <span className="text-[13px] font-medium text-[#a8e063] tracking-[0.04em] font-mono tabular-nums group-hover:text-green-600 transition-colors">
          ₦{value.toLocaleString("en-NG")}
        </span>
      ) : (
        <span className="w-16 h-3 rounded-sm bg-white/[0.07] animate-pulse inline-block" />
      )}
    </div>
  )
}

export default function RateTicker() {
  const { rates, error } = useExchangeRates()
  if (error) return null

  return (
    <div className="relative flex items-center overflow-hidden">
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
            <span className="inline-flex items-center px-5 text-white/20 text-base border-r border-white/[0.08]">
              ·
            </span>
          </div>
        ))}
      </div>
  {/* ✅ fade color matches bg-[#13760a] */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center pl-12 pr-4 pointer-events-none bg-gradient-to-l from-[#13760a] via-[#13760a]/80 to-transparent">
        <span className="w-1.5 h-1.5 rounded-full bg-[#a8e063] animate-pulse mr-1.5" />
        <span className="text-[12px] tracking-[0.14em] uppercase text-white/90 font-mono">
          {rates ? `Updated ${rates.updatedAt}` : "Live"}
        </span>
      </div>
      
    </div>
  )
}