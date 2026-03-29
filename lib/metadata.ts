import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

export async function getSiteMetadata(): Promise<Metadata> {
  const supabase = await createClient() // ✅ was missing await

  const { data, error } = await supabase
    .from("site_metadata")
    .select("*")
    .single()

  if (error || !data) {
    return {
      title: {
        default: "Nairaly — Nigerian Community of Readers & Writers",
        template: "%s | Nairaly",
      },
      description:
        "Discover insightful articles on tech, remote jobs, security, culture, and Nigerian perspectives.",
    }
  }

  return {
    metadataBase: new URL("https://nairaly.com"),
    title: {
      default: data.title,
      template: "%s | Nairaly",
    },
    description:    data.description,
    keywords:       data.keywords,
    openGraph: {
      type:        "website",
      url:         "https://nairaly.com",
      siteName:    "Nairaly",
      locale:      "en_NG",
      title:       data.og_title       ?? data.title,
      description: data.og_description ?? data.description,
      images: [{ url: data.og_image ?? "/og-default.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card:        "summary_large_image",
      site:        "@nairaly",
      title:       data.twitter_title       ?? data.title,
      description: data.twitter_description ?? data.description,
      images:      [data.og_image ?? "/og-default.jpg"],
    },
    robots: {
      index:  true,
      follow: true,
      googleBot: {
        index:               true,
        follow:              true,
        "max-image-preview": "large",
        "max-snippet":       -1,
      },
    },
    verification: {
      google: "kD-Fi3De8UKlsdFvfEdJVjXyi7vg6bww64EC3qFOkPE",
    },
  }
}