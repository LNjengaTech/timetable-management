// components/RecentActivity.tsx

import { History, Check, Clock, Plus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Activity {
    id: string
    type: "ATTENDANCE" | "TIMETABLE_ADD" | "TIMETABLE_UPDATE"
    title: string
    timestamp: Date
}

export default function RecentActivity({ activities }: { activities: Activity[] }) {
    const getIcon = (type: Activity["type"]) => {
        switch (type) {
            case "ATTENDANCE": return <Check className="w-4 h-4 text-emerald-500" />
            case "TIMETABLE_ADD": return <Plus className="w-4 h-4 text-blue-500" />
            case "TIMETABLE_UPDATE": return <Clock className="w-4 h-4 text-amber-500" />
            default: return <History className="w-4 h-4 text-gray-500" />
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-brand-600" />
                Recent Activity
            </h3>

            <div className="space-y-6">
                {activities.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No recent activity yet.</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4">
                            <div className="mt-1 w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0">
                                {getIcon(activity.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {activity.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
