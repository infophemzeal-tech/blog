import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { getSiteMetadata } from "@/lib/metadata"
import ThemeProvider from "@/components/ThemeProvider"
import SearchProvider from "@/components/SearchProvider"
import AuthProvider from "@/components/AuthProvider"
import CookieConsent from "@/components/CookieConsent"
import Footer from "@/components/Footer"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
})

// ✅ Updated GA4 property ID
const GA_ID = "G-HGYRG1B4DJ"
const SITE_URL = "https://nairaly.com"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export async function generateMetadata(): Promise<Metadata> {
  return getSiteMetadata()
}

// ✅ Organization structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nairaly",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-sq.png`,
  description: "A community of curious readers and writers in Nigeria",
  sameAs: [
    "https://twitter.com/nairaly",
    "https://instagram.com/nairaly",
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "NG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: SITE_URL,
  },
}

// ✅ WebSite schema — enables Google Sitelinks Searchbox
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Nairaly",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, "\\u003c"),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body
        className={`${geist.className} bg-white dark:bg-stone-950 transition-colors duration-300 flex flex-col min-h-screen antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SearchProvider>
              <div className="flex-1">{children}</div>
              <CookieConsent />
              <Footer />
            </SearchProvider>
          </AuthProvider>
        </ThemeProvider>

        {/* ✅ GA4 — single property, lazyOnload to not block rendering */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  )
}