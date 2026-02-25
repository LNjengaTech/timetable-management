// api/notifications/route.ts

// notification routes
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // A real app would complexly join Group configurations.
        // Here we find ALL timetables and just check time, or filter by user's enrolled subjects.
        // For simplicity: return timetables that are happening today up next.
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = new Date();
        const currentDayName = days[today.getDay()];

        // Get current time as HH:MM
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();

        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { notificationLeadTime: true }
        });

        const leadTime = dbUser?.notificationLeadTime || 30;

        const timetables = await prisma.timetable.findMany({
            where: {
                day: currentDayName,
                userId: session.user.id
            }
        });

        // Determine upcoming based on user's preference
        const upcoming = timetables.filter(t => {
            const [tHour, tMin] = t.time.split(':').map(Number);

            const tTimeInMins = tHour * 60 + tMin;
            const cTimeInMins = currentHour * 60 + currentMinute;

            const diff = tTimeInMins - cTimeInMins;

            // Between 0 and leadTime away
            return diff > 0 && diff <= leadTime;
        });

        return NextResponse.json({ upcoming }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
