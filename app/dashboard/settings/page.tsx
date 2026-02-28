// dashboard/settings/page.tsx

// settings page - for users to manage their account preferences and personal configurations
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Save } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [leadTime, setLeadTime] = useState(30)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/user/settings")
        if (res.ok) {
          const data = await res.json()
          if (data.notificationLeadTime) {
            setLeadTime(data.notificationLeadTime)
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: "", type: "" })

    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationLeadTime: leadTime }),
      })

      if (res.ok) {
        setMessage({ text: "Settings saved successfully!", type: "success" })
      } else {
        const data = await res.json()
        setMessage({ text: data.message || "Failed to save settings.", type: "error" })
      }
    } catch (error) {
      setMessage({ text: "An error occurred while saving.", type: "error" })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage({ text: "", type: "" }), 5000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-pulse text-gray-500">
        Loading preferences...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Manage your user preferences and personal configurations.
      </p>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure when you want to receive class reminders.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Lead Time (Minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="5"
                max="120"
                required
                value={leadTime}
                onChange={(e) => setLeadTime(Math.max(5, Math.min(120, Number(e.target.value))))}
                className="w-32 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              />
              <span className="text-gray-500 text-sm">minutes before class starts</span>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              We&apos;ll check your timetable and send a browser notification this many minutes before the class begins. The default is 30 minutes.
            </p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm transition-all"
            >
              <Save className="w-5 h-5" />
              {saving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
