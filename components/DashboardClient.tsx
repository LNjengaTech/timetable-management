// components/DashboardClient.tsx

"use client"

import { useState } from "react"
import { Bar } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { TrendingUp, Calendar as CalendarIcon, Clock, MapPin, User, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

interface Slot {
    id: string
    subject: string
    time: string
    location: string
    lecturer: string
    attended?: boolean
}

interface DashboardClientProps {
    todaySlots: Slot[]
    attendanceTrend: { labels: string[], data: number[] }
}

export default function DashboardClient({ todaySlots, attendanceTrend }: DashboardClientProps) {
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

    const chartData = {
        labels: attendanceTrend.labels,
        datasets: [
            {
                label: 'Attendance %',
                data: attendanceTrend.data,
                backgroundColor: 'rgba(5, 150, 105, 0.6)',
                borderRadius: 8,
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1f2937',
                titleFont: { size: 12 },
                bodyFont: { size: 10 },
                padding: 10,
                borderRadius: 8,
            }
        },
        scales: {
            y: { min: 0, max: 100, ticks: { stepSize: 20 }, grid: { display: false } },
            x: { grid: { display: false } }
        }
    }

    const getTimeStatus = (time: string) => {
        const now = new Date()
        const [hours, minutes] = time.split(':').map(Number)
        const slotTime = new Date()
        slotTime.setHours(hours, minutes, 0, 0)

        if (now < slotTime) return "upcoming"
        // Assume 1 hour class for simplicity
        const endTime = new Date(slotTime)
        endTime.setHours(endTime.getHours() + 1)
        if (now >= slotTime && now <= endTime) return "now"
        return "completed"
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Schedule */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-brand-600" />
                            Today&apos;s Schedule
                        </h2>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {todaySlots.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No classes scheduled for today.</p>
                            </div>
                        ) : (
                            todaySlots.map((slot) => {
                                const status = getTimeStatus(slot.time)
                                return (
                                    <motion.div
                                        key={slot.id}
                                        layoutId={slot.id}
                                        onClick={() => setSelectedSlot(selectedSlot === slot.id ? null : slot.id)}
                                        className={`flex gap-4 group cursor-pointer p-4 rounded-xl border transition-all ${status === "now"
                                                ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 shadow-sm"
                                                : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            }`}
                                    >
                                        <div className="w-20 text-sm font-bold text-gray-500 dark:text-gray-400 pt-1">{slot.time}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className={`font-bold truncate ${status === "now" ? "text-brand-700 dark:text-brand-300" : "text-gray-900 dark:text-white"}`}>
                                                        {slot.subject}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {slot.location}</span>
                                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {slot.lecturer}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {status === "now" && (
                                                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter ${status === "now" ? "bg-green-100 border-green-900 text-green-700" :
                                                            status === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {selectedSlot === slot.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden pt-4 mt-4 border-t border-gray-100 dark:border-gray-700"
                                                    >
                                                        <div className="flex gap-2 text-sm">
                                                            <button className="flex-1 py-1.5 px-3 bg-brand-600 text-white rounded-lg font-bold text-xs hover:bg-brand-500 transition-colors">
                                                                Mark Attended
                                                            </button>
                                                            <button className="flex-1 py-1.5 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors">
                                                                View Details
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Analytics Sidebar */}
            <div className="space-y-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        Attendance Trends
                    </h3>
                    <div className="h-64">
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        Attendance visualization helps you track consistency. Keep up the high performance!
                    </p>
                    <button className="w-full mt-6 py-3 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-900 dark:text-white hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                        View Full Report <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
