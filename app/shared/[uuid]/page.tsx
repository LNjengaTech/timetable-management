// shared/[uuid]/page.tsx

// shared timetable page - for students to view timetable slots

import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function SharedTimetablePage({ params }: { params: { uuid: string } }) {
  const timetable = await prisma.timetable.findUnique({
    where: { id: params.uuid },
    include: {
      homeworks: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!timetable) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8 flex flex-col items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="flex justify-between items-start mb-8 z-10 relative">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">{timetable.subject}</h1>
            <p className="text-brand-400 font-medium">Public Shared View</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-xl text-center border border-gray-700">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Day</p>
            <p className="text-xl font-bold text-white">{timetable.day}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 z-10 relative">
          <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Time</p>
            <p className="text-white font-medium">{timetable.time}</p>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Location</p>
            <p className="text-white font-medium">{timetable.location}</p>
          </div>
          <div className="col-span-2 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Lecturer</p>
            <p className="text-white font-medium">{timetable.lecturer}</p>
          </div>
        </div>

        <div className="z-10 relative">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Course Notes & Homework</h3>
          {timetable.homeworks.length === 0 ? (
            <p className="text-gray-500 italic text-sm">No notes have been published yet.</p>
          ) : (
            <div className="space-y-3">
              {timetable.homeworks.map(hw => (
                <div key={hw.id} className="p-4 bg-gray-800/80 rounded-xl border-l-4 border-brand-500">
                  <h4 className="text-white font-bold">{hw.title}</h4>
                  {hw.description && <p className="text-gray-400 text-sm mt-1">{hw.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center z-10 relative">
          <p className="text-xs text-gray-600 font-medium">Powered by ClassFlow</p>
        </div>
      </div>
    </div>
  )
}
