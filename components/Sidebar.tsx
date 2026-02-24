"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { Menu, X, Home, Calendar as CalendarIcon, PieChart, Settings, Users, LogOut, Sun, Moon, Table } from "lucide-react"
import clsx from "clsx"

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false) // Desktop collapse state
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)
   useEffect(() => {
    setMounted(true)
  },[])

  const role = session?.user?.role

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: Home, show: true },
    { name: "Manage Slots", href: "/dashboard/timetables", icon: Table, show: true },
    { name: "Interactive Calendar", href: "/dashboard/calendar", icon: CalendarIcon, show: true },
    { name: "Analytics", href: "/dashboard/analytics", icon: PieChart, show: ["ADMIN", "LECTURER"].includes(role || "") },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, show: true },
  ]

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 z-40">
        <h2 className="text-xl font-bold text-brand-600 dark:text-brand-500">ClassFlow</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={clsx(
        "fixed md:sticky top-0 left-0 z-50 h-[100dvh] flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!isCollapsed && <h2 className="text-2xl font-extrabold text-brand-600 dark:text-brand-500 tracking-tight shrink-0">ClassFlow</h2>}
          <div className={clsx("flex items-center", isCollapsed ? "mx-auto" : "")}>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => item.show ? (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={clsx(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group",
                pathname === item.href 
                  ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                isCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
              {isCollapsed && <span className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">{item.name}</span>}
            </Link>
          ) : null)}

          {role === "ADMIN" && (
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard/admin"
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-transparent dark:border-red-500/20 transition-colors group",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Users className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Admin Portal</span>}
                {isCollapsed && <span className="absolute left-full ml-4 px-2 py-1 bg-red-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">Admin Portal</span>}
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-4">
          <div className={clsx("flex items-center gap-3", isCollapsed && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center shrink-0">
              <span className="text-brand-700 dark:text-brand-300 font-bold text-sm">
                {session?.user?.name?.charAt(0) || "U"}
              </span>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{session?.user?.name}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{role}</p>
              </div>
            )}
          </div>

          <div className={clsx("flex items-center", isCollapsed ? "flex-col gap-2" : "justify-between")}>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {mounted ? (
                theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
              ) : (
                <div className="w-5 h-5" /> //Placeholder to prevent layout shift
              )}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={clsx(
                "flex items-center gap-2 p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors",
                isCollapsed && "justify-center"
              )}
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm font-medium">Log out</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
