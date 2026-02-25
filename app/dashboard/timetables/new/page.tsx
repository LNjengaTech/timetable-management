// dashboard/timetables/new/page.tsx

// new timetable page - for admin and lecturer users to create new timetable slots

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

const timetableSchema = z.object({
  day: z.string().min(1, "Day is required"),
  time: z.string().min(1, "Time is required"),
  subject: z.string().min(1, "Subject is required"),
  location: z.string().min(1, "Location is required"),
  lecturer: z.string().min(1, "Lecturer is required"),
})

type TimetableFormValues = z.infer<typeof timetableSchema>

export default function NewTimetablePage() {
  const router = useRouter()
  const [serverError, setServerError] = useState("")
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      day: "Monday",
      time: "08:00",
    }
  })

  const onSubmit = async (data: TimetableFormValues) => {
    setServerError("")
    
    try {
      const res = await fetch("/api/timetables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        router.push("/dashboard/timetables")
        router.refresh()
      } else {
        const errData = await res.json()
        setServerError(errData.message || "Failed to create timetable slot")
      }
    } catch (error) {
      setServerError("An unexpected error occurred")
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-white text-center">Create Timetable Slot</h1>
      
      {serverError && (
        <div className="p-4 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Day */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Day of the Week</label>
            <select
              {...register("day")}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-white"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            {errors.day && <p className="mt-1 text-sm text-red-400">{errors.day.message}</p>}
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Time</label>
            <input
              type="time"
              {...register("time")}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-white"
            />
            {errors.time && <p className="mt-1 text-sm text-red-400">{errors.time.message}</p>}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
          <input
            type="text"
            placeholder="e.g. Introduction to Computer Science"
            {...register("subject")}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder-gray-500"
          />
          {errors.subject && <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. Room 402, Main Block"
              {...register("location")}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder-gray-500"
            />
            {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>}
          </div>

          {/* Lecturer */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Lecturer</label>
            <input
              type="text"
              placeholder="e.g. Dr. Kamau"
              {...register("lecturer")}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-white placeholder-gray-500"
            />
            {errors.lecturer && <p className="mt-1 text-sm text-red-400">{errors.lecturer.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 mt-4 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg shadow-md transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Create Slot"}
        </button>
      </form>
    </div>
  )
}
