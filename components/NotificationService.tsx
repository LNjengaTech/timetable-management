//components/NotificationService.tsx

//Notification service component for handling real-time notifications

"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export default function NotificationService() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session) return

    let isPolling = true
    let notifiedIds = new Set<string>()

    const checkNotifications = async () => {
      if (!isPolling) return
      
      try {
        const res = await fetch("/api/notifications")
        if (res.ok) {
          const { upcoming } = await res.json()
          
          if (upcoming && upcoming.length > 0) {
            // Request permission if not granted
            if (Notification.permission === "default") {
              await Notification.requestPermission()
            }

            if (Notification.permission === "granted") {
              upcoming.forEach((slot: any) => {
                if (!notifiedIds.has(slot.id)) {
                  new Notification(`Upcoming Class: ${slot.subject}`, {
                    body: `Starts at ${slot.time} in ${slot.location}. Lecturer: ${slot.lecturer}`,
                    icon: "/favicon.ico"
                  })
                  notifiedIds.add(slot.id)
                }
              })
            }
          }
        }
      } catch (err) {
        console.error("Notification polling failed", err)
      }
    }

    // Initial check
    checkNotifications()

    // Poll every 30 minutes (1800000 ms)
    const interval = setInterval(checkNotifications, 1800000)

    return () => {
      isPolling = false
      clearInterval(interval)
    }
  }, [session])

  return null // Headless service component
}
