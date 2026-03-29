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

  // ✅ No redirects here — let Vercel handle www → non-www
}

export default nextConfig