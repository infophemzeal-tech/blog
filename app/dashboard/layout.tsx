export const dynamic = "force-dynamic";

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/DashboardSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Check Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/signin")

  // 2. Fetch detailed profile info (Role & Ban Status)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_banned")
    .eq("id", user.id)
    .single()

  // 3. Security: Kick out banned users
  if (profile?.is_banned) {
    redirect("/auth/signin?error=restricted")
  }

  const isSuperAdmin = profile?.role === "super_admin"

  // 4. Define navItems - Labels match ICON_MAP in DashboardSidebar
  const navItems = [
    { label: "Stories", href: "/dashboard" },
    { label: "Stats", href: "/dashboard/stats" },
  ]

  if (isSuperAdmin) {
    navItems.push({ label: "Admin Console", href: "/dashboard/admin" })
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans selection:bg-stone-200 dark:selection:bg-stone-800">
      
      {/* SIDEBAR/BOTTOM NAV (Logic handled internally) */}
      <DashboardSidebar 
        navItems={navItems} 
        userInitial={user.email?.[0].toUpperCase() || "U"}
        isSuperAdmin={isSuperAdmin}
      />

      {/* CONTENT AREA WRAPPER */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        
        {/* MOBILE TOP BAR (Logo & Branding Only) */}
        <header className="lg:hidden flex items-center justify-between px-6 h-16 bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 sticky top-0 z-30 shadow-sm">
           <span className="font-serif italic font-extrabold text-xl tracking-tight dark:text-white">
             GistPadi
           </span>
           
           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white dark:ring-stone-800 ${
             isSuperAdmin ? 'bg-blue-600' : 'bg-green-600'
           }`}>
              {user.email?.[0].toUpperCase()}
           </div>
        </header>

        {/* MAIN PAGE SLOTS */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-12 py-8 pb-32 lg:pb-12">
          {/* Subtle Page Breadcrumb (Optional/KISS) */}
          <div className="mb-8 hidden lg:block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Workspace / {isSuperAdmin ? 'Platform Management' : 'Creator Portal'}
            </span>
          </div>

          {children}
        </main>

      </div>
    </div>
  )
}