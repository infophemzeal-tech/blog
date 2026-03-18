import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import ThemeProvider from "@/components/ThemeProvider"
import SearchProvider from "@/components/SearchProvider"
import AuthProvider from "@/components/AuthProvider"
import CookieConsent from "@/components/CookieConsent"
import Footer from "@/components/Footer"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GistPadi",
  description: "A community of curious readers and writers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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