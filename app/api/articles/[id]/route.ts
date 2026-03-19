import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Next.js 15 strictly requires the second argument (context) 
 * to have params as a Promise.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Await the params Promise (Critical for Next.js 15)
  const { id } = await params
  
  const supabase = await createClient()

  try {
    // Logic to increment views_count
    const { data: currentArticle, error: fetchError } = await supabase
      .from('articles')
      .select('views_count')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { error: updateError } = await supabase
      .from('articles')
      .update({ views_count: (currentArticle?.views_count || 0) + 1 })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("API Route Error:", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Ensure this route is always treated as dynamic
export const dynamic = "force-dynamic"