// api/attendance/mark/route.ts

// attendance mark routes
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Only authenticated users can mark attendance" }, { status: 403 });
        }

        const { timetableId } = await req.json();

        if (!timetableId) {
            return NextResponse.json({ message: "Missing timetableId" }, { status: 400 });
        }

        //Determine "today" as the start of the current day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        //Check if the slot exists
        const timetable = await prisma.timetable.findUnique({
            where: { id: timetableId }
        });

        if (!timetable) {
            return NextResponse.json({ message: "Timetable slot not found" }, { status: 404 });
        }

        // Ensure this slot belongs to the current user (their personal schedule)
        if (timetable.userId !== session.user.id) {
            return NextResponse.json({ message: "You can only mark attendance for your own timetable slots" }, { status: 403 });
        }

        //Check if already marked for today
        const existing = await prisma.attendance.findFirst({
            where: {
                studentId: session.user.id,
                timetableId,
                date: {
                    gte: today,
                }
            }
        });

        if (existing) {
            return NextResponse.json({ message: "Attendance already marked for today" }, { status: 409 });
        }

        // Wraping attendance creation and stats update in a transaction
        const [attendance, stats] = await prisma.$transaction(async (tx) => {
            const att = await tx.attendance.create({
                data: {
                    studentId: session.user.id,
                    timetableId,
                    date: today, //using the normalized 'today' date
                }
            });

            // Gamification Logic
            let userStats = await tx.userStats.findUnique({ where: { userId: session.user.id } });

            //Check punctuality: within first 5 mins of lecture
            let punctualityBonus = 0;
            if (timetable.time) {
                const startTimeStr = timetable.time.split('-')[0]?.trim(); // "09:00"
                if (startTimeStr) {
                    const [hours, minutes] = startTimeStr.split(':').map(Number);
                    if (!isNaN(hours) && !isNaN(minutes)) {
                        const now = new Date();
                        const slotStartTime = new Date();
                        slotStartTime.setHours(hours, minutes, 0, 0);
                        const diffMins = (now.getTime() - slotStartTime.getTime()) / (1000 * 60);

                        //within 5 minutes of start time or 5 mins before
                        if (diffMins >= -5 && diffMins <= 5) {
                            punctualityBonus = 5; //extra points for punctuality
                        }
                    }
                }
            }

            if (!userStats) {
                userStats = await tx.userStats.create({
                    data: {
                        userId: session.user.id,
                        points: 10 + punctualityBonus,
                        classAttendanceStreak: 1,
                        currentStreak: 1, // Unify Streaks
                        longestStreak: 1,
                        lastAttendance: today,
                        lastCheckIn: today, // Unify Streaks
                    }
                });
            } else {
                const lastAttDate = userStats.lastAttendance ? new Date(userStats.lastAttendance) : null;
                let newStreak = userStats.classAttendanceStreak;
                let pointsEarned = 10 + punctualityBonus; // base points + punctuality

                if (lastAttDate) {
                    // Normalize dates just in case
                    lastAttDate.setHours(0, 0, 0, 0);
                    const diffTime = Math.abs(today.getTime() - lastAttDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        // Consecutive day
                        newStreak += 1;
                        pointsEarned += 5; // streak bonus
                    } else if (diffDays > 1) {
                        // Streak broken
                        newStreak = 1;
                    }
                } else {
                    newStreak = 1;
                }

                // Check badges
                const currentBadges = Array.isArray(userStats.badges) ? userStats.badges as string[] : [];
                const badgesToAward: string[] = [];
                const checkBadge = (key: string, condition: boolean) => {
                    if (condition && !currentBadges.includes(key)) badgesToAward.push(key);
                };

                // Weekly Perfection Logic
                const dayOfWeek = today.getDay();
                let extraPerfectWeeks = 0;
                if (dayOfWeek === 5) { // Friday
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - 4);
                    startOfWeek.setHours(0, 0, 0, 0);

                    const attCount = await tx.attendance.count({
                        where: { studentId: session.user.id, date: { gte: startOfWeek } }
                    });
                    const scheduledCount = await tx.timetable.count({
                        where: { userId: session.user.id }
                    });

                    // If they attended at least as many classes as scheduled for the week
                    if (scheduledCount > 0 && attCount >= scheduledCount) {
                        extraPerfectWeeks = 1;
                        pointsEarned += 50; // Large bonus for perfect week
                        checkBadge('perfect_week', true);
                        if (userStats.perfectWeeks + 1 >= 4) {
                            checkBadge('perfect_month', true);
                            pointsEarned += 200; // Perfect month bonus
                        }
                    }
                }

                const futurePoints = userStats.points + pointsEarned;
                checkBadge('streak_3', newStreak >= 3);
                checkBadge('streak_7', newStreak >= 7);
                checkBadge('points_100', futurePoints >= 100);
                checkBadge('points_500', futurePoints >= 500);

                userStats = await tx.userStats.update({
                    where: { userId: session.user.id },
                    data: {
                        points: futurePoints,
                        classAttendanceStreak: newStreak,
                        currentStreak: newStreak, // Unify Streaks
                        longestStreak: Math.max(newStreak, userStats.longestStreak),
                        lastAttendance: today,
                        lastCheckIn: today, // Unify Streaks
                        perfectWeeks: userStats.perfectWeeks + extraPerfectWeeks,
                        // Append new badges if any
                        ...(badgesToAward.length > 0 && { badges: [...currentBadges, ...badgesToAward] })
                    }
                });
            }

            return [att, userStats];
        });

        return NextResponse.json({ message: "Attendance marked successfully", attendance, stats }, { status: 201 });
    } catch (error) {
        console.error("Attendance API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
