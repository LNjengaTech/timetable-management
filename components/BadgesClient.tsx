"use client"

import { useState } from "react"
import { Award, X } from "lucide-react"

export const BADGE_DICTIONARY: Record<string, { emoji: string, title: string, desc: string }> = {
    'first_checkin': { emoji: '👋', title: 'First Steps', desc: 'Completed your first daily check-in.' },
    'streak_3': { emoji: '🔥', title: 'On Fire (3 Days)', desc: 'Achieved a 3-day class attendance streak.' },
    'streak_7': { emoji: '🚀', title: 'Unstoppable (7 Days)', desc: 'Achieved a 7-day class attendance streak.' },
    'punctual_5': { emoji: '⚡', title: 'Early Bird', desc: 'Marked attendance on time 5 times.' },
    'points_100': { emoji: '💎', title: 'Century Club', desc: 'Accumulated 100 total points.' },
    'points_500': { emoji: '👑', title: 'Half-Millennium', desc: 'Accumulated 500 total points.' },
    'perfect_week': { emoji: '🌟', title: 'Perfect Week', desc: '100% attendance over a full academic week.' },
    'perfect_month': { emoji: '🏆', title: 'Perfect Month', desc: '100% attendance rate for a month.' }
};

interface BadgesClientProps {
    unlockedBadges: string[]
}

export default function BadgesClient({ unlockedBadges }: BadgesClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const allBadgeKeys = Object.keys(BADGE_DICTIONARY)

    // Top 6 to display on the dashboard card
    const displayBadges = allBadgeKeys.slice(0, 6)

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Badges ({unlockedBadges.length}/{allBadgeKeys.length})
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center">
                {displayBadges.map((badgeKey, i) => {
                    const badge = BADGE_DICTIONARY[badgeKey]
                    const isUnlocked = unlockedBadges.includes(badgeKey)

                    return (
                        <div key={i} className={`aspect-square rounded-2xl border ${isUnlocked ? 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 grayscale-0 shadow-sm' : 'bg-gray-50/50 dark:bg-gray-900/50 border-dashed border-gray-100 dark:border-gray-800 grayscale opacity-50'} flex flex-col items-center justify-center text-2xl hover:scale-110 transition-transform cursor-help group relative`}>
                            <span>{badge.emoji}</span>

                            {/* Tooltip */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                                <p className="font-bold mb-1 border-b border-gray-700 pb-1 flex items-center justify-between">
                                    {badge.title}
                                    {!isUnlocked && <span className="text-[10px] text-gray-400 font-normal ml-2">Locked</span>}
                                </p>
                                <p className="text-gray-300 leading-tight">{badge.desc}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-8 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-bold rounded-xl text-sm border border-brand-100 dark:border-brand-800 hover:bg-brand-100 transition-all cursor-pointer">
                View All Badges
            </button>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl relative border border-gray-100 dark:border-gray-700"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-6 top-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold mb-2 pr-8 flex items-center gap-2">
                            <Award className="w-6 h-6 text-amber-500" />
                            All Badges
                        </h2>
                        <p className="text-gray-500 mb-6 text-sm">Collect badges by maintaining streaks, arriving on time, and earning points!</p>

                        <div className="space-y-3">
                            {allBadgeKeys.map((key) => {
                                const badge = BADGE_DICTIONARY[key];
                                const isUnlocked = unlockedBadges.includes(key);

                                return (
                                    <div key={key} className={`flex items-center gap-4 p-4 rounded-xl border ${isUnlocked ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-700 grayscale-0' : 'bg-transparent border-dashed border-gray-200 dark:border-gray-800 grayscale opacity-60'}`}>
                                        <div className="w-12 h-12 flex items-center justify-center text-3xl bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            {badge.emoji}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                                                {badge.title}
                                                {!isUnlocked && <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">Locked</span>}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{badge.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
