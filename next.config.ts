import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["blog-iaiu5x69m-infophemzeal-techs-projects.vercel.app"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
}

export default nextConfig;