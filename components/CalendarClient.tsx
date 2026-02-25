// components/CalenderClient.tsx

// Calendar component for client-side rendering and displaying timetables in a week view

"use client"

import { useMemo } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format } from "date-fns/format"
import { parse } from "date-fns/parse"
import { startOfWeek } from "date-fns/startOfWeek"
import { getDay } from "date-fns/getDay"
import "react-big-calendar/lib/css/react-big-calendar.css"
import type { Timetable } from "@prisma/client"

const locales = {
  "en-US": require("date-fns/locale/en-US"),
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Helper to map DB day string (e.g. "Monday", "08:00") to a real Date object in the current week
function getNextDayOfWeek(dayName: string, timeStr: string) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const targetDayIdx = days.indexOf(dayName)
  
  const now = new Date()
  const todayIdx = now.getDay()
  
  // Calculate offset to the target day in the CURRENT week context
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() - todayIdx + targetDayIdx)
  
  const [hours, minutes] = timeStr.split(':').map(Number)
  targetDate.setHours(hours, minutes, 0, 0)
  
  return targetDate
}

interface CalendarClientProps {
  initialTimetables: Timetable[]
}

export default function CalendarClient({ initialTimetables }: CalendarClientProps) {
  // Convert DB Timetable records to react-big-calendar expected Event objects
  const events = useMemo(() => {
    return initialTimetables.map(t => {
      const start = getNextDayOfWeek(t.day, t.time)
      // Estimate 2 hrs duration for classes
      const end = new Date(start)
      end.setHours(start.getHours() + 2)

      return {
        id: t.id,
        title: `${t.subject} (${t.location})`,
        start,
        end,
        resource: t
      }
    })
  }, [initialTimetables])

  return (
    <div className="h-[650px]">
      <style>{`
        /* Overriding react-big-calendar default styles for dark mode */
        .rbc-calendar { font-family: inherit; color: #fff; }
        .rbc-toolbar button { color: #cbd5e1; }
        .rbc-toolbar button.rbc-active { background-color: #3b82f6; color: white; border-color: #2563eb; }
        .rbc-toolbar button:hover { background-color: #1e293b; }
        .rbc-toolbar button:active, .rbc-toolbar button.rbc-active:hover { background-color: #2563eb; }
        .rbc-header { background-color: #1e293b; border-bottom: 1px solid #334155; padding: 10px 0; font-weight: 600; color: #94a3b8; }
        .rbc-time-view, .rbc-month-view { border: 1px solid #334155; border-radius: 8px; overflow: hidden; }
        .rbc-time-header.rbc-overflowing { border-right: none; }
        .rbc-time-content { border-top: 1px solid #334155; }
        .rbc-day-bg { border-left: 1px solid #334155; }
        .rbc-timeslot-group { border-bottom: 1px solid #334155; }
        .rbc-time-slot { border-top: 1px solid #1e293b; }
        .rbc-time-gutter .rbc-timeslot-group { border-bottom: 1px solid transparent; }
        .rbc-event { background-color: #3b82f6; border-radius: 5px; border: 1px solid #2563eb; padding: 4px; }
        .rbc-event.rbc-selected { background-color: #2563eb; }
        .rbc-allday-cell { display: none; }
        .rbc-current-time-indicator { background-color: #ef4444; }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["work_week", "week", "month"]}
        style={{ height: "100%" }}
        min={new Date(0, 0, 0, 7, 0, 0)} // Start at 7 AM
        max={new Date(0, 0, 0, 19, 0, 0)} // End at 7 PM
        tooltipAccessor={(e) => `${e.title} \nLecturer: ${(e.resource as any).lecturer}`}
      />
    </div>
  )
}
