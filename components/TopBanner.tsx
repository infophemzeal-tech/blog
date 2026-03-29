import RateTicker from "@/components/RateTicker"

export default function TopBanner() {
  return (
    <header
      role="banner"
      aria-label="Live NGN exchange rates"
    >
      <div className="w-full  bg-green-600 relative overflow-hidden">
        <RateTicker />
      </div>
    </header>
  )
}