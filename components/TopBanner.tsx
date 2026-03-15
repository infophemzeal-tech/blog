"use client"

import { useState } from "react"

export default function TopBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="w-full bg-amber-50 dark:bg-stone-900 border-b border-amber-200 dark:border-stone-700 px-4 py-2 flex items-center justify-center text-sm relative">
      <span className="mr-2 hidden sm:inline">⭐</span>
      <p className="text-stone-700 dark:text-stone-300 text-center text-xs sm:text-sm">
        Get unlimited access to the best of Medium for less than $1/week.{" "}
        <a href="#" className="underline font-medium text-stone-900 dark:text-white">
          Become a member
        </a>
      </p>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-white transition-colors cursor-pointer text-xs sm:text-sm"
      >
        ✕
      </button>
    </div>
  )
}