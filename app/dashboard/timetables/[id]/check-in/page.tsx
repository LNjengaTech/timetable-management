// dashboard/timetables/[id]/check-in/page.tsx

// check-in page - for students to mark their attendance for a specific class

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function CheckInPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [status, setStatus] = useState("Checking in...")

  useEffect(() => {
    async function markAttendance() {
      try {
        const res = await fetch("/api/attendance/mark", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timetableId: params.id }),
        })

        if (res.ok) {
          setStatus("Success! Redirecting back to class page...")
          setTimeout(() => router.push(`/dashboard/timetables/${params.id}`), 2000)
        } else {
          const data = await res.json()
          setStatus(`Failed: ${data.message}`)
          setTimeout(() => router.push(`/dashboard/timetables/${params.id}`), 3000)
        }
      } catch (e) {
        setStatus("An error occurred")
      }
    }
    markAttendance()
  }, [params.id, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-8">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 text-center max-w-sm w-full"
      >
        <div className="w-16 h-16 mx-auto mb-6">
          {status.includes("Success") ? (
             <svg className="w-full h-full text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : status.includes("Checking") ? (
             <svg className="w-full h-full text-brand-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          ) : (
             <svg className="w-full h-full text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{status}</h2>
      </motion.div>
    </div>
  )
}
