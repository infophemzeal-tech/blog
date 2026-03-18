import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// 1. Define the type where params is a Promise
type Context = {
  params: Promise<{ id: string }>
}
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: Context // 2. Use the context type here
) {
  // 3. Await the params before using 'id'
  const { id } = await context.params
  
  const supabase = await createClient()

  try {
    // Your logic to increment views...
    const { data, error } = await supabase
      .from('articles')
      .select('views_count')
      .eq('id', id)
      .single()

    if (error) throw error

    const { error: updateError } = await supabase
      .from('articles')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}