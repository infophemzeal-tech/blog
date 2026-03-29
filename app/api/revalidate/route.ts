import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get("path") ?? "/"
  revalidatePath(path)
  return NextResponse.json({ revalidated: true })
}