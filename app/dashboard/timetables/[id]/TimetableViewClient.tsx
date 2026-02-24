"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"
import { CheckCircle2, Share2 } from "lucide-react"

interface TimetableViewClientProps {
  timetableId: string
  role: string
  userId: string
  attendances: any[]
  homeworks?: any[]
}

export default function TimetableViewClient({ timetableId, role, userId, attendances, homeworks = [] }: TimetableViewClientProps) {
  const router = useRouter()
  const { width, height } = useWindowSize()
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showConfetti, setShowConfetti] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // Homework Form State
  const [hwTitle, setHwTitle] = useState("")
  const [hwDesc, setHwDesc] = useState("")
  const [hwLoading, setHwLoading] = useState(false)

  // Determine if the current user has already marked attendance today
  const hasAttendedToday = attendances.some(att => {
    if (att.studentId !== userId) return false;
    const attDate = new Date(att.date)
    const today = new Date()
    return attDate.toDateString() === today.toDateString()
  })

  useEffect(() => {
    if (showQR) {
      const checkInUrl = `${window.location.origin}/dashboard/timetables/${timetableId}/check-in`
      QRCode.toDataURL(checkInUrl, { width: 300, margin: 2, color: { dark: '#000', light: '#fff' } })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error(err))
    }
  }, [showQR, timetableId])

  const handleMarkAttendance = async () => {
    setLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetableId }),
      })

      if (res.ok) {
        setShowConfetti(true)
        setMessage("🎉 Attendance marked! Keep your streak going!")
        setTimeout(() => setShowConfetti(false), 5000)
        router.refresh()
      } else {
        const data = await res.json()
        setMessage(data.message || "Failed to mark attendance")
      }
    } catch (error) {
      setMessage("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault()
    setHwLoading(true)
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: hwTitle, description: hwDesc, timetableId }),
      })
      if (res.ok) {
        setHwTitle("")
        setHwDesc("")
        router.refresh()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setHwLoading(false)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/shared/${timetableId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-8">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}

      {/* Top Actions Bar */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          {copied ? "Copied!" : "Share Public View"}
        </button>

        {/* Lecturers/Admins can toggle QR code */}
        {["ADMIN", "LECTURER"].includes(role) && (
          <button
            onClick={() => setShowQR(v => !v)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors text-sm font-medium"
          >
            {showQR ? "Hide QR Code" : "Show QR Code"}
          </button>
        )}
      </div>

      {/* ===== PRIMARY: Attendance Card (for the owner/student) ===== */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-8 rounded-xl flex flex-col items-center justify-center min-h-[220px] shadow-inner text-center">
        {hasAttendedToday ? (
          <div className="space-y-2">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">You&apos;re marked present today!</p>
            <p className="text-sm text-gray-500">Great job keeping your streak alive.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-gray-300 font-medium">Ready to confirm your attendance?</p>
            <button
              onClick={handleMarkAttendance}
              disabled={loading}
              className="px-10 py-4 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold text-lg rounded-full shadow-lg shadow-brand-600/30 dark:shadow-brand-900/40 transition-all disabled:opacity-50"
            >
              {loading ? "Marking..." : "✓ Mark Attendance"}
            </button>
            {message && (
              <p className={`mt-3 text-sm font-medium ${message.includes('🎉') || message.includes('marked') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ===== QR Code Section (toggled by Lecturers/Admins) ===== */}
      {showQR && (
        <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center shadow-md border border-gray-100">
          <h3 className="text-gray-800 font-bold mb-4 text-lg">QR Code – Scan to Check-In</h3>
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code for Attendance Check In" className="w-64 h-64 border border-gray-200 rounded-lg" />
          ) : (
            <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Generating...</div>
          )}
          <p className="text-sm text-gray-400 mt-4 text-center">Students scan this to mark attendance.</p>
        </div>
      )}

      {/* ===== Attendance Log (Lecturers/Admins) ===== */}
      {["ADMIN", "LECTURER"].includes(role) && attendances.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-xl">
          <h3 className="text-gray-900 dark:text-white font-bold mb-4 text-lg flex justify-between items-center">
            Attendance Log
            <span className="text-xs font-semibold px-2 py-1 bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-lg">{attendances.length} total</span>
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {attendances.map((att: any) => (
              <div key={att.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{att.student?.name || att.student?.email}</p>
                  <p className="text-gray-500 text-xs">{new Date(att.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Homework & Notes Section ===== */}
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-inner">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Homework & Notes</h3>

        {["ADMIN", "LECTURER"].includes(role) && (
          <form onSubmit={handleAddHomework} className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-3 uppercase tracking-wider">Add New Task</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Task Title..."
                required
                value={hwTitle}
                onChange={(e) => setHwTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:border-brand-500"
              />
              <input
                type="text"
                placeholder="Description (optional)..."
                value={hwDesc}
                onChange={(e) => setHwDesc(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={hwLoading}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {hwLoading ? "Saving..." : "Save Note"}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {homeworks.length === 0 ? (
            <p className="text-gray-400 italic text-sm">No homework or notes have been added to this slot yet.</p>
          ) : (
            homeworks.map(hw => (
              <div key={hw.id} className="p-4 bg-white dark:bg-gray-800 border-l-4 border-brand-500 rounded-lg shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{hw.title}</h4>
                {hw.description && <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{hw.description}</p>}
                <span className="text-xs text-gray-400">Posted: {new Date(hw.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
