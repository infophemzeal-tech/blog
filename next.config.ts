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
    optimizePackageImports: [
      "@tailwindcss/typography",
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nairaly.com" }],
        destination: "https://nairaly.com/:path*",
        permanent: true,  // 308
      },
    ]
  },
}

export default nextConfig