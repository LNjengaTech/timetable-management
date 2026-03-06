// api/notifications/route.ts

//notification routes
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized or missing User ID" }, { status: 401 });
        }

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

        const leadTime = dbUser?.notificationLeadTime ?? 30;

        const timetables = await prisma.timetable.findMany({
            where: {
                day: currentDayName,
                userId: session.user.id
            }
        });

        const upcoming = timetables.filter(t => {
            if (!t.time) return false;

            // Handle both "HH:MM" and "HH:MM - HH:MM" formats safely
            const timePart = t.time.split('-')[0].trim();
            const [tHour, tMin] = timePart.split(':').map(Number);

            if (isNaN(tHour) || isNaN(tMin)) return false;

            const tTimeInMins = tHour * 60 + tMin;
            const cTimeInMins = currentHour * 60 + currentMinute;

            const diff = tTimeInMins - cTimeInMins;
            return diff > 0 && diff <= leadTime;
        });

        return NextResponse.json({ upcoming }, { status: 200 });
    } catch (error: any) {
        console.error("Notification API Error:", error);
        return NextResponse.json({
            message: "Internal Server Error",
            error: error?.message || "Unknown error",
            stack: process.env.NODE_ENV === "development" ? error?.stack : undefined
        }, { status: 500 });
    }
}
