// app/dashboard/gamification/page.tsx

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import GamificationWidget from "@/components/GamificationWidget"
import BadgesClient from "@/components/BadgesClient"
import { Trophy, Flame, Star, Award, Target, Zap } from "lucide-react"
import prisma from "@/lib/prisma"

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

    const stats = await prisma.userStats.findUnique({
        where: { userId: session.user.id }
    })

    const points = stats?.points || 0;
    const level = Math.floor(points / 50) + 1;
    const progressToNext = points % 50;

    // Determine ranks
    const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    const rankIndex = Math.min(Math.floor((level - 1) / 3), ranks.length - 1);
    const romanNumerals = ['I', 'II', 'III'];
    const subRankIndex = (level - 1) % 3;

    const rankName = `${ranks[rankIndex]} ${romanNumerals[subRankIndex]}`;
    const nextRankIndex = Math.min(rankIndex + (subRankIndex === 2 ? 1 : 0), ranks.length - 1);
    const nextSubRankIndex = (subRankIndex + 1) % 3;
    const nextRankName = `${ranks[nextRankIndex]} ${romanNumerals[nextSubRankIndex]}`;
    const nextLevelPoints = level * 50;

    const rankEmojis = ['🥉', '🥈', '🥇', '🏆', '👑'];
    const rankEmoji = rankEmojis[rankIndex];

    const unlockedBadges: string[] = (stats?.badges as string[]) || [];

    const topUsers = await prisma.userStats.findMany({
        orderBy: [
            { points: 'desc' },
            { classAttendanceStreak: 'desc' }
        ],
        take: 5,
        include: { user: { select: { name: true, image: true } } }
    });

    return (
        <main className="md:p-8 max-w-5xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Rewards & Streak</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track your progress and climb the ranks.</p>
                </div>
                <div className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full border border-yellow-200 dark:border-yellow-800/50 flex items-center gap-2 text-sm font-bold shadow-sm">
                    <Award className="w-4 h-4" />
                    Level {level}
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
                                { title: "On-time Attendance", points: "+15 pts", desc: "Mark yourself present within the first 5 minutes.", icon: Zap, color: "yellow" },
                                { title: "Daily Check-in", points: "+5 pts", desc: "Open the app daily to earn points and up to +2 bonus.", icon: Target, color: "blue" },
                                { title: "Attendance Streak", points: "+15 pts", desc: "Attend consecutive classes for bonus points.", icon: Flame, color: "orange" },
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
                                {rankEmoji}
                            </div>
                            <div>
                                <p className="text-2xl font-black italic uppercase tracking-wider">{rankName}</p>
                                <p className="text-xs text-gray-400">Next: {nextRankName} at {nextLevelPoints} pts</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(progressToNext / 50) * 100}%` }} />
                            </div>
                            <p className="text-xs text-center text-gray-500 font-medium">{points} / {nextLevelPoints} pts</p>
                        </div>
                    </div>

                    <BadgesClient unlockedBadges={unlockedBadges} />

                    {/* Leaderboard Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Leaderboard
                        </h3>
                        <div className="space-y-4">
                            {topUsers.map((userStat, idx) => (
                                <div key={userStat.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {userStat.user.name || 'Anonymous User'}
                                            {userStat.userId === session.user.id && <span className="ml-2 text-xs font-normal text-brand-600">(You)</span>}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> {userStat.points} pts</span>
                                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" /> {userStat.classAttendanceStreak} streak</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {topUsers.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No ranked users yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
