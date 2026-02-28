// auth/register/page.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { User, GraduationCap, ChevronRight } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("STUDENT")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      if (res.ok) {
        toast.success("Account created! Please sign in.")
        router.push("/auth/login")
      } else {
        const data = await res.json()
        toast.error(data.message || "Registration failed")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl p-8 space-y-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create your account</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Join ClassFlow to master your academic schedule</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === "STUDENT"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                  : "border-gray-100 dark:border-gray-700 hover:border-brand-200"
                }`}
            >
              <User className="w-8 h-8" />
              <span className="font-bold text-sm">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("LECTURER")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === "LECTURER"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                  : "border-gray-100 dark:border-gray-700 hover:border-brand-200"
                }`}
            >
              <GraduationCap className="w-8 h-8" />
              <span className="font-bold text-sm">Lecturer</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 mt-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-5 py-4 mt-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="youremail@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                required
                className="w-full px-5 py-4 mt-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-600 dark:text-brand-400 hover:underline font-bold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
