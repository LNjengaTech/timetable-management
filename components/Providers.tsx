"use client"

import { SessionProvider } from "next-auth/react"
import NotificationService from "./NotificationService"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationService />
      {children}
    </SessionProvider>
  )
}
