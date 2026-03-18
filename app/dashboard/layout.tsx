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

  // Define nav items with icons
  const navItems = [
    { label: "Stories", href: "/dashboard", icon: "📄" },
    { label: "Stats", href: "/dashboard/stats", icon: "📊" },
  ]

  if (isSuperAdmin) {
    navItems.push({ label: "Admin Console", href: "/dashboard/admin", icon: "🛡️" })
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans"> 
      {/* Left Fixed Sidebar */}
      <DashboardSidebar 
        navItems={navItems} 
        userInitial={user.email?.[0].toUpperCase() || "U"}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        <header className="h-16 flex items-center justify-between px-8 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm border-b border-stone-100 dark:border-stone-800 sticky top-0 z-30">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
            {isSuperAdmin ? "Super Admin Access" : "Personal Workspace"}
          </p>
          
          <button className="text-xs text-red-500 font-bold hover:underline">
             Sign Out
          </button>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          {children}
        </main>
      </div>
    </div>
  )
}