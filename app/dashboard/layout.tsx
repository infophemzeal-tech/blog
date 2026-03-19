import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/DashboardSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/auth/signin")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_banned")
    .eq("id", user.id)
    .single()

  if (profile?.is_banned) redirect("/auth/signin?error=restricted")

  const isSuperAdmin = profile?.role === "super_admin"

  const navItems = [
  { label: "Stories", href: "/dashboard" }, // Labels must match ICON_MAP strings
  { label: "Stats", href: "/dashboard/stats" },
]

if (isSuperAdmin) {
  navItems.push({ label: "Admin Console", href: "/dashboard/admin" })
}

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans">
      {/* 1. Sidebar Component (Handles mobile and desktop internally) */}
      <DashboardSidebar 
        navItems={navItems} 
        userInitial={user.email?.[0].toUpperCase() || "U"}
        isSuperAdmin={isSuperAdmin}
      />

      {/* 2. Main Content Wrapper */}
      {/* lg:pl-64 pushes content to the right on desktop */}
      {/* pb-20 prevents bottom content from being hidden behind mobile nav */}
      <div className="lg:pl-64 min-h-screen flex flex-col transition-all">
        
        {/* Optional: Small Mobile-Only Top Branding Header */}
        <header className="lg:hidden flex items-center justify-between px-6 h-14 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800">
           <span className="font-serif italic font-bold">GistPadi</span>
           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${isSuperAdmin ? 'bg-blue-600' : 'bg-green-600'}`}>
              {user.email?.[0].toUpperCase()}
           </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-10 py-8 pb-24 lg:pb-10">
          {children}
        </main>
      </div>
    </div>
  )
}