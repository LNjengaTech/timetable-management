import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LECTURER")) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { title, description, dueDate, timetableId } = await req.json();

        if (!title || !timetableId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const homework = await prisma.homework.create({
            data: {
                title,
                description,
                dueDate: dueDate ? new Date(dueDate) : null,
                timetableId
            }
        });

        return NextResponse.json({ message: "Homework created", homework }, { status: 201 });
    } catch (error) {
        console.error("Homework API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
