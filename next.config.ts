import type { NextConfig } from "next"

const nextConfig = {
  compress: true,
  swcMinify: true,

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nairaly.com" }],
        destination: "https://nairaly.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "Nairaly.com" }],
        destination: "https://nairaly.com/:path*",
        permanent: true,
      },
    ]
  },

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