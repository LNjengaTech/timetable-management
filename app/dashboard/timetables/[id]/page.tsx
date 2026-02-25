// dashboard/timetables/[id]/page.tsx

// timetable view page - for admin and lecturer users to view and manage timetable slots visually

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import TimetableViewClient from "./TimetableViewClient"

export default async function TimetableViewPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  const timetable = await prisma.timetable.findUnique({
    where: { id: params.id },
    include: {
      attendances: {
        include: {
          student: {
            select: { name: true, email: true }
          }
        },
        orderBy: { date: 'desc' }
      },
      homeworks: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!timetable) {
    notFound()
  }

  // Pass down data to a Client Component for interactivity (QR / Buttons)
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">{timetable.subject}</h1>
        <div className="text-gray-400 mb-8 space-x-4 flex flex-wrap gap-y-2">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            {timetable.day} at {timetable.time}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {timetable.location}
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Lecturer: {timetable.lecturer}
          </span>
        </div>

        <TimetableViewClient 
          timetableId={timetable.id} 
          role={session.user.role} 
          userId={session.user.id}
          attendances={timetable.attendances as any[]}
        />
      </div>
    </div>
  )
}
