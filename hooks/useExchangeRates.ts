import { useEffect, useState } from "react"

export type ExchangeRates = {
  USD: number
  GBP: number
  EUR: number
  updatedAt: string
}

type State = {
  rates: ExchangeRates | null
  loading: boolean
  error: string | null
}

// Free tier — no API key, NGN as base, updates daily
const API_URL =
  "https://open.er-api.com/v6/latest/NGN"

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function useExchangeRates(): State {
  const [state, setState] = useState<State>({
    rates: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function fetch_rates() {
      try {
        const res = await fetch(API_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()

        if (json.result !== "success")
          throw new Error(json["error-type"] ?? "Unknown API error")

        // API returns NGN-based rates, so 1 NGN = x USD
        // We want the inverse: 1 USD = x NGN
        const inv = (code: string) =>
          Math.round(1 / json.rates[code])

        if (!cancelled) {
          setState({
            rates: {
              USD: inv("USD"),
              GBP: inv("GBP"),
              EUR: inv("EUR"),
              updatedAt: formatTime(json.time_last_update_utc),
            },
            loading: false,
            error: null,
          })
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            rates: null,
            loading: false,
            error: err instanceof Error ? err.message : "Failed to fetch rates",
          })
        }
      }
    }

    fetch_rates()

    // Refresh every 60 minutes
    const interval = setInterval(fetch_rates, 60 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return state
}