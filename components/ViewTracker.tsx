"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ViewTracker({ articleId }: { articleId: number | string }) {
  const hasTracked = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    // 1. Prevent double-counting in Development mode or fast-clicking
    if (hasTracked.current) return;

    // Inside components/ViewTracker.tsx
const recordView = async () => {
  try {
    await supabase.rpc('increment_views', { 
        target_article_id: Number(articleId) // Must match the SQL parameter name exactly
    });
    hasTracked.current = true;
  } catch (err) {
    console.error("Analytics Error:", err);
  }
};

    // We delay the track by 1 second to ensure it's a real read, not a bot/accident
    const timer = setTimeout(recordView, 1000);
    
    return () => clearTimeout(timer);
  }, [articleId, supabase]);

  return null; // Stays invisible
}