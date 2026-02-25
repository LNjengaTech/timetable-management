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

  const timetables = await prisma.timetable.findMany({
    where: { userId: session.user.id },
    orderBy: [
      { day: "asc" },
      { time: "asc" }
    ],
    select: {
      id: true,
      subject: true,
      day: true,
      time: true,
      location: true,
      lecturer: true,
    }
  })

  return <TimetablesClient initialSlots={timetables} />
}
