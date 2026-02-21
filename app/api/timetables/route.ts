import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as z from "zod";

const timetableSchema = z.object({
    day: z.string().min(1, "Day is required"),
    time: z.string().min(1, "Time is required"),
    subject: z.string().min(1, "Subject is required"),
    location: z.string().min(1, "Location is required"),
    lecturer: z.string().min(1, "Lecturer is required"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LECTURER")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const payload = await req.json();
        const parsed = timetableSchema.safeParse(payload);

        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid input data", errors: parsed.error.format() }, { status: 400 });
        }

        const { day, time, subject, location, lecturer } = parsed.data;

        // Conflict Check: existing slot with same day, time, and location
        const existingSlot = await prisma.timetable.findFirst({
            where: {
                day,
                time,
                location,
            },
        });

        if (existingSlot) {
            return NextResponse.json({ message: "Conflict detected: slot exists at this day/time/location." }, { status: 409 });
        }

        const timetable = await prisma.timetable.create({
            data: {
                day,
                time,
                subject,
                location,
                lecturer,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ message: "Timetable created", timetable }, { status: 201 });
    } catch (error) {
        console.error("Timetable Creation Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const timetables = await prisma.timetable.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(timetables);
    } catch (error) {
        console.error("Timetable Fetching Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
