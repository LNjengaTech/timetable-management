// components/StatsGrid.tsx

import { Flame, Star, CheckCircle, Calendar } from "lucide-react"

interface StatsGridProps {
    streak: number
    points: number
    attendanceRate: number
    totalClasses: number
}

export default function StatsGrid({ streak, points, attendanceRate, totalClasses }: StatsGridProps) {
    const stats = [
        { label: "Current Streak", value: `${streak} Days`, icon: Flame, color: "orange" },
        { label: "Points Earned", value: points.toLocaleString(), icon: Star, color: "yellow" },
        { label: "Attendance Rate", value: `${attendanceRate}%`, icon: CheckCircle, color: "emerald" },
        { label: "Total Classes", value: totalClasses.toString(), icon: Calendar, color: "brand" },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <div className={`p-2 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold dark:text-white">{stat.value}</span>
                        {stat.label === "Current Streak" && streak > 0 && (
                            <span className="text-xs font-bold text-emerald-500 mb-1.5">+1 today</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
