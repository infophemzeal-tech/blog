import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

const SITE_URL = "https://nairaly.com"
const GOOGLE_VERIFICATION = "kD-Fi3De8UKlsdFvfEdJVjXyi7vg6bww64EC3qFOkPE"

// Shared base — always applied regardless of Supabase success/failure
const baseMetadata: Partial<Metadata> = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/", // resolves to https://nairaly.com/
  },
  verification: {
    google: GOOGLE_VERIFICATION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

// Fallback used when Supabase is unavailable
const fallbackMetadata: Metadata = {
  ...baseMetadata,
  title: {
    default: "Nairaly — Nigerian Community of Readers & Writers",
    template: "%s | Nairaly",
  },
  description:
    "Discover insightful articles on tech, remote jobs, security, culture, and Nigerian perspectives.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Nairaly",
    title: "Nairaly — Nigerian Community of Readers & Writers",
    description:
      "Discover insightful articles on tech, remote jobs, security, culture, and Nigerian perspectives.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nairaly",
    title: "Nairaly — Nigerian Community of Readers & Writers",
    description:
      "Discover insightful articles on tech, remote jobs, security, culture, and Nigerian perspectives.",
    images: ["/og-default.jpg"],
  },
}

export async function getSiteMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("site_metadata")
      .select("*")
      .single()

    if (error || !data) {
      console.warn("[getSiteMetadata] Supabase returned no data, using fallback")
      return fallbackMetadata
    }

    const ogImage = data.og_image ?? "/og-default.jpg"

    return {
      ...baseMetadata,
      title: {
        default: data.title,
        template: "%s | Nairaly",
      },
      description: data.description,
      keywords: data.keywords,
      openGraph: {
        type: "website",
        url: SITE_URL,
        siteName: "Nairaly",
        // ✅ removed en_NG — not a standard OG locale
        title: data.og_title ?? data.title,
        description: data.og_description ?? data.description,
        images: [{ url: ogImage, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        site: "@nairaly",
        title: data.twitter_title ?? data.title,
        description: data.twitter_description ?? data.description,
        images: [ogImage],
      },
    }
  } catch (err) {
    console.error("[getSiteMetadata] Unexpected error, using fallback:", err)
    return fallbackMetadata
  }
}