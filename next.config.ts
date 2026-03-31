/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,

  // keep allowed dev origins
  allowedDevOrigins: [
    "blog-iaiu5x69m-infophemzeal-techs-projects.vercel.app",
  ],

  // allow Supabase storage hosts used for article images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "xixxbdgvcgmdkvahcffz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // alternative: uncomment to use a simple allowlist
    // domains: ["xixxbdgvcgmdkvahcffz.supabase.co"],
  },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@tailwindcss/typography"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
async redirects() {
  return [
    {
      // Matches any article slug ending in a 6-character base-36 suffix
      source: "/article/:slug([a-z0-9-]+)-([a-z0-9]{6})",
      destination: "/article/:slug",
      permanent: true,
    },
  ]
},
  // security headers only (redirects removed — handled at the platform edge)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig