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
  weight: ["400", "500", "600", "700"]
})



export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

export async function generateMetadata() {
  return getSiteMetadata()
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HGYRG1B4DJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HGYRG1B4DJ', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        {/* Optional: Google Site Verification (already in metadata) */}
      </head>

      <body 
        className={`${geist.className} bg-white dark:bg-stone-950 transition-colors duration-300 flex flex-col min-h-screen antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SearchProvider>
              <div className="flex-1">
                {children}
              </div>
              <CookieConsent />
              <Footer />
            </SearchProvider>
          </AuthProvider>
        </ThemeProvider>

        {/* Organization Structured Data - Helps with brand SEO */}
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Nairaly",
              url: "https://nairaly.com",
              logo: "https://nairaly.com/logo-sq.png",
              description: "A community of curious readers and writers in Nigeria",
              sameAs: [
                // Add your social media links here if available
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
              }
            })
          }}
        />
      </body>
    </html>
  )
}