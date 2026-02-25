// dashboard/layout.tsx

// dashboard layout component - for admin and lecturer users to navigate between different pages

import { Sidebar } from "@/components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[100dvh] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors relative">
      <Sidebar />
      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-[100dvh]">
        <div className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
