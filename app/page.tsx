// page.tsx

// root page component - for all pages


import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Header } from "@/components/Header";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-900 dark:text-white">
        <div className="max-w-2xl w-full p-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-xl shadow-xl space-y-6">
          <h1 className="text-4xl font-extrabold text-brand-600 dark:text-brand-500 tracking-tight">Welcome to ClassFlow</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Responsive timetable and attendance management system tailored for Kenyan institutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            {session ? (
              <Link 
                href="/dashboard"
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/register"
                  className="px-6 py-3 bg-transparent border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
