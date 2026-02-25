// dashboard/timetables/edit/[id]/page.tsx

// edit timetable page - for admin and lecturer users to edit timetable slots

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowLeft, Loader2 } from "lucide-react"

const schema = z.object({
    day: z.string().min(1, "Day is required"),
    time: z.string().min(1, "Time is required"),
    subject: z.string().min(1, "Subject is required"),
    location: z.string().min(1, "Location is required"),
    lecturer: z.string().min(1, "Lecturer is required"),
})

type FormValues = z.infer<typeof schema>

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function EditTimetablePage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const [loading, setLoading] = useState(true)
    const [serverError, setServerError] = useState("")

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) })

    useEffect(() => {
        async function fetchSlot() {
            try {
                const res = await fetch(`/api/timetables/${params.id}`)
                if (!res.ok) throw new Error("Slot not found")
                const data = await res.json()
                reset(data)
            } catch {
                setServerError("Could not load this slot.")
            } finally {
                setLoading(false)
            }
        }
        fetchSlot()
    }, [params.id, reset])

    const onSubmit = async (data: FormValues) => {
        setServerError("")
        const res = await fetch(`/api/timetables/${params.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
        if (res.ok) {
            router.push("/dashboard/timetables")
            router.refresh()
        } else {
            const d = await res.json()
            setServerError(d.message || "Failed to update slot")
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Timetable Slot</h1>

            {serverError && (
                <div className="p-4 mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                        <select {...register("day")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white transition-all">
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {errors.day && <p className="mt-1 text-sm text-red-500">{errors.day.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                        <input type="time" {...register("time")} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white transition-all" />
                        {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                    <input {...register("subject")} placeholder="Introduction to Algorithms" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white transition-all" />
                    {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                        <input {...register("location")} placeholder="Room 204, Block A" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white transition-all" />
                        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lecturer</label>
                        <input {...register("lecturer")} placeholder="Dr. Kamau" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-gray-900 dark:text-white transition-all" />
                        {errors.lecturer && <p className="mt-1 text-sm text-red-500">{errors.lecturer.message}</p>}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => router.back()} className="flex-1 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50">
                        {isSubmitting ? "Saving…" : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    )
}
