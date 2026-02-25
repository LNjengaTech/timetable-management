// components/GamificationWidget.tsx

// Gamification widget component for displaying user progress and stats in a week view 

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Trophy, Flame, Star } from "lucide-react"

export default async function GamificationWidget() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    return null
  }

  const stats = await prisma.userStats.findUnique({
    where: { userId: session.user.id }
  })

  const points = stats?.points || 0
  const currentStreak = stats?.currentStreak || 0
  
  // Calculate level based on points (e.g., 1 level per 50 points)
  const level = Math.floor(points / 50) + 1
  const progressToNext = (points % 50) / 50 * 100

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl relative overflow-hidden group hover:border-brand-500/50 transition-all">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Your Progress
          </h3>
          <span className="px-3 py-1 bg-brand-900/50 text-brand-300 font-bold rounded-full border border-brand-800 text-sm shadow-sm">
            Level {level}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className=" dark:bg-gray-900/80 p-4 rounded-xl border border-gray-700/50 flex flex-col items-center justify-center text-center">
            <Flame className={`w-8 h-8 mb-2 ${currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-500'}`} />
            <span className="text-2xl font-black text-gray-900 dark:text-white">{currentStreak}</span>
            <span className="text-xs text-gray-900 dark:text-gray-400 font-medium uppercase tracking-wider mt-1">Day Streak</span>
          </div>
          
          <div className=" dark:bg-gray-900/80 p-4 rounded-xl border border-gray-700/50 flex flex-col items-center justify-center text-center">
            <Star className="w-8 h-8 text-yellow-400 mb-2" />
            <span className="text-2xl font-black text-gray-900 dark:text-white">{points}</span>
            <span className="text-xs text-gray-900 dark:text-gray-400 font-medium uppercase tracking-wider mt-1">Total Points</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium text-gray-400 mb-2">
            <span>Progress to Lvl {level + 1}</span>
            <span>{points % 50} / 50 pts</span>
          </div>
          <div className="w-full dark:bg-gray-900 rounded-full h-2.5 border border-gray-700 overflow-hidden">
            <div 
              className="bg-brand-600 dark:bg-brand-400 h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
