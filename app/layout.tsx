import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import ThemeProvider from "@/components/ThemeProvider"
import SearchProvider from "@/components/SearchProvider"
import AuthProvider from "@/components/AuthProvider"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Medium Clone",
  description: "A Medium clone built with Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} bg-white dark:bg-stone-950 transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <SearchProvider>
              {children}
            </SearchProvider>
          </AuthProvider>
        </ThemeProvider>
      
      </body>
    </html>
  )
}