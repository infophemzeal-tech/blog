import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const articleId = params.id

    // Increment views count
    const { data, error } = await supabase
      .from("articles")
      .update({ views_count: supabase.rpc("increment", { x: 1 }) })
      .eq("id", articleId)
      .select()
      .single()

    // Alternative simpler approach (if rpc not available):
    const { data: article, error: fetchError } = await supabase
      .from("articles")
      .select("views_count")
      .eq("id", articleId)
      .single()

    if (fetchError || !article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      )
    }

    const { error: updateError } = await supabase
      .from("articles")
      .update({ views_count: (article.views_count || 0) + 1 })
      .eq("id", articleId)

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update views" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, newViews: (article.views_count || 0) + 1 })
  } catch (error) {
    console.error("Error incrementing views:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}