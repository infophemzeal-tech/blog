"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

type Props = {
  articleId: string
}

export default function ViewTracker({ articleId }: Props) {
  useEffect(() => {
    const key = `viewed_${articleId}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, "1")
    supabase.rpc("increment_views", { article_id: articleId })
  }, [articleId])

  return null
}