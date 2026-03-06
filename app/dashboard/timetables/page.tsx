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
    className: (t as any).className,
    isAttendedToday: t.attendances.length > 0
  }))

  // Fetch note counts per timetable slot (own notes only for the badge)
  const timetableIds = timetables.map(t => t.id)
  const noteCountsRaw = await prisma.note.groupBy({
    by: ["timetableId"],
    where: { timetableId: { in: timetableIds } },
    _count: { id: true },
  })
  const noteCounts: Record<string, number> = {}
  for (const row of noteCountsRaw) {
    noteCounts[row.timetableId] = row._count.id
  }

  return <TimetablesClient initialSlots={timetables} noteCounts={noteCounts} />
}
