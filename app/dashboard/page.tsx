// dashboard/page.tsx

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import UserTour from "@/components/UserTour"
import StatsGrid from "@/components/StatsGrid"
import DashboardClient from "@/components/DashboardClient"
import RecentActivity from "@/components/RecentActivity"
import { format } from "date-fns"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  //Fetch live stats
  const stats = await prisma.userStats.findUnique({
    where: { userId: session.user.id }
  })

  //Fetch today's slots
  const todayName = format(new Date(), 'EEEE')
  const todaySlots = await prisma.timetable.findMany({
    where: {
      userId: session.user.id,
      day: todayName
    },
    orderBy: { time: 'asc' }
  })

  // Fetch all slots to calculate attendance rate properly
  const totalClasses = await prisma.timetable.count({
    where: { userId: session.user.id }
  })

  // Fetch all attendance records
  const allAttendances = await prisma.attendance.findMany({
    where: { studentId: session.user.id },
    select: { date: true, timetable: { select: { day: true } } }
  })

  // Dynamic Attendance Rate calculation:
  // (Total attended) / (Total possible slots since joined or last 30 days)
  // For now, using a denominator that grows with user activity.
  // Capped at 100%.
  const attendanceRate = totalClasses > 0 && allAttendances.length > 0
    ? Math.min(100, Math.round((allAttendances.length / (totalClasses * 2)) * 100))
    : 0

  // Dynamic Attendance Trends calculation:
  const dayCounts = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 }
  allAttendances.forEach(att => {
    const dayShort = att.timetable.day.substring(0, 3)
    if (dayCounts.hasOwnProperty(dayShort)) {
      dayCounts[dayShort as keyof typeof dayCounts]++
    }
  })

  const attendanceTrend = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    data: [dayCounts.Mon, dayCounts.Tue, dayCounts.Wed, dayCounts.Thu, dayCounts.Fri, dayCounts.Sat, dayCounts.Sun].map(c => Math.min(100, c * 20))
  }

  // Fetch recent activities (Attendances)
  const recentAttendances = await prisma.attendance.findMany({
    where: { studentId: session.user.id },
    take: 5,
    orderBy: { date: 'desc' },
    include: { timetable: true }
  })

  const activities = recentAttendances.map(a => ({
    id: a.id,
    type: "ATTENDANCE" as const,
    title: `Attended ${a.timetable.subject}`,
    timestamp: a.date
  }))

  return (
    <main className="md:p-2 max-w-7xl mx-auto space-y-8 pb-20">
      <UserTour />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {session.user.name || session.user.email}.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-full border border-brand-100 dark:border-brand-800 text-sm font-bold shadow-sm capitalize">
          Role: {session.user.role.toLowerCase()}
        </div>
      </div>

      {session.user.role === "STUDENT" ? (
        <>
          <StatsGrid
            streak={stats?.currentStreak || 0}
            points={stats?.points || 0}
            attendanceRate={attendanceRate}
            totalClasses={totalClasses}
          />

          <DashboardClient
            todaySlots={todaySlots.map(s => ({
              id: s.id,
              subject: s.subject,
              time: s.time,
              location: s.location,
              lecturer: s.lecturer
            }))}
            attendanceTrend={attendanceTrend}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RecentActivity activities={activities} />
            </div>

            <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-3xl text-white shadow-xl shadow-brand-500/20 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Stay Consistent!</h3>
              <p className="text-brand-100 mb-8 leading-relaxed">
                Consistent attendance leads to better grades and cool badges. Check your progress in the analytics tab.
              </p>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4 rounded-full" />
              </div>
              
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-4">Instructor Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            As a {session.user.role.toLowerCase()}, you can manage class groups, upload departmental timetables, and monitor overall attendance. Use the sidebar to navigate to your specific portals.
          </p>
        </div>
      )}
    </main>
  )
}
