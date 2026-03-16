"use client"

import { useEffect } from "react"

interface ViewTrackerProps {
  articleId: string
  slug: string
}

export function ViewTracker({ articleId, slug }: ViewTrackerProps) {
  useEffect(() => {
    // Increment view count when article loads
    const incrementViews = async () => {
      try {
        // Add a small delay to ensure the user is actually reading
        const timer = setTimeout(async () => {
          const response = await fetch(`/api/articles/${articleId}/increment-views`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) {
            console.error("Failed to increment views")
          }
        }, 2000) // Wait 2 seconds before counting as a view

        return () => clearTimeout(timer)
      } catch (error) {
        console.error("Error tracking view:", error)
      }
    }

    incrementViews()
  }, [articleId])

  // This component doesn't render anything
  return null
}