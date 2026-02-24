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

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                notificationLeadTime: true,
                name: true,
                email: true,
                role: true
            }
        });

        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error("Settings GET Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { notificationLeadTime } = await req.json();

        // Validate
        const leadTime = parseInt(notificationLeadTime);
        if (isNaN(leadTime) || leadTime < 5 || leadTime > 120) {
            return NextResponse.json({ message: "Lead time must be between 5 and 120 minutes." }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { notificationLeadTime: leadTime }
        });

        return NextResponse.json({ message: "Settings updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Settings POST Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
