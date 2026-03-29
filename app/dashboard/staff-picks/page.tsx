import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import StaffPicksManager from "@/components/StaffPicksManager"

export default async function StaffPicksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/signin")

  // Guard: only super_admins can access this page
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "super_admin") redirect("/dashboard")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="border-b border-stone-100 dark:border-stone-800 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white font-serif">
          Staff Picks
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Curate up to 3 featured articles shown in the sidebar to all readers.
        </p>
      </div>

      {/* Manager */}
      <div className="max-w-2xl">
        <StaffPicksManager />
      </div>
    </div>
  )
}