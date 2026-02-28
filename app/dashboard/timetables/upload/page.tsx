// dashboard/timetables/upload/page.tsx

// upload timetable page - for admin and lecturer users to upload timetable slots

"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    UploadCloud, FileType2, ImageIcon, FileSpreadsheet,
    Loader2, CheckCircle2, AlertCircle, Plus, Trash2
} from "lucide-react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

type Slot = {
    subject: string
    day: string
    time: string
    location: string
    lecturer: string
}

type Status = "idle" | "uploading" | "reviewing" | "saving" | "done" | "error"

export default function UploadTimetablePage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [status, setStatus] = useState<Status>("idle")
    const [errorMsg, setErrorMsg] = useState("")
    const [slots, setSlots] = useState<Slot[]>([])
    const [savedCount, setSavedCount] = useState(0)
    const [instruction, setInstruction] = useState("")

    // ── file helpers ────────────────────────────────────────────────────────────
    const pickFile = (f: File) => {
        setFile(f)
        setStatus("idle")
        setSlots([])
        setErrorMsg("")
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0])
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) pickFile(e.target.files[0])
    }

    // ── extract via API ─────────────────────────────────────────────────────────
    const handleExtract = async () => {
        if (!file) return
        setStatus("uploading")
        setErrorMsg("")

        try {
            const form = new FormData()
            form.append("file", file)
            if (instruction.trim()) {
                form.append("instruction", instruction.trim())
            }

            const res = await fetch("/api/timetables/parse", { method: "POST", body: form })
            const data = await res.json()

            if (!res.ok) throw new Error(data.message || "Extraction failed")

            setSlots(data.slots)
            setStatus("reviewing")
        } catch (err: any) {
            setErrorMsg(err.message)
            setStatus("error")
        }
    }

    // ── inline edit helpers ─────────────────────────────────────────────────────
    const updateSlot = (i: number, key: keyof Slot, value: string) => {
        setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: value } : s))
    }

    const removeSlot = (i: number) => setSlots(prev => prev.filter((_, idx) => idx !== i))

    const addEmptySlot = () => {
        setSlots(prev => [...prev, { subject: "", day: "Monday", time: "08:00", location: "", lecturer: "" }])
    }

    // ── bulk save ───────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setStatus("saving")
        let count = 0
        const errors: string[] = []

        for (const slot of slots) {
            const res = await fetch("/api/timetables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(slot),
            })
            if (res.ok) count++
            else {
                const d = await res.json()
                errors.push(d.message || "Unknown error")
            }
        }

        setSavedCount(count)
        if (errors.length) {
            setErrorMsg(`${count} slots saved. ${errors.length} failed: ${errors.join("; ")}`)
        }
        setStatus("done")
        setTimeout(() => router.push("/dashboard/timetables"), 2500)
    }

    // ── render ──────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-5xl mx-auto md:p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Upload Timetable</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                Upload a PDF, image, or spreadsheet. AI will extract your classes for you to review before saving.
            </p>

            {/* File type badges */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "PDF", sub: ".pdf", Icon: FileType2, color: "red" },
                    { label: "Image", sub: ".jpg / .png", Icon: ImageIcon, color: "blue" },
                    { label: "S/sheet", sub: ".xlsx, .csv", Icon: FileSpreadsheet, color: "green" },
                ].map(({ label, sub, Icon, color }) => (
                    <div key={label} className="md:p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-1 md:gap-4">
                        <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 rounded-lg`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-xs text-wrap md:text-sm">{label}</p>
                            <p className="text-xs text-gray-500">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Drop zone */}
            {status !== "reviewing" && status !== "done" && (
                <div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${isDragging
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10"
                        : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <UploadCloud className={`w-14 h-14 mx-auto mb-4 ${isDragging ? "text-brand-500" : "text-gray-400"}`} />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {file ? file.name : "Drag & drop your file here"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, PNG, JPG, XLSX, CSV"}
                    </p>
                    <input type="file" id="file-upload" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="cursor-pointer px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors inline-block text-sm">
                        Browse Files
                    </label>
                </div>
            )}

            {/* Extract button / AI thinking / Instruction Prompt */}
            {file && status === "idle" && (
                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-white dark:bg-gray-800 border-2 border-brand-100 dark:border-brand-900/30 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-brand-600 dark:text-brand-400">
                            <Plus className="w-5 h-5 text-white bg-brand-600 rounded-full" />
                            <h3 className="font-bold">Custom AI Instructions (Recommended)</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Is your file cluttered? Tell the AI exactly what to look for. (e.g., &quot;Extract only units for BTIT/SEP2022-JFT course&quot;).
                        </p>
                        <textarea
                            value={instruction}
                            onChange={(e) => setInstruction(e.target.value)}
                            placeholder="e.g. Filter by course code, ignore certain lecturers, or specify a department..."
                            className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button onClick={handleExtract} className="px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-xl shadow-brand-600/30 transition-all flex items-center gap-2 group">
                            Extract with AI
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            )}

            {status === "uploading" && (
                <div className="mt-10 flex flex-col items-center gap-4 py-12">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-brand-200 dark:border-blue border-t-brand-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl">🤖</span>
                        </div>
                    </div>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">AI is reading your timetable…</p>
                    <p className="text-sm text-gray-500">This usually takes 5–15 seconds</p>
                </div>
            )}

            {/* Error */}
            {status === "error" && (
                <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold">Extraction failed</p>
                        <p className="text-sm mt-0.5">{errorMsg}</p>
                        <button onClick={() => setStatus("idle")} className="mt-3 text-sm underline">Try again</button>
                    </div>
                </div>
            )}

            {/* ── Review Table ────────────────────────────────────────────────────── */}
            {status === "reviewing" && (
                <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="md:flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Extracted Classes</h2>
                            <p className="text-sm text-gray-500">Edit any cell before saving. Remove rows you don&apos;t need.</p>
                        </div>
                        <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-sm font-semibold rounded-full border border-brand-200 dark:border-brand-800">
                            {slots.length} slot{slots.length !== 1 ? "s" : ""} found
                        </span>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                <tr>
                                    {["Subject / Course", "Day", "Time (24h)", "Room / Location", "Lecturer / Instructor", ""].map(h => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {slots.map((slot, i) => (
                                    <tr key={i} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                        <td className="px-3 py-2">
                                            <input value={slot.subject} onChange={e => updateSlot(i, "subject", e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none py-1 transition-colors" placeholder="Subject" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <select value={slot.day} onChange={e => updateSlot(i, "day", e.target.value)} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none py-1 cursor-pointer">
                                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input type="time" value={slot.time} onChange={e => updateSlot(i, "time", e.target.value)} className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none py-1 transition-colors" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input value={slot.location} onChange={e => updateSlot(i, "location", e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none py-1 transition-colors" placeholder="Room" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input value={slot.lecturer} onChange={e => updateSlot(i, "lecturer", e.target.value)} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none py-1 transition-colors" placeholder="Lecturer" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <button onClick={() => removeSlot(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 md:flex justify-between items-center">
                        <button onClick={addEmptySlot} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800 transition-colors font-medium">
                            <Plus className="w-4 h-4" /> Add row
                        </button>
                        <div className="flex gap-3">
                            <button onClick={() => { setStatus("idle"); setSlots([]) }} className="px-5 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 font-medium transition-colors">
                                ← Re-upload
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={slots.length === 0}
                                className="px-8 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-brand-600/30 transition-all"
                            >
                                Save {slots.length} slots to My Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status === "saving" && (
                <div className="mt-10 flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                    <p className="text-gray-900 dark:text-white font-medium">Saving your schedule…</p>
                </div>
            )}

            {status === "done" && (
                <div className="mt-10 flex flex-col items-center gap-3">
                    <CheckCircle2 className="w-14 h-14 text-green-500" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {savedCount} slots saved!
                    </p>
                    {errorMsg && <p className="text-sm text-red-500 max-w-md text-center">{errorMsg}</p>}
                    <p className="text-sm text-gray-500">Redirecting to your timetable…</p>
                </div>
            )}
        </div>
    )
}
