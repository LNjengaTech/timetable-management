// dashboard/analytics/page.tsx

// analytics dashboard page - for admin and lecturer users to monitor attendance trends and system metrics across all classes
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AnalyticsDashboardClient from "./AnalyticsDashboardClient"

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LECTURER")) {
    redirect("/dashboard")
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-gray-400 mt-2">Monitor attendance trends and system metrics across all classes.</p>
      </div>

      <AnalyticsDashboardClient />
    </div>
  )
}
