"use client"

import { useState } from "react"
import { UploadCloud, FileType2, Image as ImageIcon, FileSpreadsheet } from "lucide-react"

export default function UploadTimetablePage() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    // Placeholder logic for future AI processing API
    setTimeout(() => {
      alert("This feature is a skeleton UI. Connecting to AI services (like OpenAI/Gemini) is required to automatically parse text from images and PDFs into timetable slots.")
      setIsUploading(false)
      setFile(null)
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Upload Timetable (Automatic)</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Upload an image, PDF, or spreadsheet of your timetable. The system will attempt to automatically extract schedules into slots.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            <FileType2 className="w-6 h-6" />
          </div>
          <div><p className="font-semibold text-gray-900 dark:text-white">PDF</p><p className="text-xs text-gray-500">.pdf files</p></div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div><p className="font-semibold text-gray-900 dark:text-white">Images</p><p className="text-xs text-gray-500">.jpg, .png</p></div>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div><p className="font-semibold text-gray-900 dark:text-white">Spreadsheet</p><p className="text-xs text-gray-500">.xlsx, .csv</p></div>
        </div>
      </div>

      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
          isDragging 
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/10" 
            : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadCloud className={`w-16 h-16 mx-auto mb-4 ${isDragging ? "text-brand-500" : "text-gray-400"}`} />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {file ? file.name : "Drag & drop your file here"}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {file ? `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDF, PNG, JPG, JPEG, CSV, XLSX"}
        </p>

        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors inline-block"
        >
          Browse Files
        </label>
      </div>

      {file && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isUploading ? "Simulating AI Extraction..." : "Extract Timetable"}
          </button>
        </div>
      )}
    </div>
  )
}
