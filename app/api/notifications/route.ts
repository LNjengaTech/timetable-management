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

        const timetables = await prisma.timetable.findMany({
            where: {
                day: currentDayName,
            }
        });

        // Determine upcoming in next 30 minutes
        const upcoming = timetables.filter(t => {
            const [tHour, tMin] = t.time.split(':').map(Number);

            const tTimeInMins = tHour * 60 + tMin;
            const cTimeInMins = currentHour * 60 + currentMinute;

            const diff = tTimeInMins - cTimeInMins;

            // Between 0 and 30 minutes away
            return diff > 0 && diff <= 30;
        });

        return NextResponse.json({ upcoming }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
