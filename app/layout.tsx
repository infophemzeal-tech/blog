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

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-HGYRG1B4DJ"
const SITE_URL = "https://www.nairaly.com"

// ─── Viewport ────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

// ─── Metadata ────────────────────────────────────────────────────────────────
export async function generateMetadata(): Promise<Metadata> {
  const base = await getSiteMetadata()
  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    // No canonical here — each page declares its own.
    // A layout-level canonical would stamp "/" on every route.
  }
}

// ─── Structured Data ─────────────────────────────────────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nairaly",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo-sq.png`,
    width: 512,
    height: 512,
  },
  sameAs: [
    "https://twitter.com/nairaly",
    "https://www.linkedin.com/company/nairaly",
  ],
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Nairaly",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Structured Data — XSS-safe */}
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
        className={[
          geist.variable,
          "font-sans",
          "text-sm sm:text-base",
          "bg-white dark:bg-stone-950",
          "transition-colors duration-300",
          "flex flex-col min-h-screen",
          "antialiased",
        ].join(" ")}
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

        {/* GA outside providers — correct, doesn't need React context */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  )
}