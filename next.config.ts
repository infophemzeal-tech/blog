/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  // ── BUG FIX 1 ────────────────────────────────────────────────────────────
  // swcMinify is the default in Next.js 13+ and a no-op in 14+.
  // Keeping it causes a deprecation warning in newer Next versions. Remove it.
  // ─────────────────────────────────────────────────────────────────────────

  allowedDevOrigins: [
    "blog-iaiu5x69m-infophemzeal-techs-projects.vercel.app",
  ],

  images: {
    remotePatterns: [
      // ── BUG FIX 2 ──────────────────────────────────────────────────────────
      // The wildcard **.supabase.co pattern is too broad — it allows ANY
      // subdomain on supabase.co including attacker-controlled project URLs.
      // Remove it and keep only your specific project hostname.
      // ───────────────────────────────────────────────────────────────────────
      {
        protocol: "https",
        hostname: "xixxbdgvcgmdkvahcffz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // ── BUG FIX 3 ────────────────────────────────────────────────────────────
    // No image format config. Next.js will serve JPEG/PNG by default.
    // Explicitly enable AVIF + WebP so the Image component serves modern
    // formats to browsers that support them — meaningful bandwidth saving
    // for a media-heavy site like Nairaly.
    // ─────────────────────────────────────────────────────────────────────────
    formats: ["image/avif", "image/webp"],
    // ── BUG FIX 4 ────────────────────────────────────────────────────────────
    // Default deviceSizes skews toward Western screen widths. These cover
    // the full range including low-end Android phones common in Nigeria.
    // ─────────────────────────────────────────────────────────────────────────
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200, 1920],
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "@tailwindcss/typography",
      // ── BUG FIX 5 ──────────────────────────────────────────────────────────
      // If you use lucide-react or date-fns anywhere, add them here.
      // These are large packages that benefit significantly from tree-shaking
      // at the import level — omitting them bloats your JS bundles.
      // ───────────────────────────────────────────────────────────────────────
      // "lucide-react",
      // "date-fns",
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }  // ── BUG FIX 6: keep error + warn in prod logs
      : false,
  },

  async redirects() {
    return [
      // ── BUG FIX 7 ──────────────────────────────────────────────────────────
      // www → apex redirect was missing (covered in our last fix).
      // Adding it here alongside the slug redirect.
      // ───────────────────────────────────────────────────────────────────────
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nairaly.com" }],
        destination: "https://nairaly.com/:path*",
        permanent: true,
      },
      {
        // ── BUG FIX 8 ────────────────────────────────────────────────────────
        // Original regex (:slug([a-z0-9-]+)-([a-z0-9]{6})) has a problem:
        // the greedy match on :slug will eat into the suffix, meaning slugs
        // with hyphens can mis-match and leave the suffix in the destination.
        // Use a non-greedy group and anchor the suffix with a word boundary.
        // ─────────────────────────────────────────────────────────────────────
        source: "/article/:slug([a-z0-9]+(?:-[a-z0-9]+)*)-:suffix([a-z0-9]{6})",
        destination: "/article/:slug",
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      // ── BUG FIX 9 ────────────────────────────────────────────────────────
      // Cache-Control was completely missing from headers() — this is the
      // core issue you raised. Adding the full strategy here.
      // ─────────────────────────────────────────────────────────────────────
      {
        source: "/auth/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/article/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/author/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
          // ── Security headers (kept from original) ───────────────────────
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // ── BUG FIX 10: missing security headers ────────────────────────
          // Referrer-Policy was absent — browsers default to sending full
          // URLs as referrer, leaking article slugs and auth paths to
          // third-party scripts (analytics, embeds).
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions-Policy locks off features you're not using.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

module.exports = nextConfig