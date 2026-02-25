// dashboard/admin/page.tsx

// admin dashboard page - for admin users to manage users, adjust roles, and monitor system participants
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminUsersClient from "./AdminUsersClient"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  // Double check server-side for ADMIN role
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white">Admin Tools</h1>
        <p className="text-gray-400 mt-2">Manage users, adjust roles, and monitor system participants.</p>
      </div>

      <AdminUsersClient />
    </div>
  )
}
