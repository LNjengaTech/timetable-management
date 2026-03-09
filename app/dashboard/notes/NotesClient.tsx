// app/dashboard/notes/NotesClient.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { BookOpen, Upload, Lock, Globe, Trash2, FileText, Plus, X, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

type Slot = { id: string; subject: string; day: string; time: string }

type Note = {
    id: string
    title: string
    description: string | null
    fileUrl: string
    fileName: string
    isPublic: boolean
    subject: string
    timetableId: string
    userId: string
    uploaderName: string | null
    createdAt: string
}

type Props = {
    slots: Slot[]
    initialNotes: Note[]
    currentUserId: string
    defaultTimetableId?: string
}

export default function NotesClient({ slots, initialNotes, currentUserId, defaultTimetableId }: Props) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [notes, setNotes] = useState<Note[]>(initialNotes)
    const [showForm, setShowForm] = useState(!!defaultTimetableId)
    const [submitting, setSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filterSubject, setFilterSubject] = useState<string>("all")
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Form state
    const [formTimetableId, setFormTimetableId] = useState(defaultTimetableId || "")
    const [formTitle, setFormTitle] = useState("")
    const [formDescription, setFormDescription] = useState("")
    const [formIsPublic, setFormIsPublic] = useState(false)

    // Derive unique subjects from user's own notes for filter tabs
    const mySubjects = [...new Set(slots.map(s => s.subject))].sort()

    // Filtered notes
    const filtered =
        filterSubject === "all"
            ? notes
            : notes.filter(n => n.subject === filterSubject)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) {
            if (f.type !== "application/pdf") {
                setError("Only PDF files are accepted")
                setSelectedFile(null)
                return
            }
            setSelectedFile(f)
            setError(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile) { setError("Please select a PDF file"); return }
        if (!formTimetableId) { setError("Please select a subject"); return }
        if (!formTitle.trim()) { setError("Please enter a title"); return }

        setSubmitting(true)
        setError(null)

        const fd = new FormData()
        fd.append("file", selectedFile)
        fd.append("title", formTitle.trim())
        fd.append("description", formDescription.trim())
        fd.append("timetableId", formTimetableId)
        fd.append("isPublic", String(formIsPublic))

        try {
            const res = await fetch("/api/notes", { method: "POST", body: fd })
            const data = await res.json()
            if (!res.ok) { setError(data.message || "Upload failed"); return }

            const n = data.note
            setNotes(prev => [
                {
                    id: n.id,
                    title: n.title,
                    description: n.description,
                    fileUrl: n.fileUrl,
                    fileName: n.fileName,
                    isPublic: n.isPublic,
                    subject: n.subject,
                    timetableId: n.timetableId,
                    userId: n.userId,
                    uploaderName: n.user?.name ?? null,
                    createdAt: n.createdAt,
                },
                ...prev,
            ])
            setSuccess("Note uploaded successfully!")
            setFormTitle("")
            setFormDescription("")
            setFormIsPublic(false)
            setSelectedFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ""
            setShowForm(false)
            router.refresh()
            setTimeout(() => setSuccess(null), 3000)
        } catch {
            setError("Network error. Please try again.")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this note? This cannot be undone.")) return
        setDeletingId(id)
        try {
            const res = await fetch(`/api/notes/${id}`, { method: "DELETE" })
            if (res.ok) setNotes(prev => prev.filter(n => n.id !== id))
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <div className="max-w-5xl mx-auto md:p-8 p-2 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-brand-600 dark:text-brand-400" />
                        My Notes
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Upload and manage PDF notes tied to your subjects
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg transition-colors shadow-sm text-sm"
                >
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showForm ? "Cancel" : "Upload"}
                </button>
            </div>

            {/* Success banner */}
            {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl text-sm font-medium">
                    ✓ {success}
                </div>
            )}

            {/* Upload Form */}
            {showForm && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload New Note</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Subject picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            {slots.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">
                                    You have no timetable slots yet. Add classes first.
                                </p>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={formTimetableId}
                                        onChange={e => setFormTimetableId(e.target.value)}
                                        required
                                        className="w-full appearance-none bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    >
                                        <option value="">— select a subject —</option>
                                        {slots.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.subject} ({s.day} {s.time})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                placeholder="e.g. Week 3 Lecture Notes"
                                required
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={formDescription}
                                onChange={e => setFormDescription(e.target.value)}
                                rows={2}
                                placeholder="Brief summary of the notes…"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            />
                        </div>

                        {/* File input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                PDF File <span className="text-red-500">*</span>
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-3 w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-brand-400 dark:hover:border-brand-500 rounded-xl p-4 cursor-pointer transition-colors group"
                            >
                                <FileText className="w-8 h-8 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" />
                                <div className="text-sm">
                                    {selectedFile ? (
                                        <span className="font-medium text-brand-600 dark:text-brand-400">{selectedFile.name}</span>
                                    ) : (
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Click to browse — <span className="font-medium">PDF only</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Visibility toggle */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visibility:</span>
                            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
                                <button
                                    type="button"
                                    onClick={() => setFormIsPublic(false)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${!formIsPublic
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 dark:text-gray-400"
                                        }`}
                                >
                                    <Lock className="w-3.5 h-3.5" /> Private
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormIsPublic(true)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${formIsPublic
                                            ? "bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm"
                                            : "text-gray-500 dark:text-gray-400"
                                        }`}
                                >
                                    <Globe className="w-3.5 h-3.5" /> Public
                                </button>
                            </div>
                            <span className="text-xs text-gray-400">
                                {formIsPublic
                                    ? "Anyone with the same subject can see this"
                                    : "Only you can see this"}
                            </span>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || slots.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm shadow-sm"
                        >
                            <Upload className="w-4 h-4" />
                            {submitting ? "Uploading…" : "Upload Note"}
                        </button>
                    </form>
                </div>
            )}

            {/* Subject filter tabs */}
            {notes.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setFilterSubject("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterSubject === "all"
                                ? "bg-brand-600 text-white"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                    >
                        All
                    </button>
                    {mySubjects.map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterSubject(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterSubject === s
                                    ? "bg-brand-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Notes list */}
            {filtered.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        {notes.length === 0 ? "No notes yet" : "No notes for this subject"}
                    </h2>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        {notes.length === 0
                            ? "Upload your first PDF note using the button above"
                            : "Try a different subject filter"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(note => {
                        const isOwn = note.userId === currentUserId
                        return (
                            <div
                                key={note.id}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                            >
                                {/* Subject + visibility badge */}
                                <div className="flex items-center justify-between gap-2">
                                    <span className="px-2 py-0.5 text-xs font-semibold bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full border border-brand-100 dark:border-brand-800 truncate max-w-[60%]">
                                        {note.subject}
                                    </span>
                                    <span
                                        className={`flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${note.isPublic
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800"
                                                : "bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                                            }`}
                                    >
                                        {note.isPublic ? (
                                            <><Globe className="w-3 h-3" /> Public</>
                                        ) : (
                                            <><Lock className="w-3 h-3" /> Private</>
                                        )}
                                    </span>
                                </div>

                                {/* Title & description */}
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{note.title}</h3>
                                    {note.description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{note.description}</p>
                                    )}
                                </div>

                                {/* Uploader + date */}
                                <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                    {!isOwn && note.uploaderName && (
                                        <><span className="font-medium text-gray-500 dark:text-gray-400">{note.uploaderName}</span><span>·</span></>
                                    )}
                                    {isOwn && <><span className="font-medium text-brand-600 dark:text-brand-400">You</span><span>·</span></>}
                                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <a
                                        href={note.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800 font-semibold text-sm rounded-lg transition-colors"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Open PDF
                                    </a>
                                    {isOwn && (
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            disabled={deletingId === note.id}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                            title="Delete note"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
