/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,

  // ✅ REMOVE the redirects() block entirely — Vercel handles this
  // ✅ Keep only headers

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
