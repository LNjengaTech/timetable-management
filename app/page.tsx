// page.tsx

"use client"

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { CheckCircle, Clock, Award, Users, ArrowRight, Calendar as CalendarIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LandingContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const timetableId = searchParams.get("timetable");
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (timetableId) {
      setShowPreview(true);
    }
  }, [timetableId]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors selection:bg-brand-100 dark:selection:bg-brand-900">
      <Header />

      <main className="flex-1">
        {/* Shared Timetable Overlay */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden relative"
              >
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6 text-brand-600 dark:text-brand-400">
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold dark:text-white mb-2">Wait! A friend shared a timetable with you</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Import this schedule to your own ClassFlow account to sync up and coordinate study sessions.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Link
                      href={`/dashboard/timetables/import?id=${timetableId}`}
                      className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl transition-all"
                    >
                      Import to My Account
                    </Link>
                    <Link
                      href="/dashboard/demo"
                      className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl transition-all"
                    >
                      View as Guest First
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
            style={{ backgroundImage: 'url("/campus-hero.png")' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/60 to-gray-900 dark:from-gray-900/80 dark:to-black/90" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight"
            >
              Master Your Schedule with <span className="text-brand-500">ClassFlow</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed font-light"
            >
              Track timetables, monitor attendance, and never miss a class. Join thousands of Kenyan students optimizing their academic journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              {session ? (
                <Link
                  href="/dashboard"
                  className="group px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-full transition-all hover:shadow-xl hover:shadow-brand-500/20 flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="w-full sm:w-auto px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-full transition-all hover:shadow-xl hover:shadow-brand-500/20 flex items-center justify-center"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/dashboard/demo"
                    className="w-full sm:w-auto px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full backdrop-blur-md border border-white/30 transition-all flex items-center justify-center"
                  >
                    Try as Guest
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </section>

        {/* Value Props Section */}
        <section id="features" className="py-24 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold dark:text-white mb-4">Why ClassFlow?</h2>
              <div className="w-20 h-1.5 bg-brand-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Clock, title: "Upload in Seconds", desc: "Drag and drop your PDF or image timetable and let AI do the work." },
                { icon: CheckCircle, title: "Smart Reminders", desc: "Get notified before every class via browser or mobile alerts." },
                { icon: Award, title: "Earn Badges", desc: "Level up your academic streak and earn rewards for attendance." },
                { icon: Users, title: "Share with Buddies", desc: "Sync timetables with friends and coordinate study groups effortlessly." }
              ].map((prop, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
                >
                  <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <prop.icon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 dark:text-white">{prop.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{prop.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-brand-600 dark:bg-brand-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to take control of your time?</h2>
            <Link
              href="/auth/register"
              className="px-12 py-5 bg-white text-brand-600 hover:bg-gray-100 font-extrabold rounded-full transition-all shadow-2xl hover:scale-105 inline-block"
            >
              Join ClassFlow Today
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-extrabold text-brand-600 dark:text-brand-500 tracking-tight">
              ClassFlow
            </div>
            <div className="flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
              <Link href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-brand-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-brand-600 transition-colors">Contact Support</Link>
            </div>
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} ClassFlow. Made for Kenyan Scholars.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <LandingContent />
    </Suspense>
  )
}
