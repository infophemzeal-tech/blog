import { createClient } from "@/lib/supabase/server"
import type { Metadata } from "next"

const SITE_URL = "https://nairaly.com"
const GOOGLE_VERIFICATION = "kD-Fi3De8UKlsdFvfEdJVjXyi7vg6bww64EC3qFOkPE"
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg` // ✅ FIX 2: absolute URL, not relative

// ✅ FIX 1: canonical REMOVED from baseMetadata entirely.
// This was the root cause of the conflict reported in the SEO audit:
// every page inheriting this metadata was getting canonical: "/" injected,
// overriding the self-referencing canonical set in generateMetadata()
// on individual pages. Each page must set its own canonical.
// The homepage (app/page.tsx) sets alternates: { canonical: SITE_URL } itself.
const baseMetadata: Partial<Metadata> = {
  metadataBase: new URL(SITE_URL),
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

const FALLBACK_TITLE = "Nairaly — Nigerian Community of Readers & Writers"
const FALLBACK_DESCRIPTION =
  "Discover insightful articles on tech, remote jobs, security, culture, and Nigerian perspectives."

const fallbackMetadata: Metadata = {
  ...baseMetadata,
  title: {
    default: FALLBACK_TITLE,
    template: "%s | Nairaly",
  },
  description: FALLBACK_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Nairaly",
    title: FALLBACK_TITLE,
    description: FALLBACK_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        // ✅ FIX 4: alt text on OG images — used by LinkedIn, Slack, and
        // Google when rendering link previews for screen reader users
        alt: "Nairaly — Nigerian Community of Readers & Writers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nairaly",
    title: FALLBACK_TITLE,
    description: FALLBACK_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
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

    const ogImage = data.og_image
      ? `${SITE_URL}${data.og_image.startsWith("/") ? "" : "/"}${data.og_image}`
      : DEFAULT_OG_IMAGE

    const title = data.title ?? FALLBACK_TITLE
    const description = data.description ?? FALLBACK_DESCRIPTION

    return {
      ...baseMetadata,
      title: {
        default: title,
        template: "%s | Nairaly",
      },
      description,
      // ✅ FIX 3: keywords guarded — if null/undefined, key is omitted entirely
      // rather than passing null into the metadata object
      ...(data.keywords ? { keywords: data.keywords } : {}),
      openGraph: {
        type: "website",
        url: SITE_URL,
        siteName: "Nairaly",
        title: data.og_title ?? title,
        description: data.og_description ?? description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            // ✅ FIX 4: alt on dynamic OG image too
            alt: data.og_title ?? title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@nairaly",
        title: data.twitter_title ?? title,
        description: data.twitter_description ?? description,
        images: [ogImage],
      },
    }
  } catch (err) {
    console.error("[getSiteMetadata] Unexpected error, using fallback:", err)
    return fallbackMetadata
  }
}