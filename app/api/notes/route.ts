// app/api/notes/route.ts
// Notes API routes – POST (upload) and GET (list)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/** POST /api/notes  – upload a new note (PDF) tied to a timetable slot */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string | null;
        const timetableId = formData.get("timetableId") as string;
        const isPublic = formData.get("isPublic") === "true";

        if (!file || !title || !timetableId) {
            return NextResponse.json({ message: "Missing required fields (file, title, timetableId)" }, { status: 400 });
        }

        // Only accept PDFs
        if (file.type !== "application/pdf") {
            return NextResponse.json({ message: "Only PDF files are accepted" }, { status: 400 });
        }

        // Verify the timetable slot belongs to the current user
        const slot = await prisma.timetable.findFirst({
            where: { id: timetableId, userId: session.user.id },
        });
        if (!slot) {
            return NextResponse.json({ message: "Timetable slot not found" }, { status: 404 });
        }

        // Save file to /public/uploads/notes/<userId>/<unique-name>.pdf
        const uploadDir = path.join(process.cwd(), "public", "uploads", "notes", session.user.id);
        await mkdir(uploadDir, { recursive: true });

        const safeOrigName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const uniqueName = `${Date.now()}_${safeOrigName}`;
        const filePath = path.join(uploadDir, uniqueName);
        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        // Relative URL served by Next.js from /public
        const fileUrl = `/uploads/notes/${session.user.id}/${uniqueName}`;

        const note = await prisma.note.create({
            data: {
                title,
                description: description || null,
                fileUrl,
                fileName: file.name,
                isPublic,
                subject: slot.subject,
                timetableId,
                userId: session.user.id,
            },
            include: { user: { select: { name: true } } },
        });

        return NextResponse.json({ message: "Note uploaded", note }, { status: 201 });
    } catch (error) {
        console.error("Notes POST error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * GET /api/notes?timetableId=<id>
 * Returns the user's own notes for that slot + public notes from others sharing the same subject.
 * Optionally, omit timetableId to get all of the user's notes.
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const timetableId = searchParams.get("timetableId");

        if (timetableId) {
            // Verify the slot belongs to this user (to get the subject for public lookup)
            const slot = await prisma.timetable.findFirst({
                where: { id: timetableId, userId: session.user.id },
            });
            if (!slot) {
                return NextResponse.json({ message: "Timetable slot not found" }, { status: 404 });
            }

            const notes = await prisma.note.findMany({
                where: {
                    OR: [
                        // Own notes for this slot
                        { timetableId, userId: session.user.id },
                        // Public notes from others with the same subject
                        { subject: slot.subject, isPublic: true, userId: { not: session.user.id } },
                    ],
                },
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json({ notes });
        }

        // No timetableId – return all of the user's own notes
        const notes = await prisma.note.findMany({
            where: { userId: session.user.id },
            include: { user: { select: { name: true } }, timetable: { select: { subject: true, day: true, time: true } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json({ notes });
    } catch (error) {
        console.error("Notes GET error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
