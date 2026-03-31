import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// ─── BUG FIX 1 ────────────────────────────────────────────────────────────────
// Original had NO route lists at all. Every request ran auth logic but nothing
// was ever done with the result — so protected pages never redirected, and
// public pages (including Googlebot's crawl targets) could accidentally 403/404
// if a downstream layout threw for unauthenticated users.
// ─────────────────────────────────────────────────────────────────────────────
const PROTECTED_ROUTES = [
  "/dashboard",
  "/account",
  "/settings",
  "/profile",
  "/api/private",
]

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
]

export async function middleware(request: NextRequest) {
  // ─── BUG FIX 2 ──────────────────────────────────────────────────────────────
  // Original re-assigned supabaseResponse inside setAll but the outer variable
  // was also re-created with NextResponse.next({ request }) — that's correct
  // per Supabase docs. Keeping this pattern as-is; it's needed so cookie
  // mutations from setAll are preserved on the final response object.
  // ─────────────────────────────────────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Step 1: write cookies onto the *request* so the rest of the
          // middleware pipeline sees them
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Step 2: create a fresh response so it inherits the mutated request
          supabaseResponse = NextResponse.next({ request })
          // Step 3: also write cookies onto the *response* so the browser
          // receives them
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ─── BUG FIX 3 ──────────────────────────────────────────────────────────────
  // Original called getUser() but threw away the return value entirely.
  // That means: (a) no routing decisions were possible, (b) Googlebot and any
  // unauthenticated visitor would fall through to whatever the page/layout
  // decided — often a hard redirect or a thrown error → 4xx in Search Console.
  // ─────────────────────────────────────────────────────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // ─── BUG FIX 4 ──────────────────────────────────────────────────────────────
  // Guard 1: unauthenticated user on a protected route.
  // Only routes in PROTECTED_ROUTES redirect to /login.
  // Everything else (homepage, blog, pricing, etc.) passes through untouched —
  // Googlebot is always unauthenticated, so public routes must NEVER redirect.
  // ─────────────────────────────────────────────────────────────────────────────
  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    // Preserve the destination so after login the user lands back here
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ─── BUG FIX 5 ──────────────────────────────────────────────────────────────
  // Guard 2: authenticated user hitting a login/signup page.
  // Without this, a logged-in user who manually types /login gets a flash of
  // the auth form before the page redirect hits. Belt-and-suspenders.
  // ─────────────────────────────────────────────────────────────────────────────
  if (user && isAuthRoute) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = "/dashboard"
    return NextResponse.redirect(dashboardUrl)
  }

  // All other requests — public routes, API routes not in the list, static
  // assets that slipped past the matcher — pass through with cookies intact.
  return supabaseResponse
}

export const config = {
  matcher: [
    // ─── NOTE ────────────────────────────────────────────────────────────────
    // This regex is correct and unchanged. It skips:
    //   _next/static  — JS/CSS chunks
    //   _next/image   — Next.js image optimisation endpoint
    //   favicon.ico   — browser auto-request
    //   *.svg/png/jpg/jpeg/gif/webp — all image assets
    // Everything else (pages, API routes, RSC payloads) runs through middleware.
    // ─────────────────────────────────────────────────────────────────────────
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}