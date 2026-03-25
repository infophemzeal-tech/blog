import type { Metadata } from "next"
import { Geist } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import ThemeProvider from "@/components/ThemeProvider"
import SearchProvider from "@/components/SearchProvider"
import AuthProvider from "@/components/AuthProvider"
import CookieConsent from "@/components/CookieConsent"
import Footer from "@/components/Footer"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Nairaly",
  description: "A community of curious readers and writers",
  verification: {
    google: "kD-Fi3De8UKlsdFvfEdJVjXyi7vg6bww64EC3qFOkPE",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HGYRG1B4DJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HGYRG1B4DJ');
          `}
        </Script>
      </head>
      <body className={`${geist.className} bg-white dark:bg-stone-950 transition-colors duration-300 flex flex-col min-h-screen`}>
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
      </body>
    </html>
  )
}