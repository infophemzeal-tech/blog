import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const url = req.nextUrl

  // Example: redirect any ?topic=... query back to root
  if (url.searchParams.has("topic")) {
    url.searchParams.delete("topic") // strip query
    url.pathname = "/"               // force root path
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

// Apply middleware to all routes
export const config = {
  matcher: ["/:path*"],
}