// app/dashboard/notes/page.tsx
// Server component – loads user's timetable slots + notes, then renders the client

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import NotesClient from "@/app/dashboard/notes/NotesClient"

export default async function NotesPage({
    searchParams,
}: {
    searchParams: Promise<{ timetableId?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/auth/login")

    const { timetableId } = await searchParams

    // Fetch the user's timetable slots for the subject picker
    const slots = await prisma.timetable.findMany({
        where: { userId: session.user.id },
        orderBy: [{ day: "asc" }, { time: "asc" }],
        select: { id: true, subject: true, day: true, time: true },
    })

    // Fetch own notes (plus public notes from others sharing same subjects)
    const mySubjects = [...new Set(slots.map(s => s.subject))]

    const notes = await prisma.note.findMany({
        where: {
            OR: [
                // All of my own notes
                { userId: session.user.id },
                // Public notes from others who share my subjects
                {
                    isPublic: true,
                    subject: { in: mySubjects },
                    userId: { not: session.user.id },
                },
            ],
        },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
    })

    const serialisedNotes = notes.map(n => ({
        id: n.id,
        title: n.title,
        description: n.description,
        fileUrl: n.fileUrl,
        fileName: n.fileName,
        isPublic: n.isPublic,
        subject: n.subject,
        timetableId: n.timetableId,
        userId: n.userId,
        uploaderName: n.user.name,
        createdAt: n.createdAt.toISOString(),
    }))

    return (
        <NotesClient
            slots={slots}
            initialNotes={serialisedNotes}
            currentUserId={session.user.id}
            defaultTimetableId={timetableId}
        />
    )
}
