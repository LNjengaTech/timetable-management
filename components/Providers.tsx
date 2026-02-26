// components/Providers.tsx

//wraps the app with providers for session, theme, toast and notifications

"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import NotificationService from "./NotificationService"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <NotificationService />
        <Toaster position="top-center" richColors />
        {children}
      </SessionProvider>
    </ThemeProvider>
  )
}
