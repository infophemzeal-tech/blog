import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import UserRow from "@/components/UserRow"
import CreateTopicModal from "@/components/CreateTopicModal"
export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Strict check to keep non-admins out
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single()

  if (profile?.role !== "super_admin") {
    redirect("/dashboard")
  }


  // Fetch all users + their article counts
  // This uses a subquery technique supported by Supabase to get counts
  const { data: users } = await supabase
    .from("profiles")
    .select(`*, articles(count)`)
    .order("created_at", { ascending: false })

 

  return (
   <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-white">Admin Console</h1>
          <p className="text-sm text-stone-500">Manage platform data, users, and topics.</p>
        </div>
        
        {/* ADD THIS BUTTON HERE */}
        <div className="flex gap-3">
           <CreateTopicModal />
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 text-[11px] uppercase tracking-widest font-bold text-stone-400">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Stories</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {users?.map((userData) => (
              <UserRow key={userData.id} userData={userData} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}