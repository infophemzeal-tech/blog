import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/signin")

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">

      {/* Dashboard navbar */}
      <nav className="w-full bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <Link href="/">
            <span className="font-serif italic text-xl font-bold text-stone-900 dark:text-white">
              Medium
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {[
              { label: "Stories", href: "/dashboard" },
              { label: "Stats", href: "/dashboard/stats" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/write"
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Write
          </Link>
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-medium">
            {user.email?.[0].toUpperCase()}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {children}
      </div>

    </div>
  )
}