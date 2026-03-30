// app/layout.tsx (or RootLayout)
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

const organizationSchema = { /* ... */ }
const websiteSchema = { /* ... */ }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* canonical */}
        <link rel="canonical" href={SITE_URL} />

        {/* Structured data */}
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

      {/* mobile-first base text size: text-sm on phones, text-base on sm+ */}
      <body
        className={`${geist.className} text-sm sm:text-base bg-white dark:bg-stone-950 transition-colors duration-300 flex flex-col min-h-screen antialiased`}
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

        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
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