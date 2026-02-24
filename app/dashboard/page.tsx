import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import GamificationWidget from "@/components/GamificationWidget"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-brand-400">Welcome, {session.user.name || session.user.email}</h2>
        <p className="text-gray-300 mb-2">Role: <span className="px-2 py-1 bg-brand-900 text-brand-100 rounded text-sm font-medium">{session.user.role}</span></p>
        <p className="text-gray-400">
          This is your central hub for timetable management and attendance tracking.
        </p>
      </div>

      {session.user.role === "STUDENT" && <GamificationWidget />}
    </main>
  )
}
