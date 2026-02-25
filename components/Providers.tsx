//components/Providers.tsx

//Providers component for handling authentication and theme

"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import NotificationService from "./NotificationService"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <NotificationService />
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}
