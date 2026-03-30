import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "blog-iaiu5x69m-infophemzeal-techs-projects.vercel.app",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
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
      // ✅ Force www → non-www
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nairaly.com" }],
        destination: "https://nairaly.com/:path*",
        permanent: true,
      },

      // ✅ Strip ?topic=... → root
      {
        source: "/",
        has: [{ type: "query", key: "topic" }],
        destination: "/",
        permanent: true,
      },

      // ✅ (Optional) strip ALL query strings → clean canonical
      {
        source: "/:path*",
        has: [{ type: "query", key: ":path*" }],
        destination: "/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig