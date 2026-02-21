import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col hidden md:flex min-h-screen sticky top-0">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-extrabold text-brand-500 tracking-tight">ClassFlow</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            Overview
          </Link>
          <Link href="/dashboard/timetables" className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            Manage Slots
          </Link>
          <Link href="/dashboard/calendar" className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
            Interactive Calendar
          </Link>
          {session?.user?.role && ["ADMIN", "LECTURER"].includes(session.user.role) && (
            <Link href="/dashboard/analytics" className="block px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
              Analytics
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/dashboard/admin" className="block px-4 py-3 rounded-lg bg-red-900/20 text-red-100 hover:bg-red-900/40 border border-red-500/20 transition-colors mt-8">
              Admin Portal
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <p className="text-sm font-medium">{session?.user?.name}</p>
          <p className="text-xs text-brand-400 font-semibold mt-1">{session?.user?.role}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <header className="md:hidden bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-brand-500">ClassFlow</h2>
        </header>
        {children}
      </main>
    </div>
  )
}
