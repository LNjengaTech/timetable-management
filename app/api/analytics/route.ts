import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LECTURER")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        // Get basic stats
        const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
        const totalSlots = await prisma.timetable.count();

        // Aggregate attendances by subject
        // Note: Prisma string grouping can be complex, so we'll fetch relations and map in memory
        // In a prod app, raw SQL grouping is preferred for performance 
        const timetables = await prisma.timetable.findMany({
            include: {
                _count: {
                    select: { attendances: true }
                }
            }
        });

        // Group counts by Subject string
        const subjectAttendanceMap: Record<string, number> = {};
        timetables.forEach(t => {
            subjectAttendanceMap[t.subject] = (subjectAttendanceMap[t.subject] || 0) + t._count.attendances;
        });

        const labels = Object.keys(subjectAttendanceMap);
        const data = Object.values(subjectAttendanceMap);

        return NextResponse.json({
            summary: { totalStudents, totalSlots },
            charts: {
                attendanceBySubject: { labels, data }
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
