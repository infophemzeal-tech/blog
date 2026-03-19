import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Next.js 15+ requires `params` to be a Promise.
 * Always `await` context.params before using route parameters.
 */

// GET handler: fetch article by id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST handler: increment views_count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    const { data: currentArticle, error: fetchError } = await supabase
      .from("articles")
      .select("views_count")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from("articles")
      .update({ views_count: (currentArticle?.views_count || 0) + 1 })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Route Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT handler: update article fields
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { error } = await supabase
    .from("articles")
    .update(body)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE handler: remove article by id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Ensure this route is always treated as dynamic
export const dynamic = "force-dynamic";
