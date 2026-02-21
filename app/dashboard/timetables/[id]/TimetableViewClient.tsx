"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"

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

  // Homework Form State
  const [hwTitle, setHwTitle] = useState("")
  const [hwDesc, setHwDesc] = useState("")
  const [hwLoading, setHwLoading] = useState(false)

  // Determine if the current student has already marked attendance today
  const hasAttendedToday = role === "STUDENT" && attendances.some(att => {
    // att has studentId from Prisma relation
    if (att.studentId !== userId) return false;
    const attDate = new Date(att.date)
    const today = new Date()
    return attDate.toDateString() === today.toDateString()
  })

  useEffect(() => {
    if (["ADMIN", "LECTURER"].includes(role)) {
      // Generate QR Code containing the check-in URL
      const checkInUrl = `${window.location.origin}/dashboard/timetables/${timetableId}/check-in`
      QRCode.toDataURL(checkInUrl, { width: 300, margin: 2, color: { dark: '#000', light: '#fff' } })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error(err))
    }
  }, [role, timetableId])

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
        setMessage("Success! You're checked in to class.")
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
      <div className="flex justify-end">
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-600 transition-colors text-sm font-medium shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          {copied ? "Copied Link!" : "Share Public View"}
        </button>
      </div>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}
      
      {/* Student View */}
      {role === "STUDENT" && (
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl flex flex-col items-center justify-center min-h-[250px] shadow-inner text-center">
          {hasAttendedToday ? (
            <div>
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-xl font-medium text-green-400">Attendance marked for today!</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 mb-6 font-medium">Ready to join the class? Tap the button below to mark your presence.</p>
              <button
                onClick={handleMarkAttendance}
                disabled={loading}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? "Marking..." : "Mark Attendance"}
              </button>
              {message && <p className={`mt-4 text-sm font-medium ${message.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
            </div>
          )}
        </div>
      )}

      {/* Lecturer/Admin View */}
      {["ADMIN", "LECTURER"].includes(role) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center justify-center shadow-md">
            <h3 className="text-gray-800 font-bold mb-4 text-lg">Scan to check-in</h3>
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code for Attendance Check In" className="w-64 h-64 border border-gray-200 rounded-lg" />
            ) : (
              <div className="w-64 h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Generating...</div>
            )}
            <p className="text-sm text-gray-500 mt-4 text-center">Students can scan this code with their ClassFlow app or camera.</p>
          </div>

          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl flex flex-col h-full max-h-[400px]">
            <h3 className="text-white font-bold mb-4 text-lg flex justify-between items-center">
              Attendance Log
              <span className="text-xs font-semibold px-2 py-1 bg-brand-900 text-brand-300 rounded-lg">{attendances.length} total</span>
            </h3>
            <div className="overflow-y-auto pr-2 space-y-3 flex-1 scrollbar-thin scrollbar-thumb-gray-700">
              {attendances.length === 0 ? (
                <p className="text-gray-500 text-center mt-10 text-sm">No attendance records yet.</p>
              ) : (
                attendances.map((att: any) => (
                  <div key={att.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-white font-medium text-sm">{att.student.name || att.student.email}</p>
                      <p className="text-gray-500 text-xs">{new Date(att.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                ))
              )}
            </div>
        </div>
      )}
      
      {/* Homework & Notes Section */}
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-inner mt-8">
        <h3 className="text-xl font-bold text-white mb-6">Homework & Notes</h3>
        
        {["ADMIN", "LECTURER"].includes(role) && (
          <form onSubmit={handleAddHomework} className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Add New Task</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Task Title..." 
                required 
                value={hwTitle}
                onChange={(e) => setHwTitle(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-brand-500"
              />
              <input 
                type="text" 
                placeholder="Description (optional)..." 
                value={hwDesc}
                onChange={(e) => setHwDesc(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white outline-none focus:border-brand-500"
              />
            </div>
            <button 
              type="submit" 
              disabled={hwLoading}
              className="px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {hwLoading ? "Saving..." : "Save Homework"}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {homeworks.length === 0 ? (
            <p className="text-gray-500 italic">No homeworks or notes have been posted for this slot yet.</p>
          ) : (
            homeworks.map(hw => (
              <div key={hw.id} className="p-4 bg-gray-800 border-l-4 border-brand-500 rounded-lg">
                <h4 className="text-lg font-bold text-white mb-1">{hw.title}</h4>
                {hw.description && <p className="text-gray-400 text-sm mb-2">{hw.description}</p>}
                <span className="text-xs text-gray-500">Posted: {new Date(hw.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
