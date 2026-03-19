"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

// --- Professional Icon Set ($5000+ Theme Style) ---
const Icons = {
  Stories: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7" />
      <path d="M9 10h6" /><path d="M9 14h6" /><path d="M9 18h3" />
    </svg>
  ),
  Stats: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  Admin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <circle cx="12" cy="11" r="3" />
      <path d="m9 17 3-3 3 3" />
    </svg>
  ),
  Exit: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
};

// Maps labels to icons
const ICON_MAP: Record<string, React.ReactNode> = {
  "Stories": <Icons.Stories />,
  "Stats": <Icons.Stats />,
  "Admin Console": <Icons.Admin />
};

export default function DashboardSidebar({ 
  navItems, 
  userInitial, 
  isSuperAdmin 
}: { 
  navItems: { label: string; href: string }[], 
  userInitial: string, 
  isSuperAdmin: boolean 
}) {
  const pathname = usePathname();

  // Premium background colors for active links
  const activeStyles = isSuperAdmin 
    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
    : "bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-lg shadow-stone-200 dark:shadow-none";

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Hidden on mobile) --- */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white dark:bg-stone-950 border-r border-stone-100 dark:border-stone-900 flex-col z-50">
        {/* Brand Mark */}
        <div className="p-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-9 h-9 bg-stone-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-bold text-xl">G</div>
            <span className="font-serif italic text-2xl font-bold tracking-tight text-stone-900 dark:text-white">GistPadi</span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive ? activeStyles : "text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
                }`}
              >
                <span className={`shrink-0 ${isActive ? "scale-110" : "group-hover:scale-110 transition-transform"}`}>
                  {ICON_MAP[item.label] || <Icons.Stories />}
                </span>
                <span className="text-sm font-semibold tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Identity Section */}
        <div className="p-4 mt-auto">
          <div className="p-4 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-100 dark:border-stone-800 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm ${isSuperAdmin ? 'bg-gradient-to-tr from-blue-600 to-blue-400' : 'bg-gradient-to-tr from-stone-800 to-stone-600'}`}>
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Account</span>
              <span className="text-sm font-bold truncate text-stone-900 dark:text-white">{isSuperAdmin ? "Super Admin" : "Verified Writer"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MOBILE FLOATING BOTTOM NAV (Visible only on mobile) --- */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200/50 dark:border-stone-800/50 rounded-2xl flex items-center justify-around z-50 shadow-2xl overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center flex-1 h-full group">
              <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? (isSuperAdmin ? "bg-blue-600 text-white" : "bg-stone-900 text-white dark:bg-white dark:text-black") 
                  : "text-stone-400"
              }`}>
                {ICON_MAP[item.label] || <Icons.Stories />}
              </div>
            </Link>
          )
        })}
        {/* Static Exit to Home for Mobile */}
        <Link href="/" className="flex flex-col items-center justify-center flex-1 h-full text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors border-l border-stone-100/50 dark:border-stone-800/50">
           <Icons.Exit />
        </Link>
      </nav>
    </>
  )
}