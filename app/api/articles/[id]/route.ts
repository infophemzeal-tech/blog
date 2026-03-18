import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Define the exact type expected by Next.js 15
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext // Accessing via a context object
) {
  // 1. You MUST await the params before using them
  const { id } = await context.params;

  const supabase = await createClient();

  try {
    // Logic to increment views (Example)
    const { data: currentData, error: fetchError } = await supabase
      .from("articles")
      .select("views_count")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from("articles")
      .update({ views_count: (currentData?.views_count || 0) + 1 })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("View tracking error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}