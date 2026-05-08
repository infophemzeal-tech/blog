"use client"

import { useEffect } from "react"

interface ViewTrackerProps {
  articleId: string
}

export function ViewTracker({ articleId }: ViewTrackerProps) {
  useEffect(() => {
    const controller = new AbortController()

    const timer = setTimeout(() => {
      if (document.visibilityState !== "visible") return

      fetch(`/api/articles/${articleId}/increment-views`, {
        method: "POST",
        signal: controller.signal,
      }).catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error tracking view:", err)
        }
      })
    }, 2000)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [articleId])

  return null
}