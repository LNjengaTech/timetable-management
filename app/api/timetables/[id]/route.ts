// api/timetables/[id]/route.ts

// timetable routes - for updating and deleting a specific timetable slot
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as z from "zod";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const slot = await prisma.timetable.findUnique({ where: { id } });
        if (!slot || slot.userId !== session.user.id) {
            return NextResponse.json({ message: "Not found" }, { status: 404 });
        }
        return NextResponse.json(slot);
    } catch {
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

const updateSchema = z.object({
    day: z.string().min(1),
    time: z.string().min(1),
    subject: z.string().min(1),
    location: z.string().min(1),
    lecturer: z.string().min(1),
});

export async function PUT(req: Request, { params }: Context) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const existing = await prisma.timetable.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: "Slot not found" }, { status: 404 });
        }
        if (existing.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ message: "Invalid data", errors: parsed.error.format() }, { status: 400 });
        }

        const updated = await prisma.timetable.update({ where: { id }, data: parsed.data });
        return NextResponse.json({ message: "Updated", timetable: updated });
    } catch (err) {
        console.error("Update Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: Context) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const existing = await prisma.timetable.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ message: "Slot not found" }, { status: 404 });
        }
        if (existing.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await prisma.timetable.delete({ where: { id } });
        return NextResponse.json({ message: "Deleted" });
    } catch (err) {
        console.error("Delete Error:", err);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
