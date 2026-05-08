import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.rpc("increment_view", {
      article_slug: slug,
    })

    if (error) {
      console.error("increment_view error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("increment-views route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}