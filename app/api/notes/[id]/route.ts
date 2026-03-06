// app/api/notes/[id]/route.ts
// DELETE a specific note (owner only)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { deleteFromCloudinary, getPublicIdFromUrl } from "@/lib/cloudinary";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const note = await prisma.note.findUnique({
            where: { id },
        });

        if (!note) {
            return NextResponse.json({ message: "Note not found" }, { status: 404 });
        }

        if (note.userId !== session.user.id) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Delete from Cloudinary
        try {
            const publicId = getPublicIdFromUrl(note.fileUrl);
            if (publicId) {
                await deleteFromCloudinary(publicId);
            }
        } catch (error) {
            console.error("Cloudinary delete error:", error);
            // Continue to delete DB record even if cloud delete fails
        }

        await prisma.note.delete({ where: { id } });

        return NextResponse.json({ message: "Note deleted" });
    } catch (error) {
        console.error("Notes DELETE error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
