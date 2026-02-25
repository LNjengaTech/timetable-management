// dashboard/admin/AdminUsersClient.tsx

// admin users client component - for fetching and displaying all users in the database and allowing the admin to update their roles and delete them
"use client"

import { useEffect, useState } from "react"

export default function AdminUsersClient() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Are you sure you want to change this user to ${newRole}?`)) return
    
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      })
      if (res.ok) fetchUsers()
      else alert("Failed to update role")
    } catch {
      alert("An error occurred")
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm("WARNING: This will permanently delete the user and all their data. Proceed?")) return

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE"
      })
      if (res.ok) fetchUsers()
      else alert("Failed to delete user")
    } catch {
      alert("An error occurred")
    }
  }

  if (loading) return <div className="text-gray-400 p-8 text-center animate-pulse">Loading users...</div>

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-gray-400 text-xs uppercase tracking-widest">
              <th className="p-4 rounded-tl-xl border-b border-gray-700">Name</th>
              <th className="p-4 border-b border-gray-700">Email</th>
              <th className="p-4 border-b border-gray-700">Joined Date</th>
              <th className="p-4 border-b border-gray-700">Role</th>
              <th className="p-4 rounded-tr-xl border-b border-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-750 transition-colors">
                <td className="p-4 text-white font-medium">{u.name || "N/A"}</td>
                <td className="p-4 text-gray-300 text-sm">{u.email}</td>
                <td className="p-4 text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <select 
                    value={u.role} 
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-gray-900 border border-gray-600 text-white text-xs rounded-lg p-1.5 focus:border-brand-500 outline-none"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="LECTURER">Lecturer</option>
                    <option value="STUDENT">Student</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(u.id)}
                    className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors px-3 py-1 border border-red-500/30 rounded-lg hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
