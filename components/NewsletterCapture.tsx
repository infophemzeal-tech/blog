"use client"

import { useState } from "react"

export default function NewsletterCapture() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus("loading")

    try {
      // TODO: Wire this up to your actual email provider!
      // Options: Beehiiv, ConvertKit, Mailchimp, or a custom Next.js API route.
      // Example for a custom route:
      // const res = await fetch("/api/subscribe", { 
      //   method: "POST", 
      //   body: JSON.stringify({ email }) 
      // })
      // if (!res.ok) throw new Error("Failed")

      // Simulating a network request for now
           const res = await fetch("/api/subscribe", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }) 
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to subscribe")
      }
      
      setStatus("success")
      setEmail("")
    } catch (err) {
      setStatus("error")
    }
  }

  // Success state
  if (status === "success") {
    return (
      <div className="my-8 p-6 sm:p-8 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 text-center">
        <p className="text-green-700 dark:text-green-400 font-medium text-base">
          ✅ You&apos;re in! Check your inbox for a welcome email.
        </p>
      </div>
    )
  }

  // Form state
  return (
    <div className="my-8 p-6 sm:p-8 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        
        {/* Copy */}
        <div className="flex-1">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-1">
            Stay sharp on Nigeria
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Get the best stories on money, tech, and culture delivered weekly. No spam, unsubscribe anytime.
          </p>
        </div>
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[220px]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-500">
          Oops! Something went wrong. Please try again.
        </p>
      )}
    </div>
  )
}