// app/dashboard/gamification/page.tsx

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import GamificationWidget from "@/components/GamificationWidget"
import { Trophy, Flame, Star, Award, Target, Zap } from "lucide-react"

export default async function GamificationPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/auth/login")
    }

    if (session.user.role !== "STUDENT") {
        return (
            <div className="md:p-8 max-w-4xl mx-auto text-center py-20">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Student Rewards Only</h1>
                <p className="text-gray-500">The gamification system is currently only available for students to track their attendance consistency.</p>
            </div>
        )
    }

    return (
        <main className="md:p-8 max-w-5xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Rewards & Streak</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress and climb the ranks.</p>
                </div>
                <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-800/50 flex items-center gap-2 text-sm font-bold shadow-sm">
                    <Award className="w-4 h-4" />
                    Top 10% this week
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <GamificationWidget />

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Target className="w-6 h-6 text-brand-600" />
                            How to Earn Points
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: "On-time Attendance", points: "+10 pts", desc: "Mark yourself present within the class hour.", icon: Zap, color: "yellow" },
                                { title: "7-Day Streak", points: "+50 pts", desc: "Attend all your classes for a full week.", icon: Flame, color: "orange" },
                                { title: "Early Bird", points: "+15 pts", desc: "Mark attendance in the first 10 minutes.", icon: Star, color: "blue" },
                                { title: "Perfect Month", points: "+200 pts", desc: "100% attendance rate for 30 days.", icon: Award, color: "emerald" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                    <div className={`p-3 rounded-xl bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600 dark:text-${item.color}-400 h-fit`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm dark:text-white">{item.title}</h4>
                                        <p className="text-brand-600 dark:text-brand-400 font-bold text-xs mt-0.5">{item.points}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl text-white shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Current Rank</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-3xl shadow-lg shadow-brand-500/30">
                                🥈
                            </div>
                            <div>
                                <p className="text-2xl font-black italic uppercase tracking-wider">Silver II</p>
                                <p className="text-xs text-gray-400">Next: Gold I at 2,000 pts</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 w-3/5 rounded-full" />
                            </div>
                            <p className="text-xs text-center text-gray-500 font-medium">1,250 / 2,000 pts</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            Unlocked Badges
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {["🔥", "🎯", "🎓", "🚀", "⚡", "💎"].slice(0, 4).map((emoji, i) => (
                                <div key={i} className="aspect-square rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer grayscale hover:grayscale-0" title="Badge Title">
                                    {emoji}
                                </div>
                            ))}
                            <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-300">
                                ?
                            </div>
                        </div>
                        <button className="w-full mt-8 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-bold rounded-xl text-sm border border-brand-100 dark:border-brand-800 hover:bg-brand-100 transition-all">
                            View All Badges
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}
