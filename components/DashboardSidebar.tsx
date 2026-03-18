"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export default function DashboardSidebar({ 
  navItems, 
  userInitial, 
  isSuperAdmin 
}: { 
  navItems: NavItem[], 
  userInitial: string, 
  isSuperAdmin: boolean 
}) {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar Container */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transition-all duration-300 z-50 flex flex-col ${
          isOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Top Branding / Toggle */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className={`font-serif italic text-xl font-bold dark:text-white ${!isOpen && "hidden"}`}>
            Medium
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-500"
          >
            {isOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white" 
                    : "text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800/50"
                } ${item.label === "Admin Console" && "text-blue-600 dark:text-blue-400 font-bold"}`}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {isOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User / Admin Info */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${isSuperAdmin ? 'bg-blue-600' : 'bg-green-600'}`}>
              {userInitial}
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-stone-900 dark:text-white uppercase truncate">Account</p>
                {isSuperAdmin && <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Admin</p>}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Spacing Offset: Adjusts main content automatically based on sidebar state */}
      <div 
        className={`hidden lg:block transition-all duration-300 ${isOpen ? "w-64" : "w-20"}`}
      />
    </>
  )
}