// dashboard/demo/page.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, AlertCircle, Info, ArrowUpRight, TrendingUp } from "lucide-react"
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

export default function DemoDashboard() {
    const [showTooltip, setShowTooltip] = useState(false)

    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [
            {
                label: 'Attendance %',
                data: [100, 80, 100, 60, 90],
                backgroundColor: 'rgba(5, 150, 105, 0.6)',
                borderRadius: 8,
            },
        ],
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Guest Banner */}
            <div className="bg-brand-600 dark:bg-brand-700 text-white py-3 px-4 sticky top-0 z-50 shadow-md">
                <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-medium flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        <span>You are viewing ClassFlow in <strong>Guest Mode</strong>. Sign up to save your own schedule!</span>
                    </p>
                    <Link
                        href="/auth/register"
                        className="px-4 py-1.5 bg-white text-brand-600 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Create Account
                    </Link>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Sample Dashboard</h1>
                        <p className="text-gray-500 dark:text-gray-400">Experience how ClassFlow helps you stay on track.</p>
                    </div>
                    <div className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-sm font-medium">
                        <AlertCircle className="w-4 h-4" />
                        Read-only Demo
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Streak</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold dark:text-white text-brand-600">8 Days</span>
                            <TrendingUp className="w-5 h-5 text-emerald-500 mb-1.5" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Attendance Rate</p>
                        <span className="text-3xl font-bold dark:text-white">86%</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Classes</p>
                        <span className="text-3xl font-bold dark:text-white">24</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-brand-600 dark:text-brand-400">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Points Earned</p>
                        <span className="text-3xl font-bold">1,250</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Calendar Preview */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold dark:text-white">Sample Timetable</h2>
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Today: Wed, Feb 25</div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { time: "08:00 AM", subject: "Compiler Construction", loc: "Lab 4", status: "missed", color: "red" },
                                    { time: "10:00 AM", subject: "Distributed Systems", loc: "Lecture Hall A", status: "attended", color: "emerald" },
                                    { time: "02:00 PM", subject: "Network Security", loc: "Lecture Hall B", status: "upcoming", color: "brand" },
                                    { time: "04:00 PM", subject: "Final Year Project", loc: "Seminar Room", status: "upcoming", color: "gray" },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 group cursor-help" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                                        <div className="w-20 text-sm font-medium text-gray-500 dark:text-gray-400 pt-3">{item.time}</div>
                                        <div className={`flex-1 p-4 rounded-xl border border-${item.color}-100 dark:border-${item.color}-900/30 bg-${item.color}-50 dark:bg-${item.color}-900/10 hover:shadow-md transition-all relative`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className={`font-bold text-${item.color}-700 dark:text-${item.color}-300`}>{item.subject}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.loc}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter bg-${item.color}-100 dark:bg-${item.color}-900/40 text-${item.color}-700 dark:text-${item.color}-300`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {showTooltip && (
                                <div className="mt-6 p-4 bg-gray-900 text-white rounded-lg text-sm animate-in fade-in slide-in-from-bottom-2">
                                    💡 <strong>Pro Tip:</strong> In your real dashboard, you can drag classes to reschedule or click to add study notes!
                                </div>
                            )}
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
                                <Bar
                                    data={chartData}
                                    options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: { y: { min: 0, max: 100 } }
                                    }}
                                />
                            </div>
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Visualizing your attendance helps you identify patterns and stay consistent. You're doing great on Tuesdays!
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-3xl text-white shadow-xl shadow-brand-500/20">
                            <h3 className="text-2xl font-bold mb-4">Want full access?</h3>
                            <p className="text-brand-100 mb-8 leading-relaxed">
                                Connect your institutional timetable and start tracking your real performance today.
                            </p>
                            <Link
                                href="/auth/register"
                                className="w-full py-4 bg-white text-brand-600 font-bold rounded-2xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 group"
                            >
                                Sign Up Now <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
