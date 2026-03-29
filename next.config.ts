import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "blog-iaiu5x69m-infophemzeal-techs-projects.vercel.app"
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

  async redirects() {
    return [
      // ✅ www → non-www (canonical domain)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.nairaly.com' }],
        destination: 'https://nairaly.com/:path*',
        permanent: true, // 301
      },
    ]
  },
}

export default nextConfig;