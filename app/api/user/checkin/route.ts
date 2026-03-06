import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await prisma.userStats.findUnique({
            where: { userId: session.user.id }
        });

        if (!stats) {
            // Check if the user exists
            const user = await prisma.user.findUnique({ where: { id: session.user.id } });
            if (!user) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }

            // Initialize stats if not existing
            await prisma.userStats.create({
                data: {
                    userId: session.user.id,
                    lastCheckIn: today,
                    currentStreak: 1,
                    longestStreak: 1,
                    points: 5, // starting points for signing in
                    badges: ['first_checkin']
                }
            });
            return NextResponse.json({ message: "Checked in successfully for the first time!" }, { status: 200 });
        }

        const lastCheckIn = stats.lastCheckIn ? new Date(stats.lastCheckIn) : null;
        if (lastCheckIn) {
            lastCheckIn.setHours(0, 0, 0, 0);
        }

        if (lastCheckIn && lastCheckIn.getTime() === today.getTime()) {
            return NextResponse.json({ message: "Already checked in today." }, { status: 200 });
        }

        let newStreak = stats.currentStreak;
        let pointsEarned = 5;

        if (lastCheckIn) {
            const diffTime = today.getTime() - lastCheckIn.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak += 1;
                pointsEarned += 2; // streak bonus
            } else if (diffDays > 1) {
                newStreak = 1; // streak reset
            }
        } else {
            newStreak = 1;
        }

        await prisma.userStats.update({
            where: { userId: session.user.id },
            data: {
                currentStreak: newStreak,
                classAttendanceStreak: newStreak, // Keep in sync
                longestStreak: Math.max(newStreak, stats.longestStreak),
                lastCheckIn: today,
                points: stats.points + pointsEarned
            }
        });

        return NextResponse.json({ message: "Checked in successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Check-in API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
