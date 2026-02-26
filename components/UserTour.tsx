// components/UserTour.tsx
//uses react-joyride for the tour

"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"

const Joyride = dynamic(() => import("react-joyride"), { ssr: false })

export default function UserTour() {
    const { data: session } = useSession()
    const [run, setRun] = useState(false)

    useEffect(() => {
        //check if user has seen the tour before
        const hasSeenTour = localStorage.getItem("hasSeenTour")
        if (session?.user && !hasSeenTour) {
            setRun(true)
        }
    }, [session])

    const steps = [
        {
            target: "body",
            content: "Welcome to ClassFlow! Let's take a quick tour of your new student portal.",
            placement: "center" as const,
        },
        {
            target: "[href='/dashboard/timetables']",
            content: "First, upload your timetable. Our AI will automatically extract your classes!",
            placement: "right" as const,
        },
        {
            target: "[href='/dashboard/calendar']",
            content: "View your color-coded schedule in our interactive calendar.",
            placement: "right" as const,
        },
        {
            target: ".streak-stats", //added this class to a widget in the dashboard
            content: "Track your attendance streaks and earn points for being consistent!",
            placement: "bottom" as const,
        },
        {
            target: ".theme-toggle",
            content: "Burning the midnight oil? Switch to dark mode here.",
            placement: "bottom" as const,
        },
    ]

    const handleJoyrideCallback = (data: any) => {
        const { status } = data
        if (["finished", "skipped"].includes(status)) {
            localStorage.setItem("hasSeenTour", "true")
            setRun(false)
        }
    }

    return (
        <Joyride
            run={run}
            steps={steps}
            continuous
            showProgress
            showSkipButton
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    primaryColor: "#059669", // brand-600
                    zIndex: 1000,
                },
            }}
        />
    )
}
