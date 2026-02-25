// dashboard/calendar/page.tsx

// calendar page - for admin and lecturer users to view and manage timetable slots visually
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import CalendarClient from "@/components/CalendarClient"

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const timetables = await prisma.timetable.findMany()

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Interactive Calendar</h1>
        <p className="text-gray-400 mt-2">Manage and view timetable slots visually (Drag and Drop coming soon).</p>
      </div>
      
      <div className="bg-gray-800 p-6 border border-gray-700 rounded-2xl shadow-xl overflow-hidden min-h-[700px]">
        {/* Pass server-side fetched timetables as initial data */}
        <CalendarClient initialTimetables={timetables} />
      </div>
    </div>
  )
}
