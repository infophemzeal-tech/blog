"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

type Props = {
  articleId: string
}

export default function ViewTracker({ articleId }: Props) {
  useEffect(() => {
    const track = async () => {
      const key = `viewed_${articleId}`
      if (sessionStorage.getItem(key)) {
        console.log("⛔ Already viewed:", articleId)
        return
      }

      console.log("👁 Tracking view for:", articleId)
      sessionStorage.setItem(key, "1")

      const { error } = await supabase.rpc("increment_views", { article_id: articleId })

      if (error) {
        console.error("❌ View tracking error:", error.message)
      } else {
        console.log("✅ View tracked successfully!")
      }
    }

    track()
  }, [articleId])

  return null
}