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

// PERF: display:swap prevents invisible text during font load —
// users see fallback font immediately, Geist swaps in once loaded.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* SEO: Organization structured data belongs in <head> so crawlers
            see it on first parse — not deferred via afterInteractive */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Nairaly",
              url: "https://nairaly.com",
              logo: "https://nairaly.com/logo-sq.png",
              description: "A community of curious readers and writers in Nigeria",
              sameAs: [
                // "https://twitter.com/nairaly",
                // "https://instagram.com/nairaly",
              ],
              address: {
                "@type": "PostalAddress",
                addressCountry: "NG",
              },
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                url: "https://nairaly.com",
              },
            }).replace(/</g, "\\u003c"),
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

        {/* PERF: GA loaded with lazyOnload — fires after everything else is
            done, so it never competes with LCP or TTI. afterInteractive still
            runs during hydration and can delay interactivity on slow devices. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HGYRG1B4DJ"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HGYRG1B4DJ', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  )
}