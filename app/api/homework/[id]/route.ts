import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Change to Promise
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Authorization Check
    if (!session || !["ADMIN", "LECTURER"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Await the params (Crucial for Next.js 15)
    const { id } = await params;

    // 3. Find the homework first to get the timetableId for revalidation
    const homework = await prisma.homework.findUnique({
      where: { id }
    });

    if (!homework) {
      return NextResponse.json({ message: "Homework not found" }, { status: 404 });
    }

    // 4. Perform the deletion
    await prisma.homework.delete({
      where: { id },
    });

    // 5. Trigger revalidation so the UI updates for everyone
    revalidatePath(`/dashboard/timetables/${homework.timetableId}`);
    revalidatePath(`/shared/${homework.timetableId}`);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}