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

        // Determine "today" as the start of the current day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if the slot exists
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

        // Check if already marked for today
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

        // Wrap attendance creation and stats update in a transaction
        const [attendance, stats] = await prisma.$transaction(async (tx) => {
            const att = await tx.attendance.create({
                data: {
                    studentId: session.user.id,
                    timetableId,
                    date: today, // using the normalized 'today' date
                }
            });

            // Gamification Logic
            let userStats = await tx.userStats.findUnique({ where: { userId: session.user.id } });

            if (!userStats) {
                userStats = await tx.userStats.create({
                    data: {
                        userId: session.user.id,
                        points: 10,
                        currentStreak: 1,
                        longestStreak: 1,
                        lastAttendance: today,
                    }
                });
            } else {
                const lastAttDate = userStats.lastAttendance ? new Date(userStats.lastAttendance) : null;
                let newStreak = userStats.currentStreak;
                let pointsEarned = 10; // base points

                if (lastAttDate) {
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

                userStats = await tx.userStats.update({
                    where: { userId: session.user.id },
                    data: {
                        points: userStats.points + pointsEarned,
                        currentStreak: newStreak,
                        longestStreak: Math.max(newStreak, userStats.longestStreak),
                        lastAttendance: today,
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
