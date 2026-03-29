import RateTicker from "@/components/RateTicker"

export default function TopBanner() {
  return (
    <header
      role="banner"
      aria-label="Live NGN exchange rates"
      className="h-[38px]" // ✅ fixed height prevents layout shift while rates load
    >
      <div className="w-full h-full bg-green-600 relative overflow-hidden">
        <RateTicker />
      </div>
    </header>
  )
}