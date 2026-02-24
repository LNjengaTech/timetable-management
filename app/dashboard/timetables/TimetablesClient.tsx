"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, CheckCircle2, MapPin, User, Clock, Plus, UploadCloud } from "lucide-react"

type Slot = {
    id: string
    subject: string
    day: string
    time: string
    location: string
    lecturer: string
}

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Returns true if a class at `slotTime` (HH:MM) on `slotDay` is within the ±15 min window right now
function isInClassWindow(slotDay: string, slotTime: string): boolean {
    const now = new Date()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const todayName = dayNames[now.getDay()]
    if (todayName !== slotDay) return false

    const [h, m] = slotTime.split(":").map(Number)
    const slotMins = h * 60 + m
    const nowMins = now.getHours() * 60 + now.getMinutes()
    // Window: 15 minutes before start until 60 minutes after start
    return nowMins >= slotMins - 15 && nowMins <= slotMins + 60
}

export default function TimetablesClientPage({ initialSlots }: { initialSlots: Slot[] }) {
    const router = useRouter()
    const [slots, setSlots] = useState<Slot[]>(initialSlots)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [markingId, setMarkingId] = useState<string | null>(null)
    const [markedIds, setMarkedIds] = useState<Set<string>>(new Set())
    const [tick, setTick] = useState(0)

    // Re-evaluate class windows every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60_000)
        return () => clearInterval(interval)
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this timetable slot? This cannot be undone.")) return
        setDeletingId(id)
        const res = await fetch(`/api/timetables/${id}`, { method: "DELETE" })
        if (res.ok) {
            setSlots(prev => prev.filter(s => s.id !== id))
        }
        setDeletingId(null)
    }

    const handleMarkAttendance = async (id: string) => {
        setMarkingId(id)
        const res = await fetch("/api/attendance/mark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ timetableId: id }),
        })
        if (res.ok) {
            setMarkedIds(prev => new Set([...prev, id]))
        }
        setMarkingId(null)
    }

    // Group slots by day for a nicer layout
    const grouped = DAY_ORDER.reduce<Record<string, Slot[]>>((acc, day) => {
        const daySlots = slots.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time))
        if (daySlots.length) acc[day] = daySlots
        return acc
    }, {})

    return (
        <div className="max-w-7xl overflow-x-auto mx-auto p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Timetable</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {slots.length} slot{slots.length !== 1 ? "s" : ""} in your schedule
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/timetables/new" className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors shadow-sm text-sm">
                        <Plus className="w-4 h-4" /> Manual Entry
                    </Link>
                    <Link href="/dashboard/timetables/upload" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-medium rounded-lg transition-colors text-sm">
                        <UploadCloud className="w-4 h-4" /> Upload PDF/Image
                    </Link>
                </div>
            </div>

            {/* Empty state */}
            {slots.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                    <UploadCloud className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No classes yet</h2>
                    <p className="text-gray-400 text-sm mb-6">Add your first class manually or upload your timetable</p>
                    <div className="flex justify-center gap-3">
                        <Link href="/dashboard/timetables/new" className="px-5 py-2.5 bg-brand-600 text-white font-medium rounded-lg text-sm hover:bg-brand-500 transition-colors">+ Manual Entry</Link>
                        <Link href="/dashboard/timetables/upload" className="px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">Upload PDF</Link>
                    </div>
                </div>
            )}

            {/* Grouped by day */}

            <div className="space-y-8">
                {Object.entries(grouped).map(([day, daySlots]) => (
                    <div key={day}>
                        <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{day}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {daySlots.map(slot => {
                                const inWindow = isInClassWindow(slot.day, slot.time)
                                const alreadyMarked = markedIds.has(slot.id)

                                return (
                                    <div
                                        key={slot.id}
                                        className={`relative bg-white dark:bg-gray-800 border rounded-2xl p-5 flex flex-col gap-3 shadow-sm transition-all ${inWindow
                                                ? "border-brand-400 dark:border-brand-600 ring-2 ring-brand-400/30 dark:ring-brand-600/30"
                                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                            }`}
                                    >
                                        {/* Active class badge */}
                                        {inWindow && (
                                            <span className="absolute top-4 right-4 px-2 py-0.5 text-xs font-semibold bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 rounded-full border border-brand-200 dark:border-brand-800 animate-pulse">
                                                In Progress
                                            </span>
                                        )}

                                        {/* Time chip */}
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            <span className="font-semibold text-brand-600 dark:text-brand-400">{slot.time}</span>
                                        </div>

                                        {/* Subject */}
                                        <Link href={`/dashboard/timetables/${slot.id}`} className="block group">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                                                {slot.subject}
                                            </h3>
                                        </Link>

                                        {/* Meta */}
                                        <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{slot.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{slot.lecturer}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                                            {inWindow && !alreadyMarked && (
                                                <button
                                                    onClick={() => handleMarkAttendance(slot.id)}
                                                    disabled={markingId === slot.id}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-lg transition-all disabled:opacity-60 shadow-sm"
                                                >
                                                    {markingId === slot.id ? "Marking…" : "✓ Mark Attended"}
                                                </button>
                                            )}
                                            {alreadyMarked && (
                                                <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg border border-green-200 dark:border-green-800">
                                                    <CheckCircle2 className="w-4 h-4" /> Attended
                                                </div>
                                            )}
                                            <Link
                                                href={`/dashboard/timetables/edit/${slot.id}`}
                                                className="p-2 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(slot.id)}
                                                disabled={deletingId === slot.id}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <hr className="my-8 border-gray-200 dark:border-gray-700"/>
                    </div>
                    
                ))}
                
            </div>
            
        </div>
    )
}
