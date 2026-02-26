// dashboard/timetables/page.tsx

// timetable page - for admin and lecturer users to view and manage timetable slots visually

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import TimetablesClient from "./TimetablesClient"

export default async function TimetablesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const timetablesRaw = await prisma.timetable.findMany({
    where: { userId: session.user.id },
    include: {
      attendances: {
        where: {
          studentId: session.user.id,
          date: { gte: today }
        }
      }
    },
    orderBy: [
      { day: "asc" },
      { time: "asc" }
    ],
  })

  const timetables = timetablesRaw.map(t => ({
    id: t.id,
    subject: t.subject,
    day: t.day,
    time: t.time,
    location: t.location,
    lecturer: t.lecturer,
    isAttendedToday: t.attendances.length > 0
  }))

  return <TimetablesClient initialSlots={timetables} />
}
