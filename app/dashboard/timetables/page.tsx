import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function TimetablesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const timetables = await prisma.timetable.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { day: 'desc' },
      { time: 'asc' }
    ]
  })

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Timetables</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/timetables/new"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
          >
            + Manual Entry
          </Link>
          <Link
            href="/dashboard/timetables/upload"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-medium rounded-lg transition-colors shadow-sm text-sm"
          >
            Upload PDF/Image
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timetables.map((slot) => (
          <div key={slot.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-brand-900/50 text-brand-300 text-xs font-semibold rounded-full border border-brand-800 object-contain">
                {slot.day} - {slot.time}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">{slot.subject}</h3>
            
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {slot.location}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {slot.lecturer}
              </div>
            </div>
          </div>
        ))}

        {timetables.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-gray-800/50 border border-gray-800 rounded-xl border-dashed">
            No timetable slots found. 
            {["ADMIN", "LECTURER"].includes(session.user.role) && " Create one to get started."}
          </div>
        )}
      </div>
    </div>
  )
}
