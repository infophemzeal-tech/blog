"use client"

import { useState, useEffect } from "react"

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY
      const total =
        document.documentElement.scrollHeight - window.innerHeight

      if (total <= 0) return

      const percentage = Math.min((scrolled / total) * 100, 100)
      setProgress(percentage)
    }

    window.addEventListener("scroll", updateProgress, { passive: true })
    updateProgress()

    return () => window.removeEventListener("scroll", updateProgress)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-0.5 z-50 bg-stone-100 dark:bg-stone-800">
      <div
        className="h-full bg-green-500 dark:bg-green-400 transition-all duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}